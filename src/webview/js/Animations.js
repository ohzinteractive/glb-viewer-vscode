import { AnimationItem } from './AnimationItem';

class Animations
{
  constructor()
  {
    this.$container = document.querySelector('.animations');
    this.$list = this.$container.querySelector('.animations__list');
    this.$controls = this.$container.querySelector('.animations__controls');
    this.$play = this.$controls.querySelector('.animations__controls-item[data-name="play"]');
    this.$stop_all = this.$controls.querySelector('.animations__controls-item[data-name="stop-all"]');
    this.$play_all = this.$controls.querySelector('.animations__controls-item[data-name="play-all"]');

    this.icon_images = {
      play: '<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 20H8V4h2v2h2v3h2v2h2v2h-2v2h-2v3h-2v2z" fill="currentColor"/></svg>',
      stop: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="1" fill="currentColor"/></svg>'
    };

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
}

export { Animations };
