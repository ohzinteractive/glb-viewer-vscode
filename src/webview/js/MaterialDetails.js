import { ResizableWindow } from './ResizeableWindow';

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
  }

  init()
  {
  }

  show()
  {
    if (!this.has_changed)
    {
      this.$container.style.left = '';
      this.$container.style.top = '';
      this.$container.style.right = '';
    }
    this.$container.classList.remove('hidden');
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
    /*
      name: this.material.name || `Material ${this.material.uuid}`,
      type: this.material.type || 'Unknown',
      uuid: this.material.uuid,
      color: this.material.color ? this.material.color.getHexString() : null,
      transparent: this.material.transparent,
      opacity: this.material.opacity,
      wireframe: this.material.wireframe,
      side: this.material.side,
      userData: this.material.userData || {},
      meshes: this.meshes.map(mesh => ({
        name: mesh.name || `Mesh ${mesh.uuid}`,
        uuid: mesh.uuid,
        type: mesh.type
      })),
      properties: {
        hasColor: !!this.material.color,
        hasTexture: !!this.material.map,
        hasNormalMap: !!this.material.normalMap,
        hasRoughnessMap: !!this.material.roughnessMap,
        hasMetalnessMap: !!this.material.metalnessMap,
        hasEmissiveMap: !!this.material.emissiveMap,
        hasAOMap: !!this.material.aoMap
      }
     */
    this.$content.innerHTML = '';
    for (const key in this.material)
    {
      let name = this.prettify_name(key);
      let value = this.material[key];

      switch (key)
      {
      case 'meshes':
        name += ` (${this.material.meshes.length})`;
        value = this.material.meshes.map(mesh => mesh.name).join(', ');
        break;
      case 'properties':
        value = '';
        for (const property in this.material.properties)
        {
          value += `<div class="material-details__item-property">${property}: ${this.material.properties[property]}</div>`;
        }
        break;
      case 'userData':
        value = '';
        for (const property in this.material.userData)
        {
          value += `${property}: ${this.material.userData[property]}<br>`;
        }
        if (value === '')
        {
          value = 'no user data';
        }
        break;
      default:
        if (typeof value === 'object')
        {
          value = '';
          for (const property in this.material[key])
          {
            value += `${property}: ${this.material[key][property]}<br>`;
          }
          if (value === '')
          {
            value = 'no values';
          }
          break;
        }
        break;
      }

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
}

export { MaterialDetails };
