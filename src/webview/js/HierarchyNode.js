class HierarchyNode
{
  constructor(object3d, panel, tree, parent = null)
  {
    this.object3d = object3d;

    this.children = [];
    this.parent = parent;
    this.is_geometry = !!object3d.geometry;
    this.is_empty_object = !object3d.geometry && object3d.children.length === 0;
    this.is_visible = object3d.visible;
    this.is_selected = false;
    this.$element = null;
    this.$icon = null;
    this.$action = null;
    this.$label = null;
    this.$label_wrapper = null;
    this.$children = null;
    this.is_expanded = false;

    this.panel = panel;
    this.tree = tree;

    this.icons = {
      ICON_ARROW_RIGHT: '<svg fill="none" viewBox="0 0 24 24" width="16" height="16"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      ICON_ARROW_DOWN: '<svg fill="none" viewBox="0 0 24 24" width="16" height="16"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      ICON_OBJECT: '<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M7 7h4v4H7V7zm-2 6v-2h2v2H5zm0 0v4H1v-4h4zm8 0h-2v-2h2v2zm4 0h-4v4h4v-4zm2-2v2h-2v-2h2zm0 0h4V7h-4v4z" fill="currentColor"/> </svg>',
      ICON_OBJECT_EMPTY: '<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M5 3H3v2h2V3zm4 0H7v2h2V3zM7 19h2v2H7v-2zM5 7H3v2h2V7zm14 0h2v2h-2V7zM5 11H3v2h2v-2zm14 0h2v2h-2v-2zM5 15H3v2h2v-2zm14 0h2v2h-2v-2zM5 19H3v2h2v-2zm6-16h2v2h-2V3zm2 16h-2v2h2v-2zm2-16h2v2h-2V3zm2 16h-2v2h2v-2zm2-16h2v2h-2V3zm2 16h-2v2h2v-2z" fill="currentColor"/> </svg>',
      ICON_OPEN_EYE: '<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M0 7h2v2H0V7zm4 4H2V9h2v2zm4 2v-2H4v2H2v2h2v-2h4zm8 0H8v2H6v2h2v-2h8v2h2v-2h-2v-2zm4-2h-4v2h4v2h2v-2h-2v-2zm2-2v2h-2V9h2zm0 0V7h2v2h-2z" fill="currentColor"/> </svg>',
      ICON_CLOSED_EYE: '<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M8 6h8v2H8V6zm-4 4V8h4v2H4zm-2 2v-2h2v2H2zm0 2v-2H0v2h2zm2 2H2v-2h2v2zm4 2H4v-2h4v2zm8 0v2H8v-2h8zm4-2v2h-4v-2h4zm2-2v2h-2v-2h2zm0-2h2v2h-2v-2zm-2-2h2v2h-2v-2zm0 0V8h-4v2h4zm-10 1h4v4h-4v-4z" fill="currentColor"/> </svg>'
    };

    this.create_element();
  }

  create_element()
  {
    this.$element = document.createElement('div');
    this.$element.className = 'tree-node';
    // this.$element.innerHTML = this.object3d.name;

    if (!this.parent)
    {
      this.$element.classList.add('tree-node--root');
    }

    this.$icon = document.createElement('div');
    this.$icon.className = 'tree-node__icon';
    this.$icon.innerHTML = this.icons.ICON_ARROW_RIGHT;

    this.$action = document.createElement('div');
    this.$action.className = 'tree-node__action';
    this.$action.innerHTML = this.object3d.visible ? this.icons.ICON_CLOSED_EYE : this.icons.ICON_OPEN_EYE;

    this.$label = document.createElement('div');
    this.$label.className = 'tree-node__label';
    this.$label.textContent = this.object3d.name || this.object3d.type;

    this.$label_wrapper = document.createElement('div');
    this.$label_wrapper.className = 'tree-node__label-wrapper';
    this.$label_wrapper.appendChild(this.$icon);
    this.$label_wrapper.appendChild(this.$label);
    this.$label_wrapper.appendChild(this.$action);

    this.$children = document.createElement('div');
    this.$children.className = 'tree-node__children';
    this.$children.style.display = 'none';

    this.$element.appendChild(this.$label_wrapper);
    this.$element.appendChild(this.$children);

    if (this.object3d.children.length > 0)
    {
      for (let i = 0; i < this.object3d.children.length; i++)
      {
        const child = this.object3d.children[i];
        const child_node = new HierarchyNode(child, this.panel, this.tree, this);
        this.children.push(child_node);
        this.$children.appendChild(child_node.$element);
      }
    }

    if (this.is_geometry)
    {
      this.$icon.innerHTML = this.icons.ICON_OBJECT;
      this.$icon.classList.add('tree-node__icon--object');
    }
    else if (this.is_empty_object)
    {
      this.$icon.innerHTML = this.icons.ICON_OBJECT_EMPTY;
      this.$icon.classList.add('tree-node__icon--empty-object');
    }

    this.$label_wrapper.addEventListener('click', (e) => this.handle_label_click(e));
    this.$icon.addEventListener('click', (e) => this.handle_icon_click(e));
    this.$action.addEventListener('click', (e) => this.handle_action_click(e));
  }

  get_element()
  {
    return this.$element;
  }

  toggle_visibility()
  {
    this.object3d.visible = !this.object3d.visible;
    this.$action.innerHTML = this.object3d.visible ? this.icons.ICON_CLOSED_EYE : this.icons.ICON_OPEN_EYE;
    for (let i = 0; i < this.children.length; i++)
    {
      this.children[i].toggle_visibility();
    }
  }

  expand()
  {
    this.is_expanded = true;
    if (this.children.length > 0)
    {
      this.$children.style.display = 'block';
      this.$icon.innerHTML = this.icons.ICON_ARROW_DOWN;
    }
  }

  expand_down()
  {
    this.expand();
    for (let i = 0; i < this.children.length; i++)
    {
      this.children[i].expand_down();
    }
  }

  expand_up()
  {
    this.expand();
    if (this.parent)
    {
      this.parent.expand_up();
    }
  }

  collapse()
  {
    this.is_expanded = false;
    this.$children.style.display = 'none';
    this.$icon.innerHTML = this.icons.ICON_ARROW_RIGHT;
  }

  toggle_expand()
  {
    if (this.children.length > 0)
    {
      if (this.is_expanded)
      {
        this.collapse();
      }
      else
      {
        this.expand();
      }
    }
  }

  handle_icon_click(e)
  {
    e.stopPropagation();
    this.toggle_expand();
  }

  handle_label_click(e)
  {
    e.stopPropagation();
    this.toggle_expand();
    this.tree.unhighlight_all();
    this.highlight();
    this.panel.handle_object_click(this.object3d);
  }

  handle_action_click(e)
  {
    e.stopPropagation();
    this.toggle_visibility();
  }

  highlight()
  {
    this.$label_wrapper.classList.add('tree-node__label-wrapper--selected');
  }

  unhighlight()
  {
    this.$label_wrapper.classList.remove('tree-node__label-wrapper--selected');
    for (let i = 0; i < this.children.length; i++)
    {
      this.children[i].unhighlight();
    }
  }

  find_node_by_object3d(object3d)
  {
    if (this.object3d === object3d)
    {
      return this;
    }
    for (let i = 0; i < this.children.length; i++)
    {
      const node = this.children[i].find_node_by_object3d(object3d);
      if (node)
      {
        return node;
      }
    }
    return null;
  }
}

export { HierarchyNode };
