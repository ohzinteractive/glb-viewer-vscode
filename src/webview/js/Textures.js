import { Mesh, MeshBasicMaterial, OrthographicCamera, PlaneGeometry, Scene, WebGLRenderTarget } from 'three';
import { ResizableWindow } from './ResizeableWindow';
import { TextureItem } from './TextureItem';
import { TexturePreview } from './TexturePreview';

class Textures extends ResizableWindow
{
  constructor(panel, name)
  {
    const container = document.querySelector('.textures');
    const drag_handle = container.querySelector('.textures-header');
    const content_container = container.querySelector('.textures-content');

    super(container, drag_handle, content_container);

    this.name = name;
    this.panel = panel;
    this.$header = drag_handle;

    this.canvas = document.createElement('canvas');
    this.canvas_ctx = this.canvas.getContext('2d');

    this.texture_preview = new TexturePreview();

    // this.$container.addEventListener('mouseleave', () =>
    // {
    //   this.texture_preview.hide();
    // });

    this.texture_container = {};
    this.bitmap_container = {};

    this.$close_button = container.querySelector('.textures-header__close');
    this.$close_button.addEventListener('click', this.handle_close_button_click.bind(this));

    this.texture_items = [];
    this.texture_table = container.querySelector('.textures-table');
  }

  init(scene_controller)
  {
    this.scene_controller = scene_controller;
  }

  show()
  {
    this.$container.classList.remove('hidden');
  }

  hide()
  {
    this.texture_preview.hide();
    this.$container.classList.add('hidden');
  }

  extract_texture_list(object3d)
  {
    const texture_map = new Map();

    const material_types = [
      'map',
      'emissiveMap',
      'roughnessMap',
      'metalnessMap',
      'normalMap',
      'ambientOcclusionMap',
      'displacementMap',
      'alphaMap',
      'envMap',
      'lightMap',
      'reflectionMap',
      'specularMap',
      'sheenColorMap',
      'sheenRoughnessMap',
      'clearcoatColorMap',
      'clearcoatRoughnessMap',
      'coatColorMap',
      'coatRoughnessMap',
      'coatNormalMap',
      'coatNormalScaleMap'
    ];

    object3d.traverse((child) =>
    {
      const materials = Array.isArray(child.material) ? child.material : [child.material];

      for (const material of materials)
      {
        if (!material) continue;

        for (const channel of material_types)
        {
          const tex = material[channel];

          if (tex && tex.isTexture)
          {
            if (!texture_map.has(tex.name))
            {
              texture_map.set(tex.name, {
                name: tex.name,
                uuid: tex.uuid,
                image: tex.image || tex.source || undefined,
                instance: tex,
                used_in: []
              });
            }

            const entry = texture_map.get(tex.name);

            entry.used_in.push({
              material_name: material.name || 'Unknown Material',
              channel: channel,
              mesh_name: child.name || 'Unnamed Mesh'
            });
          }
        }
      }
    });

    const texture_list = Array.from(texture_map.values());
    /* output example:
    {
      name: 'WoodTexture',
      uuid: 'abc-123',
      image: <HTMLImageElement>,
      instance: <THREE.Texture>,
      used_in: [
        {
          material_name: 'FloorMaterial',
          channel: 'map',
          mesh_name: 'FloorMesh'
        },
        {
          material_name: 'WallMaterial',
          channel: 'roughnessMap',
          mesh_name: 'WallMesh'
        }
      ]
    }
    */
    this.texture_items = texture_list.map(texture => new TextureItem(texture, this));
  }

  update_contents(object3d)
  {
    this.extract_texture_list(object3d);
    this.build_textures_list();
  }

  async build_textures_list()
  {
    const texture_rows = [];
    for (let i = 0; i < this.texture_items.length; i++)
    {
      const texture = this.texture_items[i];
      const row = texture.get_row();

      this.texture_container[texture.uuid] = texture.instance;
      row.dataset.texture_uuid = texture.uuid;
      row.dataset.texture_name = texture.name;

      row.addEventListener('click', this.on_texture_node_click.bind(this));
      // row.addEventListener('mouseenter', this.on_texture_node_mouse_enter.bind(this));

      texture_rows.push(row);
    }

    texture_rows.sort((a, b) =>
    {
      const a_resolution = a.querySelector('.textures-table__resolution').textContent;
      const b_resolution = b.querySelector('.textures-table__resolution').textContent;

      const [a_width, a_height] = a_resolution.split('x').map(Number);
      const [b_width, b_height] = b_resolution.split('x').map(Number);

      const a_pixels = a_width * a_height;
      const b_pixels = b_width * b_height;

      return b_pixels - a_pixels;
    });

    if (texture_rows.length > 0)
    {
      for (let i = 0; i < texture_rows.length; i++)
      {
        this.$content_container.appendChild(texture_rows[i]);
      }
    }
    else
    {
      this.$content_container.innerHTML = '<div class="texture-node">No textures found</div>';
    }
  }

  async get_image_bitmap(texture, full_size = false)
  {
    const width = full_size ? texture.image.width : Math.min(texture.image.width || 512, 512);
    const height = full_size ? texture.image.height : Math.min(texture.image.height || 512, 512);

    const rt = new WebGLRenderTarget(width, height);
    const quadScene = new Scene();
    const quadCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const material = new MeshBasicMaterial({ map: texture });
    const quad = new Mesh(new PlaneGeometry(2, 2), material);
    quadScene.add(quad);

    this.scene_controller.renderer.renderer.setRenderTarget(rt);
    this.scene_controller.renderer.renderer.render(quadScene, quadCamera);
    this.scene_controller.renderer.renderer.setRenderTarget(null);

    // Read pixels
    const buffer = new Uint8Array(width * height * 4);
    this.scene_controller.renderer.renderer.readRenderTargetPixels(rt, 0, 0, width, height, buffer);

    const pixel_buffer = new Uint8ClampedArray(buffer);
    this.convert_pixel_buffer_to_srgb(pixel_buffer);
    const imageData = new ImageData(pixel_buffer, width, height);

    // Create ImageBitmap
    const imageBitmap = await createImageBitmap(imageData);

    return imageBitmap;
  }

  linearToSrgb(value)
  {
  // value in [0, 1]
    if (value <= 0.0031308)
    {
      return 12.92 * value;
    }
    else
    {
      return 1.055 * Math.pow(value, 1.0 / 2.4) - 0.055;
    }
  }

  convert_pixel_buffer_to_srgb(buffer)
  {
    for (let i = 0; i < buffer.length; i += 4)
    {
      const r = buffer[i + 0] / 255;
      const g = buffer[i + 1] / 255;
      const b = buffer[i + 2] / 255;

      buffer[i]     = Math.min(255, Math.max(0, Math.round(this.linearToSrgb(r) * 255)));
      buffer[i + 1] = Math.min(255, Math.max(0, Math.round(this.linearToSrgb(g) * 255)));
      buffer[i + 2] = Math.min(255, Math.max(0, Math.round(this.linearToSrgb(b) * 255)));
    }
  }

  image_bitmap_to_data_url(image_bitmap)
  {
    this.canvas.width = image_bitmap.width;
    this.canvas.height = image_bitmap.height;
    this.canvas_ctx.drawImage(image_bitmap, 0, 0);
    return this.canvas.toDataURL();
  }

  // async on_texture_node_mouse_enter(evt)
  // {
  //   const row = evt.srcElement;
  //   const selected_row = this.$content_container.querySelector('.selected');
  //   if (selected_row)
  //   {
  //     selected_row.classList.remove('selected');
  //   }
  //   if (row !== selected_row)
  //   {
  //     row.classList.add('selected');
  //     const dataset = row.dataset;
  //     const texture_uuid = dataset.texture_uuid;

  //     let bitmap = this.bitmap_container[texture_uuid];

  //     if (bitmap === undefined)
  //     {
  //       const texture = this.texture_container[texture_uuid];
  //       bitmap = await this.get_image_bitmap(texture);
  //       dataset.bitmap_data_url = this.image_bitmap_to_data_url(bitmap);

  //       this.bitmap_container[texture_uuid] = bitmap;
  //     }
  //     this.texture_preview.set_image(dataset.bitmap_data_url, bitmap.width, bitmap.height, dataset.texture_name);
  //     this.texture_preview.show();
  //   }
  // }

  async on_texture_node_click(evt)
  {
    evt.preventDefault();
    evt.stopPropagation();

    const row = evt.currentTarget;
    const selected_row = this.$content_container.querySelector('.selected');
    if (selected_row)
    {
      selected_row.classList.remove('selected');
    }
    if (row !== selected_row)
    {
      row.classList.add('selected');
      const dataset = row.dataset;
      const texture_uuid = dataset.texture_uuid;

      let bitmap = this.bitmap_container[texture_uuid];

      if (bitmap === undefined)
      {
        const texture = this.texture_container[texture_uuid];
        bitmap = await this.get_image_bitmap(texture);
        dataset.bitmap_data_url = this.image_bitmap_to_data_url(bitmap);

        this.bitmap_container[texture_uuid] = bitmap;
      }
      this.texture_preview.set_image(dataset.bitmap_data_url, bitmap.width, bitmap.height, dataset.texture_name);
      this.texture_preview.show();
    }
    else
    {
      this.texture_preview.hide();
    }
  }

  async download_image(texture, name)
  {
    console.log('download image');
    const bitmap = await this.get_image_bitmap(texture, true);
    const data_url = this.image_bitmap_to_data_url(bitmap);
    const a = document.createElement('a');
    a.href = data_url;
    a.download = `${name} (${bitmap.width}x${bitmap.height})`;
    a.click();
  }

  handle_close_button_click()
  {
    this.hide();
    this.panel.deactivate_button(this.name);
  }

  handle_mesh_name_click(mesh_name, row)
  {
    if (this.panel.handle_mesh_name_click(mesh_name))
    {
      this.handle_close_button_click();
    }
  }
}

export { Textures };
