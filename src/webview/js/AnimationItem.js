class AnimationItem
{
  constructor(animation, name, parent)
  {
    this.animation = animation;

    this.name = name;
    this.parent = parent;

    this.is_playing = true;
    this.play_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>';
    this.stop_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>';

    this.$container = document.createElement('div');
    this.$container.classList.add('animations__item');
    this.$container.setAttribute('data-name', animation.name);

    this.$name = document.createElement('div');
    this.$name.classList.add('animations__item-name');
    this.$name.textContent = name;

    this.$icon = document.createElement('div');
    this.$icon.classList.add('animations__item-icon');
    this.$icon.innerHTML = this.stop_icon;

    this.$container.appendChild(this.$name);
    this.$container.appendChild(this.$icon);
  }

  init()
  {
    this.$container.addEventListener('click', this.handle_click.bind(this));
  }

  play()
  {
    this.is_playing = true;
    this.$icon.innerHTML = this.stop_icon;
    this.parent.play(this.animation);
  }

  stop()
  {
    this.is_playing = false;
    this.$icon.innerHTML = this.play_icon;
    this.parent.stop(this.animation);
  }

  handle_click()
  {
    if (this.is_playing)
    {
      this.stop();
    }
    else
    {
      this.play();
    }
  }
}

export { AnimationItem };
