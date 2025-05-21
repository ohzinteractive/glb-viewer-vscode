class HierarchyTree
{
  constructor(parent)
  {
    this.parent = parent;

    this.is_dragging = false;
    this.offset_x = 0;
    this.offset_y = 0;
    this.is_resizing = false;
    this.initial_x = 0;

    this.$content = document.querySelector('.tree');
    this.$splitter = document.querySelector('.splitter');
    this.$header = document.querySelector('.tree-header');
    this.$container = document.querySelector('.tree-container');
  }

  init()
  {
    this.$header.addEventListener('mousedown', (e) =>
    {
      this.is_dragging = true;
      document.body.style.cursor = 'move';
      this.offset_x = e.clientX - this.$container.offsetLeft;
      this.offset_y = e.clientY - this.$container.offsetTop;
    });

    this.$splitter.addEventListener('mousedown', (e) =>
    {
      this.is_resizing = true;
      document.body.style.cursor = 'col-resize';
      this.initial_x = e.clientX;
    });
  }

  handle_mouse_move(e)
  {
    if (this.is_resizing)
    {
      const new_width = e.clientX;
      if (new_width > 200 && new_width < window.innerWidth - 200)
      {
        this.$content.style.width = new_width + 'px';
      }
    }
    if (this.is_dragging)
    {
      const new_x = e.clientX - this.offset_x;
      const new_y = e.clientY - this.offset_y;

      const max_x = window.innerWidth - this.$container.offsetWidth;
      const max_y = window.innerHeight - this.$container.offsetHeight;

      this.$container.style.left = Math.min(Math.max(0, new_x), max_x) + 'px';
      this.$container.style.top = Math.min(Math.max(0, new_y), max_y) + 'px';
    }
  }

  build_hierarchy_tree(object3d, $container = this.$content, depth = 0)
  {
    const ICON_ARROW_RIGHT = '<svg fill="none" viewBox="0 0 24 24" width="16" height="16"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const ICON_ARROW_DOWN = '<svg fill="none" viewBox="0 0 24 24" width="16" height="16"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const ICON_OBJECT = '<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h4v4H7V7zm6 0h4v4h-4V7zm-6 6h4v4H7v-4zm6 0h4v4h-4v-4z" fill="currentColor"/> </svg>';
    const ICON_OPEN_EYE = '<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M0 7h2v2H0V7zm4 4H2V9h2v2zm4 2v-2H4v2H2v2h2v-2h4zm8 0H8v2H6v2h2v-2h8v2h2v-2h-2v-2zm4-2h-4v2h4v2h2v-2h-2v-2zm2-2v2h-2V9h2zm0 0V7h2v2h-2z" fill="currentColor"/> </svg>';
    const ICON_CLOSED_EYE = '<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M8 6h8v2H8V6zm-4 4V8h4v2H4zm-2 2v-2h2v2H2zm0 2v-2H0v2h2zm2 2H2v-2h2v2zm4 2H4v-2h4v2zm8 0v2H8v-2h8zm4-2v2h-4v-2h4zm2-2v2h-2v-2h2zm0-2h2v2h-2v-2zm-2-2h2v2h-2v-2zm0 0V8h-4v2h4zm-10 1h4v4h-4v-4z" fill="currentColor"/> </svg>';

    const $node = document.createElement('div');
    $node.className = 'tree-node';

    // depth 0 -> first level
    if (depth === 0)
    {
      $node.style.paddingLeft = '0px';
    }

    const $icon = document.createElement('div');
    $icon.className = 'tree-node__icon';
    $icon.innerHTML = ICON_ARROW_RIGHT;

    const $action = document.createElement('div');
    $action.className = 'tree-node__action';
    $action.innerHTML = object3d.visible ? ICON_CLOSED_EYE : ICON_OPEN_EYE;

    const $label = document.createElement('div');
    $label.className = 'tree-node__label';
    $label.textContent = object3d.name || object3d.type;

    const $label_wrapper = document.createElement('div');
    $label_wrapper.className = 'tree-node__label-wrapper';
    $label_wrapper.appendChild($icon);
    $label_wrapper.appendChild($label);
    $label_wrapper.appendChild($action);

    const $children = document.createElement('div');
    $children.className = 'tree-node__children';
    $children.style.display = 'none';

    $node.appendChild($label_wrapper);
    $node.appendChild($children);
    $container.appendChild($node);

    const toggle_children_visibility = (parent, visible) =>
    {
      parent.visible = visible;
      for (let i = 0; i < parent.children.length; i++)
      {
        const child = parent.children[i];
        child.visible = visible;
        toggle_children_visibility(child, visible);
      }
    };

    const update_children_eye_icons = (parent, visible) =>
    {
      const parent_node = parent.userData.tree_node;
      if (parent_node)
      {
        const action_icon = parent_node.querySelector('.tree-node__action');
        if (action_icon)
        {
          action_icon.innerHTML = visible ? ICON_CLOSED_EYE : ICON_OPEN_EYE;
        }
      }
      for (let i = 0; i < parent.children.length; i++)
      {
        const child = parent.children[i];
        update_children_eye_icons(child, visible);
      }
    };

    object3d.userData.tree_node = $node;

    if (object3d.children.length > 0)
    {
      for (let i = 0; i < object3d.children.length; i++)
      {
        const child = object3d.children[i];
        this.build_hierarchy_tree(child, $children, depth + 1);
      }

      $label_wrapper.addEventListener('click', () =>
      {
        const is_collapsed = $children.style.display === 'none';
        $children.style.display = is_collapsed ? 'block' : 'none';
        $icon.innerHTML = is_collapsed ? ICON_ARROW_DOWN : ICON_ARROW_RIGHT;
      });

      $action.addEventListener('click', (e) =>
      {
        e.stopPropagation();
        const new_visibility = !object3d.visible;
        toggle_children_visibility(object3d, new_visibility);
        update_children_eye_icons(object3d, new_visibility);
      });
    }
    else
    {
      $icon.innerHTML = ICON_OBJECT;
      $action.addEventListener('click', (e) =>
      {
        e.stopPropagation();
        object3d.visible = !object3d.visible;
        $action.innerHTML = object3d.visible ? ICON_CLOSED_EYE : ICON_OPEN_EYE;
      });
    }

    $label.addEventListener('click', () => this.parent.handle_object_click(object3d));
    $icon.addEventListener('click', () => this.parent.handle_object_click(object3d));
  }

  handle_mouse_up()
  {
    this.is_resizing = false;
    this.is_dragging = false;
  }
}

export { HierarchyTree };
