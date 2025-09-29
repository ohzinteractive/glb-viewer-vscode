import { FloatType, LinearSRGBColorSpace, Mesh, MeshBasicMaterial, NearestFilter, OrthographicCamera, PlaneGeometry, Scene, SRGBColorSpace, WebGLRenderTarget } from 'three';
import { ResizableWindow } from './ResizeableWindow';
import { TextureItem } from './TextureItem';
import { TexturePreview } from './TexturePreview';

class Textures extends ResizableWindow
{
  constructor(panel, name)
  {
    const container = document.querySelector('.textures');
    const drag_handle = container.querySelector('.textures-header');
    const resize_content = container.querySelector('.resize-content-wrapper');

    super(container, drag_handle, resize_content);

    this.name = name;
    this.panel = panel;
    this.$header = drag_handle;
    this.$rows_container = container.querySelector('.textures-content');

    this.canvas = document.createElement('canvas');
    this.canvas_ctx = this.canvas.getContext('2d');

    this.texture_preview = new TexturePreview();

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
      'aoMap',
      'normalMap',
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
      if (child.material)
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
              if (!texture_map.has(tex.source.uuid))
              {
                texture_map.set(tex.source.uuid, {
                  name: tex.name || 'No name',
                  uuid: tex.source.uuid,
                  image: tex.image || tex.source || undefined,
                  instance: tex,
                  used_in: []
                });
              }

              const entry = texture_map.get(tex.source.uuid);

              entry.used_in.push({
                material_name: material.name || 'Unknown Material',
                channel: channel,
                mesh_name: child.name || 'Unnamed Mesh'
              });
            }
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
    this.texture_items = texture_list.map((texture, index) => new TextureItem(texture, this, index));
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
        this.$rows_container.appendChild(texture_rows[i]);
      }
    }
    else
    {
      this.$rows_container.innerHTML = '<div class="texture-node">No textures found</div>';
    }
  }

  async get_image_bitmap(texture, full_size = false)
  {
    if (texture.source)
    {
      return texture.source.data;
    }

    const width = full_size ? texture.image.width : Math.min(texture.image.width || 512, 512);
    const height = full_size ? texture.image.height : Math.min(texture.image.height || 512, 512);
    const rt = new WebGLRenderTarget(width, height, {
      type: FloatType
    });
    rt.colorSpace = LinearSRGBColorSpace;
    const quadScene = new Scene();
    const quadCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const material = new MeshBasicMaterial({ map: texture });
    const quad = new Mesh(new PlaneGeometry(2, 2), material);
    quadScene.add(quad);

    this.scene_controller.renderer.renderer.outputColorSpace = LinearSRGBColorSpace;
    this.scene_controller.renderer.renderer.setRenderTarget(rt);
    this.scene_controller.renderer.renderer.render(quadScene, quadCamera);
    this.scene_controller.renderer.renderer.setRenderTarget(null);
    this.scene_controller.renderer.renderer.outputColorSpace = SRGBColorSpace;

    const buffer = new Float32Array(width * height * 4);
    this.scene_controller.renderer.renderer.readRenderTargetPixels(rt, 0, 0, width, height, buffer);
    if (texture.colorSpace === 'srgb')
    {
      this.convert_pixel_buffer_to_srgb(buffer);
    }
    const pixel_buffer = this.convert_to_uint8_array(buffer);
    const imageData = new ImageData(pixel_buffer, width, height);

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
      const r = buffer[i + 0];
      const g = buffer[i + 1];
      const b = buffer[i + 2];

      buffer[i + 0] = this.linearToSrgb(r);
      buffer[i + 1] = this.linearToSrgb(g);
      buffer[i + 2] = this.linearToSrgb(b);
    }
  }

  convert_to_uint8_array(buffer)
  {
    const pixel_buffer = new Uint8ClampedArray(buffer.length);
    for (let i = 0; i < buffer.length; i += 4)
    {
      const r = buffer[i + 0];
      const g = buffer[i + 1];
      const b = buffer[i + 2];
      const a = buffer[i + 3];

      pixel_buffer[i + 0] = Math.round(r * 255);
      pixel_buffer[i + 1] = Math.round(g * 255);
      pixel_buffer[i + 2] = Math.round(b * 255);
      pixel_buffer[i + 3] = Math.round(a * 255);
    }
    return pixel_buffer;
  }

  image_bitmap_to_data_url(image_bitmap)
  {
    this.canvas.width = image_bitmap.width;
    this.canvas.height = image_bitmap.height;
    this.canvas_ctx.drawImage(image_bitmap, 0, 0);
    return this.canvas.toDataURL();
  }

  async on_row_click(texture_item)
  {
    const selected_row = this.$rows_container.querySelector('.selected');
    if (selected_row)
    {
      selected_row.classList.remove('selected');
    }

    if (texture_item.row !== selected_row)
    {
      texture_item.row.classList.add('selected');

      let bitmap_data_url = '';
      let bitmap = null;
      if (!texture_item.bitmap)
      {
        bitmap = await this.get_image_bitmap(texture_item.instance);
        texture_item.set_bitmap(bitmap);
      }
      else
      {
        bitmap = texture_item.bitmap;
      }
      bitmap_data_url = this.image_bitmap_to_data_url(bitmap);

      const pixelated = texture_item.instance.magFilter === NearestFilter;

      this.texture_preview.show();
      this.texture_preview.set_image(bitmap_data_url, bitmap.width, bitmap.height, texture_item.name, pixelated);
    }
    else
    {
      this.texture_preview.hide();
    }
  }

  async download_image(texture_item)
  {
    const bitmap = await this.get_image_bitmap(texture_item.instance, true);
    console.log(bitmap);
    console.log('download image', texture_item);
    let name = texture_item.name;

    let extension = 'png';
    if (name.split('.').length > 1)
    {
      extension = name.split('.').pop();
    }
    name = name.replace(`.${extension}`, '');
    const data_url = this.image_bitmap_to_data_url(bitmap);
    const a = document.createElement('a');
    a.href = data_url;
    a.download = `${name} (${bitmap.width}x${bitmap.height}).${extension}`;
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
