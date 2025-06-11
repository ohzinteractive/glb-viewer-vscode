import { Mesh, MeshBasicMaterial, OrthographicCamera, PlaneGeometry, Scene, WebGLRenderTarget } from 'three';
import { ResizableWindow } from './ResizeableWindow';

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
    this.$content = content_container;

    this.canvas = document.createElement('canvas');
    this.canvas_ctx = this.canvas.getContext('2d');

    this.image_preview_elem = document.createElement('img');
    this.image_preview_elem.style.visibility = 'hidden';
    this.image_preview_elem.style.position = 'absolute';
    document.body.appendChild(this.image_preview_elem);

    this.$container.addEventListener('mouseleave', () =>
    {
      this.image_preview_elem.style.visibility = 'hidden';
    });

    this.bitmap_container = {};

    this.$close_button = container.querySelector('.textures-header__close');
    this.$close_button.addEventListener('click', this.handle_close_button_click.bind(this));
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
    this.$container.classList.add('hidden');
  }

  async build_textures_list(object3d)
  {
    const textures = [];
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
      if (child.material)
      {
        for (let i = 0; i < material_types.length; i++)
        {
          const material_type = material_types[i];

          if (child.material[material_type])
          {
            const texture = {
              name: child.material[material_type].name || 'Unknown Texture',
              uuid: child.material[material_type].uuid,
              image: child.material[material_type].image || child.material[material_type].source || undefined,
              material_type: material_type,
              material_name: child.material.name || 'Unknown Material',
              instance: child.material[material_type]
            };

            if (!textures.find(t => t.uuid === texture.uuid))
            {
              textures.push(texture);
            }
          }
        }
      }
    });

    const textures_list = Array.from(textures);

    const texture_nodes = [];
    for (let i = 0; i < textures_list.length; i++)
    {
      const texture = textures_list[i];
      const label = document.createElement('div');
      const material_name = document.createElement('div');
      const type = document.createElement('div');
      const resolution = document.createElement('div');
      const node = document.createElement('div');

      node.classList.add('texture-node');
      label.classList.add('texture-node__label');
      material_name.classList.add('texture-node__material-name');
      type.classList.add('texture-node__type');
      resolution.classList.add('texture-node__resolution');
      label.textContent = texture.name;
      material_name.textContent = texture.material_name || 'Unknown Material';
      type.textContent = texture.material_type || 'Unknown';
      // console.log(texture);

      resolution.textContent = `${texture.image.width}x${texture.image.height}`;

      node.appendChild(label);
      node.appendChild(material_name);
      node.appendChild(type);
      node.appendChild(resolution);

      this.bitmap_container[texture.uuid] = await this.get_image_bitmap(texture.instance);

      node.dataset.bitmap_uuid = texture.uuid;

      node.addEventListener('mouseenter', this.on_texture_node_mouse_enter.bind(this));
      node.addEventListener('click', this.download_image.bind(this, texture.instance, texture.name));
      texture_nodes.push(node);
    }

    texture_nodes.sort((a, b) =>
    {
      const a_resolution = a.querySelector('.texture-node__resolution').textContent;
      const b_resolution = b.querySelector('.texture-node__resolution').textContent;

      const [a_width, a_height] = a_resolution.split('x').map(Number);
      const [b_width, b_height] = b_resolution.split('x').map(Number);

      const a_pixels = a_width * a_height;
      const b_pixels = b_width * b_height;

      return b_pixels - a_pixels;
    });

    if (texture_nodes.length > 0)
    {
      for (let i = 0; i < texture_nodes.length; i++)
      {
        this.$content.appendChild(texture_nodes[i]);
      }
    }
    else
    {
      this.$content.innerHTML = '<div class="texture-node">No textures found</div>';
    }
  }

  async get_image_bitmap(texture, full_size = false)
  {
    // if (texture.image instanceof HTMLImageElement ||
    //     texture.image instanceof HTMLCanvasElement ||
    //     texture.image instanceof ImageBitmap)
    // {
    //   return texture.image;
    // }
    // else if (texture.image instanceof Object)
    // {
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

    // Create ImageData
    const imageData = new ImageData(new Uint8ClampedArray(buffer), width, height);

    // Create ImageBitmap
    const imageBitmap = await createImageBitmap(imageData);

    return imageBitmap;
    // }
    // else
    // {
    //   console.warn('Unsupported texture image type:', texture.image);
    //   return null;
    // }
  }

  image_bitmap_to_data_url(image_bitmap)
  {
    this.canvas.width = image_bitmap.width;
    this.canvas.height = image_bitmap.height;
    this.canvas_ctx.drawImage(image_bitmap, 0, 0);
    return this.canvas.toDataURL();
  }

  on_texture_node_mouse_enter(evt)
  {
    const dataset = evt.srcElement.dataset;
    const bitmap = this.bitmap_container[dataset.bitmap_uuid];

    if (dataset.bitmap_data_url === undefined)
    {
      dataset.bitmap_data_url = this.image_bitmap_to_data_url(bitmap);
    }
    this.preview_image(dataset.bitmap_data_url, bitmap.width, bitmap.height);
  }

  preview_image(bitmap_data_url, width, height)
  {
    this.image_preview_elem.src = bitmap_data_url;
    const aspect = width / height;
    this.image_preview_elem.style.width = '256px';
    this.image_preview_elem.style.height = `${256 / aspect}px`;

    // this.image_preview_elem.style.left = ((window.innerWidth / 2) - 128) + 'px';
    this.image_preview_elem.style.left = '20px';
    // this.image_preview_elem.style.top = ((window.innerHeight / 2) - (128 * (1 / aspect))) + 'px';
    this.image_preview_elem.style.top = ((window.innerHeight) - (256 * (1 / aspect))) - 20 + 'px';
    this.image_preview_elem.style.visibility = 'visible';
  }

  async download_image(texture, name)
  {
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
}

export { Textures };
