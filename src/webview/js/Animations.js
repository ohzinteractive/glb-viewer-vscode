import { AnimationItem } from './AnimationItem';
import { ResizableWindow } from './ResizeableWindow';

class Animations extends ResizableWindow
{
  constructor(panel, name)
  {
    const container = document.querySelector('.animations');
    const drag_handle = container.querySelector('.animations-header');
    const content_container = container.querySelector('.animations__list');

    super(container, drag_handle, content_container);

    this.name = name;
    this.panel = panel;

    this.$list = content_container;
    this.$header = drag_handle;
    this.$controls = this.$container.querySelector('.animations__controls');
    this.$play = this.$controls.querySelector('.animations__controls-item[data-name="play"]');
    this.$stop_all = this.$controls.querySelector('.animations__controls-item[data-name="stop-all"]');
    this.$play_all = this.$controls.querySelector('.animations__controls-item[data-name="play-all"]');

    this.$close_button = container.querySelector('.animations-header__close');
    this.$close_button.addEventListener('click', this.handle_close_button_click.bind(this));

    this.animation_items = [];
  }

  init(scene_controller)
  {
    this.scene_controller = scene_controller;

    this.$stop_all.addEventListener('click', this.stop_all.bind(this));
    this.$play_all.addEventListener('click', this.play_all.bind(this));

    const animations = this.list_animations();
    for (let i = 0; i < animations.length; i++)
    {
      const animation = animations[i];
      const item = new AnimationItem(animation, animation.name, this);
      item.init();
      this.animation_items.push(item);
      this.$list.appendChild(item.$container);
    }
  }

  show()
  {
    this.$container.classList.remove('hidden');
  }

  hide()
  {
    this.$container.classList.add('hidden');
  }

  play(animation)
  {
    this.scene_controller.model.play_animation(animation);
  }

  stop(animation)
  {
    this.scene_controller.model.stop_animation(animation);
  }

  stop_all()
  {
    for (let i = 0; i < this.animation_items.length; i++)
    {
      const item = this.animation_items[i];
      item.stop();
    }
  }

  play_all()
  {
    for (let i = 0; i < this.animation_items.length; i++)
    {
      const item = this.animation_items[i];
      item.play();
    }
  }

  list_animations()
  {
    const animations = [];
    for (const animation of this.scene_controller.model.animations)
    {
      animations.push(animation);
    }
    return animations;
  }

  handle_close_button_click()
  {
    this.hide();
    this.panel.deactivate_button(this.name);
  }
}

export { Animations };
