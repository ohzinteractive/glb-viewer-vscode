import { InputSlider } from './InputSlider';

class Settings
{
  constructor(parent)
  {
    this.parent = parent;
    this.$container = document.querySelector('.settings');
    this.$openButton = document.querySelector('.settings-button__open');
    this.$closeButton = document.querySelector('.settings-button__close');
    this.$content = document.querySelector('.settings__content');
    this.$actions = document.querySelectorAll('.settings__action');
    this.$vector_size_slider = document.querySelector('.settings__slider--vector-size');
    this.$fov_slider = document.querySelector('.settings__slider--fov');
  }

  init(scene_controller)
  {
    this.scene_controller = scene_controller;
    this.$openButton.addEventListener('click', () =>
    {
      this.$content.classList.remove('hidden');
      this.$openButton.classList.add('hidden');
      this.$closeButton.classList.remove('hidden');
    });

    this.$closeButton.addEventListener('click', () =>
    {
      this.$content.classList.add('hidden');
      this.$openButton.classList.remove('hidden');
      this.$closeButton.classList.add('hidden');
    });

    for (let i = 0; i < this.$actions.length; i++)
    {
      const action = this.$actions[i];

      action.addEventListener('click', () =>
      {
        this.handle_action_click(action.dataset.action);
      });
    }

    this.input_vector_size_slider = new InputSlider(this.$vector_size_slider, 0, 10, 0.1, this.handle_vector_size_slider_change.bind(this));
    this.input_vector_size_slider.init();

    this.input_fov_slider = new InputSlider(this.$fov_slider, 10, 80, 0.5, this.handle_fov_slider_change.bind(this), 45);
    this.input_fov_slider.init();
  }

  handle_vector_size_slider_change(value)
  {
    this.scene_controller.set_line_length(value);
  }

  handle_fov_slider_change(value)
  {
    this.scene_controller.set_fov(value);
  }

  handle_action_click(action)
  {
    const clicked_action = document.querySelector(`.settings__action--${action}`);
    const clicked_action_icon_on = clicked_action.querySelector('.settings__icon--on');
    const clicked_action_icon_off = clicked_action.querySelector('.settings__icon--off');

    if (clicked_action_icon_on.classList.contains('hidden'))
    {
      clicked_action_icon_on.classList.remove('hidden');
      clicked_action_icon_off.classList.add('hidden');
      this.parent.handle_action_click(action, true);
    }
    else
    {
      clicked_action_icon_on.classList.add('hidden');
      clicked_action_icon_off.classList.remove('hidden');
      this.parent.handle_action_click(action, false);
    }
  }
}

export { Settings };
