import { DoubleSide, FrontSide, NearestFilter } from 'three';
import { ResizableWindow } from './ResizeableWindow';
import { VSCodeContext } from './VSCodeContext';

class MaterialDetails extends ResizableWindow
{
  constructor(panel)
  {
    const $container = document.querySelector('.material-details');
    const $content = document.querySelector('.material-details__content');
    const $headers = document.querySelector('.material-details__header');

    super($container, $headers, $content);

    this.$content = $content;
    this.$header = $headers;

    this.panel = panel;
    this.material = null;

    this.$header_message = document.querySelector('.material-details__header-message');
    this.$header_title = document.querySelector('.material-details__header-title');

    this.$close = document.querySelector('.material-details__close');
    this.$close.addEventListener('click', () =>
    {
      this.hide();
    });

    this.$inspect_json = document.querySelector('.material-details__inspect-json');
    this.$inspect_json.addEventListener('click', () =>
    {
      this.handle_inspect_json_button_click();
    });
  }

  init(scene_controller)
  {
    this.scene_controller = scene_controller;
  }

  show(centered = false)
  {
    this.$container.classList.remove('hidden');
    if (!this.has_changed)
    {
      if (centered)
      {
        const containerWidth = this.$container.offsetWidth;
        const containerHeight = this.$container.offsetHeight;

        this.$container.style.right = `calc(50% - ${containerWidth / 2}px)`;
        this.$container.style.left = 'initial';

        this.$container.style.top = `calc(50% - ${containerHeight / 2}px)`;
      }
      else
      {
        this.$container.style.right = '10px';
        this.$container.style.left = 'initial';
        this.$container.style.top = '54px';
      }
    }
    this.bring_forward();
  }

  hide()
  {
    this.$container.classList.add('hidden');
    this.reset_details();
  }

  reset_details()
  {
    this.material = null;
    this.meshes = [];
    this.$content.innerHTML = '';
  }

  show_material_details(material, centered = false)
  {
    this.reset_details();
    this.material = material;
    this.create_material_details();

    this.show(centered);
  }

  update_material_details(material)
  {
    this.reset_details();
    this.material = material;
    this.create_material_details();
  }

  create_material_details()
  {
    this.$content.innerHTML = '';
    // console.log(this.material.isMeshBasicMaterial, this.material.isMeshStandardMaterial, this.material.isMeshPhysicalMaterial);
    if (this.material.isMeshBasicMaterial)
    {
      this.display_basic_material();
    }
    else
    {
      if (this.material.isMeshPhysicalMaterial)
      {
        this.display_physical_material();
      }
      else
      {
        this.display_standard_material();
      }
    }
  }

  copy_to_clipboard(text)
  {
    navigator.clipboard.writeText(text);

    this.$header_message.textContent = 'Copied to clipboard';
    this.$header_title.classList.add('hidden');
    this.$header_message.classList.remove('faded');

    setTimeout(() =>
    {
      this.$header_message.classList.add('faded');
      this.$header_title.classList.remove('hidden');
    }, 1000);
  }

  prettify_name(name)
  {
    const spaced = name.replace(/([A-Z])/g, ' $1').toLowerCase();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  }

  handle_inspect_json_button_click()
  {
    VSCodeContext.ctx.postMessage({
      command: 'openJson',
      payload: this.material.toJSON()
    });
  }

  __display_base_material_properties(type)
  {
    this.create_property_element('Name', this.material.name || `Material ${this.material.uuid}`);
    this.create_property_element('Type', type);
    this.create_property_element('Transparent', this.material.transparent);
    if (this.material.transparent)
    {
      this.create_property_element('Opacity', this.material.opacity);
    }
    this.create_property_element('Side', this.material.side === DoubleSide ? 'DoubleSide' : this.material.side === FrontSide ? 'FrontSide' : 'BackSide');
    this.create_property_element('User data', JSON.stringify(this.material.userData));
  }

  display_basic_material()
  {
    this.__display_base_material_properties('MeshBasicMaterial');

    if (this.material.alphaMap)
    {
      this.create_texture_property_element('Alpha map', this.material.alphaMap);
    }
    this.create_color_property_element('Color', '#' + this.material.color.getHexString());

    if (this.material.lightMap)
    {
      this.create_texture_property_element('Light map', this.material.lightMap);
    }

    if (this.material.map)
    {
      this.create_texture_property_element('Map', this.material.map);
    }

    if (this.material.specularMap)
    {
      this.create_texture_property_element('Specular map', this.material.specularMap);
    }
  }

  display_standard_material(type = 'MeshStandardMaterial')
  {
    this.__display_base_material_properties(type);
    this.create_color_property_element('Color', '#' + this.material.color.getHexString());
    this.create_property_element('Emissive intensity', this.material.emissiveIntensity);
    this.create_color_property_element('Emissive color', '#' + this.material.emissive.getHexString());
    this.create_property_element('Metalness', this.material.metalness);
    this.create_property_element('Roughness', this.material.roughness);

    if (this.material.map)
    {
      this.create_texture_property_element('Map', this.material.map);
    }
    if (this.material.alphaMap)
    {
      this.create_texture_property_element('Alpha map', this.material.alphaMap);
    }
    if (this.material.aoMap)
    {
      this.create_texture_property_element('Ao map', this.material.aoMap);
    }
    if (this.material.normalMap)
    {
      this.create_texture_property_element('Normal map', this.material.normalMap);
    }
    if (this.material.emissiveMap)
    {
      this.create_texture_property_element('Emissive map', this.material.emissiveMap);
    }
    if (this.material.metalnessMap)
    {
      this.create_texture_property_element('Metalness map', this.material.metalnessMap);
    }
    if (this.material.roughnessMap)
    {
      this.create_texture_property_element('Metalness map', this.material.roughnessMap);
    }
  }

  display_physical_material()
  {
    this.display_standard_material('MeshPhysicalMaterial');

    this.create_property_element('Transmission', this.material.transmission);
    this.create_property_element('Clearcoat', this.material.clearcoat);
    this.create_property_element('IOR', this.material.ior);
    this.create_property_element('Specular intensity', this.material.specularIntensity);
    this.create_color_property_element('Specular color', '#' + this.material.specularColor.getHexString());

    if (this.material.clearcoatMap)
    {
      this.create_texture_property_element('Clearcoat map', this.material.clearcoatMap);
    }
    if (this.material.specularColorMap)
    {
      this.create_texture_property_element('Specular map', this.material.specularColorMap);
    }
    if (this.material.transmissionMap)
    {
      this.create_texture_property_element('Transmission map', this.material.transmissionMap);
    }
  }

  create_property_element(name, value)
  {
    const $detail_item = document.createElement('div');
    $detail_item.className = 'material-details__item';
    $detail_item.innerHTML = `
        <div class="material-details__item-label">${name}</div>
        <div class="material-details__item-content">${value}</div>
      `;
    $detail_item.addEventListener('click', () =>
    {
      this.copy_to_clipboard(name + ': ' + value);
    });
    this.$content.appendChild($detail_item);
  }

  create_color_property_element(name, value)
  {
    const $detail_item = document.createElement('div');
    const $label = document.createElement('div');
    const $content = document.createElement('div');
    const $value = document.createElement('div');
    const $color_box = document.createElement('div');

    $detail_item.className = 'material-details__item';
    $label.className = 'material-details__item-label';
    $content.className = 'material-details__item-content';
    $color_box.className = 'material-details__item-color-box';

    $label.textContent = name;
    $color_box.style.backgroundColor = value;
    $value.textContent = value;

    $content.appendChild($color_box);
    $content.appendChild($value);

    $detail_item.appendChild($label);
    $detail_item.appendChild($content);

    $content.addEventListener('click', () =>
    {
      this.copy_to_clipboard(name + ': ' + value);
    });

    this.$content.appendChild($detail_item);
  }

  async create_texture_property_element(name, map)
  {
    const $detail_item = document.createElement('div');
    const $label = document.createElement('div');
    const $content = document.createElement('div');
    const $thumbnail_container = document.createElement('div');
    const $thumbnail = document.createElement('img');

    $detail_item.className = 'material-details__item';
    $label.className = 'material-details__item-label';
    $content.className = 'material-details__item-content';
    $thumbnail_container.className = 'material-details__item-thumbnail-container';
    $thumbnail.className = 'material-details__item-thumbnail';

    if (map.magFilter === NearestFilter)
    {
      $thumbnail.style.imageRendering = 'pixelated';
    }

    $label.textContent = name;
    $content.textContent = map.name || 'Unnamed texture';

    const image_bitmap = await this.panel.contents.textures.get_image_bitmap(map);
    const image_bitmap_data_url = this.panel.contents.textures.image_bitmap_to_data_url(image_bitmap);

    $thumbnail.src = image_bitmap_data_url;

    $detail_item.appendChild($label);
    $detail_item.appendChild($content);

    $detail_item.addEventListener('click', () =>
    {
      this.copy_to_clipboard(name + ': ' + map.name);
    });

    $thumbnail_container.appendChild($thumbnail);
    $content.appendChild($thumbnail_container);

    $detail_item.appendChild($thumbnail);

    this.$content.appendChild($detail_item);
  }
}

export { MaterialDetails };
