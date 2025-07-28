import { ResizableWindow } from './ResizeableWindow';

class TexturePreview extends ResizableWindow
{
  constructor()
  {
    const container = document.querySelector('.texture-preview');
    const drag_handle = container.querySelector('.texture-preview__header');
    const content_container = container.querySelector('.texture-preview__content');

    super(container, drag_handle, content_container);

    this.$header = drag_handle;
    this.$title = container.querySelector('.texture-preview__title');

    this.$image = container.querySelector('.texture-preview__image');

    this.$close_button = container.querySelector('.texture-preview__close');
    this.$close_button.addEventListener('click', this.handle_close_button_click.bind(this));
  }

  show()
  {
    this.$container.classList.remove('hidden');
  }

  hide()
  {
    this.$container.classList.add('hidden');
  }

  set_image(bitmap_data_url, width, height, texture_name)
  {
    this.$image.src = bitmap_data_url;

    this.$title.textContent = texture_name;

    if (!this.has_changed)
    {
      this.$container.style.left = '10px';
      this.$container.style.top = ((window.innerHeight) - (this.$container.offsetHeight)) + 'px';
    }
  }

  handle_close_button_click()
  {
    this.hide();
  }
}

export { TexturePreview };
