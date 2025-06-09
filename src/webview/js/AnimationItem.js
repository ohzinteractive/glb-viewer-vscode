class AnimationItem
{
  constructor(animation, name, parent)
  {
    this.animation = animation;

    this.name = name;
    this.parent = parent;

    this.is_playing = true;
    this.play_icon = '<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 20H8V4h2v2h2v3h2v2h2v2h-2v2h-2v3h-2v2z" fill="currentColor"/></svg>';
    this.stop_icon = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="1" fill="currentColor"/></svg>';

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
