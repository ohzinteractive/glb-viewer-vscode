class Textures
{
  constructor()
  {
    this.$container = document.querySelector('.textures');

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
  }

  init(scene_controller, details_panel)
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

  build_textures_list(object3d)
  {
    const textures = new Set();
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
            textures.add(child.material[material_type]);
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
      const resolution = document.createElement('div');
      const node = document.createElement('div');
      node.classList.add('texture-node');
      label.classList.add('texture-node__label');
      resolution.classList.add('texture-node__resolution');
      label.textContent = texture.name;

      resolution.textContent = `${texture.image.width}x${texture.image.height}`;
      node.appendChild(label);
      node.appendChild(resolution);
      node.dataset.bitmap_data_url = this.image_bitmap_to_data_url(texture.image);
      node.dataset.width = texture.image.width;
      node.dataset.height = texture.image.height;
      node.addEventListener('mouseenter', this.on_texture_node_mouse_enter.bind(this));
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
        this.$container.appendChild(texture_nodes[i]);
      }
    }
    else
    {
      this.$container.innerHTML = '<div class="texture-node">No textures found</div>';
    }
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
    this.preview_image(dataset.bitmap_data_url, dataset.width, dataset.height);
  }

  preview_image(bitmap_data_url, width, height)
  {
    this.image_preview_elem.src = bitmap_data_url;
    const aspect = width / height;
    this.image_preview_elem.style.width = '256px';
    this.image_preview_elem.style.height = `${256 / aspect}px`;

    this.image_preview_elem.style.visibility = 'visible';
  }
}

export { Textures };
