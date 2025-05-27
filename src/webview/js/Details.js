class Details
{
  constructor()
  {
    this.is_dragging = false;
    this.offset_x = 0;
    this.offset_y = 0;
    this.initial_x = 0;
    this.selected_outline = null;
    this.vscode_configuration = null;
    this.current_object = null;

    this.$container = document.querySelector('.details');
    this.$content = document.querySelector('.details__content');
    this.$header = document.querySelector('.details__header');
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
        // console.log('Updating configuration', message.config);
        this.vscode_configuration = message.config;

        // if (this.current_object)
        // {
        //   this.show_object_details();
        // }
      }
    });

    this.$header.addEventListener('mousedown', (e) =>
    {
      this.is_dragging = true;
      document.body.style.cursor = 'move';
      this.offset_x = e.clientX - this.$container.offsetLeft;
      this.offset_y = e.clientY - this.$container.offsetTop;
    });

    this.$close.addEventListener('click', () =>
    {
      this.reset_details();
    });
  }

  handle_mouse_move(e)
  {
    if (this.is_dragging)
    {
      const new_x = e.clientX - this.offset_x;
      const new_y = e.clientY - this.offset_y;

      const max_x = window.innerWidth - this.$container.offsetWidth;
      const max_y = window.innerHeight - this.$container.offsetHeight;

      this.$container.style.right = (window.innerWidth - Math.min(Math.max(0, new_x), max_x) - this.$container.offsetWidth) + 'px';
      this.$container.style.top = Math.min(Math.max(0, new_y), max_y) + 'px';
    }
  }

  handle_mouse_up()
  {
    this.is_dragging = false;
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
    const relevant_keys = this.vscode_configuration.relevant3dObjectKeys;
    for (let i = 0; i < relevant_keys.length; i++)
    {
      const key = relevant_keys[i];
      const $new_details_item = document.createElement('div');
      $new_details_item.classList.add('details__item');
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
      $new_details_item.textContent = key + ': ' + value;
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
}

export { Details };
