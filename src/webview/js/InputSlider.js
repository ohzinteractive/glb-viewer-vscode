class InputSlider
{
  constructor(container, min, max, step, on_change)
  {
    this.min = min;
    this.max = max;
    this.step = step;
    this.is_dragging = false;
    this.callback = on_change;
    this.current_value = 0.5;

    this.$container = container;
    this.$container.classList.add('slider');
    this.$input = document.createElement('input');
    this.$input.type = 'number';
    this.$input.classList.add('slider-value');
    this.$bar = document.createElement('div');
    this.$bar.classList.add('slider-bar');
    this.$container.appendChild(this.$input);
    this.$container.appendChild(this.$bar);
  }

  init()
  {
    this.$container.addEventListener('mousedown', this.handle_slider_mousedown.bind(this));
    this.$container.addEventListener('click', this.handle_slider_click.bind(this));
    document.addEventListener('mousemove', this.handle_slider_mousemove.bind(this));
    document.addEventListener('mouseup', this.handle_slider_mouseup.bind(this));
    this.$input.addEventListener('input', this.handle_slider_input.bind(this));
    this.$input.addEventListener('focus', this.handle_slider_focus.bind(this));
    this.$input.addEventListener('blur', this.handle_slider_blur.bind(this));

    this.$input.value = this.current_value;
    this.update_slider_bar();
    this.callback(this.current_value);
  }

  handle_slider_click()
  {
    this.$input.focus();
  }

  handle_slider_mousedown()
  {
    this.is_dragging = true;
    this.update_slider_value();
  }

  handle_slider_mousemove(event)
  {
    if (!this.is_dragging) return;
    document.body.style.cursor = 'ew-resize';
    this.update_slider_value();
  }

  handle_slider_mouseup()
  {
    this.is_dragging = false;
    document.body.style.cursor = 'default';
  }

  handle_slider_input()
  {
    const value = parseFloat(this.$input.value);
    if (!isNaN(value))
    {
      this.current_value = value;
      this.update_slider_bar();
      this.callback(this.current_value);
    }
  }

  handle_slider_focus()
  {
    this.$input.select();
  }

  handle_slider_blur()
  {
    const value = parseFloat(this.$input.value);
    if (isNaN(value))
    {
      this.$input.value = this.current_value;
    }
  }

  update_slider_value()
  {
    const rect = this.$container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const value = this.min + (this.max - this.min) * percentage;
    this.current_value = Math.round(value / this.step) * this.step;
    this.current_value = this.current_value.toFixed(2);
    this.$input.value = this.current_value;
    this.callback(this.current_value);
    this.update_slider_bar();
  }

  update_slider_bar()
  {
    const percentage = Math.min(1, (this.current_value - this.min) / (this.max - this.min));
    this.$bar.style.width = `${percentage * 100}%`;
  }
}

export { InputSlider };
