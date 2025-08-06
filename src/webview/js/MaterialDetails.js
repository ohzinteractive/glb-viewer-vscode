import { DoubleSide, FrontSide } from 'three';
import { ResizableWindow } from './ResizeableWindow';
import { VSCodeContext } from './VSCodeContext';

class MaterialDetails extends ResizableWindow
{
  constructor()
  {
    const $container = document.querySelector('.material-details');
    const $content = document.querySelector('.material-details__content');
    const $headers = document.querySelector('.material-details__header');

    super($container, $headers, $content);

    this.$content = $content;
    this.$header = $headers;

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

  show()
  {
    this.$container.classList.remove('hidden');
    if (!this.has_changed)
    {
      this.$container.style.right = '10px';
      this.$container.style.left = 'initial';
      this.$container.style.top = '54px';
    }
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

  show_material_details(material)
  {
    this.reset_details();
    this.material = material;
    this.create_material_details();
    this.show();
  }

  create_material_details()
  {
    this.$content.innerHTML = '';
    console.log(this.material.isMeshBasicMaterial, this.material.isMeshStandardMaterial, this.material.isMeshPhysicalMaterial);
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

    this.$container.classList.remove('hidden');
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
    this.create_property_element('Name', this.material.name);
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
      this.create_texture_property_element('Alpha map', this.material.alphaMap.name);
    }
    this.create_color_property_element('Color', '#' + this.material.color.getHexString());

    if (this.material.lightMap)
    {
      this.create_texture_property_element('Light map', this.material.lightMap.name);
    }

    if (this.material.map)
    {
      this.create_texture_property_element('Map', this.material.map.name);
    }

    if (this.material.specularMap)
    {
      this.create_texture_property_element('Specular map', this.material.specularMap.name);
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
      this.create_texture_property_element('Map', this.material.map.name);
    }
    if (this.material.alphaMap)
    {
      this.create_texture_property_element('Alpha map', this.material.alphaMap.name);
    }
    if (this.material.aoMap)
    {
      this.create_texture_property_element('Ao map', this.material.aoMap.name);
    }
    if (this.material.normalMap)
    {
      this.create_texture_property_element('Normal map', this.material.normalMap.name);
    }
    if (this.material.emissiveMap)
    {
      this.create_texture_property_element('Emissive map', this.material.emissiveMap.name);
    }
    if (this.material.metalnessMap)
    {
      this.create_texture_property_element('Metalness map', this.material.metalnessMap.name);
    }
    if (this.material.roughnessMap)
    {
      this.create_texture_property_element('Metalness map', this.material.roughnessMap.name);
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
      this.create_texture_property_element('Clearcoat map', this.material.clearcoatMap.name);
    }
    if (this.material.specularColorMap)
    {
      this.create_texture_property_element('Specular map', this.material.specularColorMap.name);
    }
    if (this.material.transmissionMap)
    {
      this.create_texture_property_element('Transmission map', this.material.transmissionMap.name);
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

  create_texture_property_element(name, value)
  {
    const $detail_item = document.createElement('div');
    const $label = document.createElement('div');
    const $content = document.createElement('div');

    $detail_item.className = 'material-details__item';
    $label.className = 'material-details__item-label';
    $content.className = 'material-details__item-content';

    $label.textContent = name;
    $content.textContent = value;

    $detail_item.appendChild($label);
    $detail_item.appendChild($content);

    $detail_item.addEventListener('click', () =>
    {
      this.copy_to_clipboard(name + ': ' + value);
    });
    this.$content.appendChild($detail_item);
  }
}

export { MaterialDetails };
