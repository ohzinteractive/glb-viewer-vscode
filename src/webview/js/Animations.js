class Animations
{
  constructor()
  {
    this.$container = document.querySelector('.animations');
    this.$list = this.$container.querySelector('.animations__list');
    this.$controls = this.$container.querySelector('.animations__controls');
    this.$play = this.$controls.querySelector('.animations__controls-item[data-name="play"]');
    this.$stop = this.$controls.querySelector('.animations__controls-item[data-name="stop"]');
    this.$play_all = this.$controls.querySelector('.animations__controls-item[data-name="play-all"]');
  }

  init(scene_controller)
  {
    this.scene_controller = scene_controller;

    this.$stop.addEventListener('click', this.stop.bind(this));
    this.$play_all.addEventListener('click', this.play_all.bind(this));

    const animations = this.list_animations();
    for (let i = 0; i < animations.length; i++)
    {
      const animation = animations[i];
      const item = document.createElement('div');
      item.classList.add('animations__item');
      item.setAttribute('data-name', animation.name);
      item.textContent = animation.name;
      this.$list.appendChild(item);
      item.addEventListener('click', this.play.bind(this, animation));
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

  stop()
  {
    this.scene_controller.model.mixer.stopAllAction();
  }

  play_all()
  {
    for (const animation of this.scene_controller.model.animations)
    {
      this.play(animation);
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
