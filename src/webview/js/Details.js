import { ResizableWindow } from './ResizeableWindow';

class Details extends ResizableWindow
{
  constructor()
  {
    const $container = document.querySelector('.details');
    const $content = document.querySelector('.details__content');
    const $headers = document.querySelector('.details__header');

    super($container, $headers, $content);

    this.$content = $content;
    this.$header = $headers;

    this.vscode_configuration = null;
    this.current_object = null;

    this.$header_message = document.querySelector('.details__header-message');
    this.$header_title = document.querySelector('.details__header-title');
    this.$close = document.querySelector('.details__close');
  }

  init()
  {
    window.addEventListener('message', (event) =>
    {
      const message = event.data;

      if (message.type === 'updateConfig')
      {
        this.vscode_configuration = message.config;
      }
    });

    this.$close.addEventListener('click', () =>
    {
      this.reset_details();
    });
  }

  reset_details()
  {
    this.$content.innerHTML = '';
    this.$container.classList.add('hidden');
  }

  handle_object_click(obj3d)
  {
    this.current_object = obj3d;
    this.show_object_details();
  }

  show_object_details()
  {
    this.$content.innerHTML = '';
    const details = this.create_detail_item(this.current_object);
    for (let i = 0; i < details.length; i++)
    {
      this.$content.appendChild(details[i]);
    }

    this.$container.classList.remove('hidden');
  }

  create_detail_item(obj)
  {
    const details = [];
    const ICON_SVG = '<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M4 2h11v2H6v13H4V2zm4 4h12v16H8V6zm2 2v12h8V8h-8z" fill="currentColor"/> </svg>';
    const relevant_keys = this.vscode_configuration.relevant3dObjectKeys;
    for (let i = 0; i < relevant_keys.length; i++)
    {
      const key = relevant_keys[i];

      if (obj[key] === undefined)
      {
        continue;
      }
      let value = obj[key];
      if (value && typeof value === 'object')
      {
        switch (true)
        {
        case value.isVector3:
          value = value.x.toFixed(2) + ', ' + value.y.toFixed(2) + ', ' + value.z.toFixed(2);
          break;
        case value.isEuler:
          value = value.x.toFixed(2) + ', ' + value.y.toFixed(2) + ', ' + value.z.toFixed(2);
          break;
        default:
          value = JSON.stringify(value);
        }
      }

      if (key === 'type')
      {
        if (obj.geometry)
        {
          value = this.get_mesh_type(obj);
          value += ` (${obj.geometry.attributes.position.count} vertices)`;
        }
      }

      const $new_details_item = document.createElement('div');
      $new_details_item.classList.add('details__item');

      const $item_label = document.createElement('div');
      const $item_content = document.createElement('div');

      $item_label.classList.add('details__item-label');
      $item_content.classList.add('details__item-content');

      $new_details_item.appendChild($item_label);
      $new_details_item.appendChild($item_content);

      $item_label.textContent   = this.prettify_name(key) + ': ';
      $item_content.textContent = value;

      if (key === 'type' && obj.isInstancedMesh)
      {
        const $instanced_item_content = document.createElement('div');
        $instanced_item_content.classList.add('details__item-content');
        $new_details_item.appendChild($instanced_item_content);
        $instanced_item_content.textContent = `Instance count: ${obj.count} (${obj.geometry.attributes.position.count * obj.count} vertices)`;
      }

      const $item_copy_icon = document.createElement('div');
      $item_copy_icon.classList.add('details__item-copy-icon');
      $item_copy_icon.classList.add('hidden');
      $item_copy_icon.innerHTML = ICON_SVG;
      $new_details_item.addEventListener('mouseenter', () =>
      {
        $item_copy_icon.classList.remove('hidden');
      });
      $new_details_item.addEventListener('mouseleave', () =>
      {
        $item_copy_icon.classList.add('hidden');
      });
      $new_details_item.appendChild($item_copy_icon);

      $new_details_item.onclick = () => this.copy_to_clipboard(value);
      details.push($new_details_item);
    }
    return details;
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
    if (this.vscode_configuration.prettifyPropertyLabels)
    {
      const spaced = name.replace(/([A-Z])/g, ' $1').toLowerCase();
      return spaced.charAt(0).toUpperCase() + spaced.slice(1);
    }
    else
    {
      return name;
    }
  }

  get_mesh_type(obj)
  {
    if (obj.isSkinnedMesh)
    {
      return 'SkinnedMesh';
    }
    if (obj.isInstancedMesh)
    {
      return 'InstancedMesh';
    }
    if (obj.isMesh)
    {
      return 'Mesh';
    }
    return obj.type;
  }
}

export { Details };
