class ResizableWindow
{
  constructor(container, drag_handle, content_container)
  {
    this.$container = container;
    this.$drag_handle = drag_handle;
    this.$content_container = content_container;
    this.is_dragging = false;
    this.is_resizing = false;
    this.has_changed = false;
    this.min_width = 300;
    this.min_height = 200;

    this._create_resize_handles();
    this._add_event_listeners();
  }

  _create_resize_handles()
  {
    this.$resize_handles = [];
    const directions = [
      'top', 'right', 'bottom', 'left',
      'top-left', 'top-right', 'bottom-left', 'bottom-right'
    ];

    directions.forEach(direction =>
    {
      const $handle = document.createElement('div');
      $handle.classList.add('resize-handle', `resize-handle--${direction}`);
      $handle.dataset.resize = direction;
      this.$container.appendChild($handle);
      this.$resize_handles.push($handle);
    });
  }

  _add_event_listeners()
  {
    this.$container.addEventListener('pointerdown', this.bring_forward.bind(this));
    this.$drag_handle.addEventListener('pointerdown', this._start_drag.bind(this));

    this.$resize_handles.forEach($handle =>
    {
      $handle.addEventListener('pointerdown', this._start_resize.bind(this));
    });

    window.addEventListener('pointerup', this._stop_actions.bind(this));
    window.addEventListener('pointermove', this._on_pointer_move.bind(this));
  }

  _start_drag(e)
  {
    e.preventDefault();
    this.is_dragging = true;
    this.drag_offset_x = e.clientX - this.$container.offsetLeft;
    this.drag_offset_y = e.clientY - this.$container.offsetTop;
  }

  _start_resize(e)
  {
    e.preventDefault();
    this.is_resizing = true;
    this.resize_direction = e.target.dataset.resize;
    this.start_width = this.$container.offsetWidth;
    this.start_height = this.$container.offsetHeight;
    this.start_left = this.$container.offsetLeft;
    this.start_top = this.$container.offsetTop;
    this.start_x = e.clientX;
    this.start_y = e.clientY;
  }

  _stop_actions()
  {
    this.is_dragging = false;
    this.is_resizing = false;
  }

  _on_pointer_move(e)
  {
    if (this.is_dragging)
    {
      let new_left = e.clientX - this.drag_offset_x;
      let new_top = e.clientY - this.drag_offset_y;

      // Get window bounds
      const max_left = window.innerWidth - this.$container.offsetWidth;
      const max_top = window.innerHeight - this.$container.offsetHeight;

      // Clamp values to keep window within bounds
      new_left = Math.max(0, Math.min(new_left, max_left));
      new_top = Math.max(0, Math.min(new_top, max_top));

      this.$container.style.left = `${new_left}px`;
      this.$container.style.top = `${new_top}px`;
      this.$container.style.right = 'initial';
      this.has_changed = true;
    }

    if (this.is_resizing)
    {
      const dx = e.clientX - this.start_x;
      const dy = e.clientY - this.start_y;

      if (this.resize_direction.includes('right'))
      {
        const newWidth = Math.max(this.start_width + dx, this.min_width);
        this.$container.style.width = `${newWidth}px`;
      }
      if (this.resize_direction.includes('bottom'))
      {
        const newHeight = Math.max(this.start_height + dy, this.min_height);
        this.$content_container.style.height = `${newHeight - this.$drag_handle.offsetHeight}px`;
        this.$container.style.height = `${newHeight}px`;
      }
      if (this.resize_direction.includes('left'))
      {
        const new_width = Math.max(this.start_width - dx, this.min_width);
        const max_left = this.start_left + (this.start_width - this.min_width);
        const new_left = Math.min(this.start_left + dx, max_left);

        if (new_left >= 0)
        {
          this.$container.style.width = `${new_width}px`;
          this.$container.style.left = `${new_left}px`;
        }
      }

      if (this.resize_direction.includes('top'))
      {
        const new_height = Math.max(this.start_height - dy, this.min_height);
        const max_top = this.start_top + (this.start_height - this.min_height);
        const new_top = Math.min(this.start_top + dy, max_top);

        if (new_top >= 0)
        {
          this.$container.style.height = `${new_height}px`;
          this.$content_container.style.height = `${new_height - this.$drag_handle.offsetHeight}px`;
          this.$container.style.top = `${new_top}px`;
        }
      }

      this.has_changed = true;
    }
  }

  bring_forward()
  {
    const all_windows = document.querySelectorAll('.resize-window');

    for (let i = 0; i < all_windows.length; i++)
    {
      all_windows[i].classList.remove('resize-window--focused');
    }

    this.$container.classList.add('resize-window--focused');
  }
}

export { ResizableWindow };
