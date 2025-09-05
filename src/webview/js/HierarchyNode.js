class HierarchyNode
{
  constructor(object3d, panel, tree, parent = null)
  {
    this.object3d = object3d;

    this.children = [];
    this.parent = parent;
    this.is_geometry = !!object3d.geometry;
    this.is_empty_object = !object3d.geometry && object3d.children.length === 0;
    this.is_bone = object3d.isBone;
    this.is_armature = this.is_bone === false && (object3d.children.length > 0 && object3d.children[0].isBone);
    this.is_visible = object3d.visible;
    this.is_selected = false;
    this.$element = null;
    this.$icon = null;
    this.$folder_icon = null;
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
      ICON_GEOMETRY: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-vector-square-icon lucide-vector-square"><path d="M19.5 7a24 24 0 0 1 0 10"/><path d="M4.5 7a24 24 0 0 0 0 10"/><path d="M7 19.5a24 24 0 0 0 10 0"/><path d="M7 4.5a24 24 0 0 1 10 0"/><rect x="17" y="17" width="5" height="5" rx="1"/><rect x="17" y="2" width="5" height="5" rx="1"/><rect x="2" y="17" width="5" height="5" rx="1"/><rect x="2" y="2" width="5" height="5" rx="1"/></svg>',
      ICON_OBJECT: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-box-icon lucide-box"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',
      ICON_INSTANCED_MESH: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-boxes-icon lucide-boxes"><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/><path d="m7 16.5-4.74-2.85"/><path d="m7 16.5 5-3"/><path d="M7 16.5v5.17"/><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"/><path d="m17 16.5-5-3"/><path d="m17 16.5 4.74-2.85"/><path d="M17 16.5v5.17"/><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"/><path d="M12 8 7.26 5.15"/><path d="m12 8 4.74-2.85"/><path d="M12 13.5V8"/></svg>',
      ICON_OPEN_EYE: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',
      ICON_CLOSED_EYE: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-closed-icon lucide-eye-closed"><path d="m15 18-.722-3.25"/><path d="M2 8a10.645 10.645 0 0 0 20 0"/><path d="m20 15-1.726-2.05"/><path d="m4 15 1.726-2.05"/><path d="m9 18 .722-3.25"/></svg>',
      ICON_BONE: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bone-icon lucide-bone"><path fill="currentColor" d="M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z"/></svg>',
      ICON_ARMATURE: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-person-standing-icon lucide-person-standing"><circle cx="12" cy="5" r="1"/><path d="m9 20 3-6 3 6"/><path d="m6 8 6 2 6-2"/><path d="M12 10v4"/></svg>'
    };

    this.total_children_count = 0;
    object3d.traverse(child =>
    {
      this.total_children_count += child.children.length;
    });
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

    this.$action = document.createElement('div');
    this.$action.className = 'tree-node__action';
    this.$action.innerHTML = this.object3d.visible ? this.icons.ICON_OPEN_EYE : this.icons.ICON_CLOSED_EYE;

    this.$label = document.createElement('div');
    this.$label.className = 'tree-node__label';
    this.$label.textContent = (this.object3d.name || this.object3d.type) + (this.total_children_count > 0 ? ` (${this.total_children_count})` : '');

    this.$label_wrapper = document.createElement('div');
    this.$label_wrapper.className = 'tree-node__label-wrapper';

    if (this.object3d.children.length > 0)
    {
      this.$folder_icon = document.createElement('div');
      this.$folder_icon.className = 'tree-node__folder-icon';
      this.$folder_icon.innerHTML = this.icons.ICON_ARROW_RIGHT;
      this.$label_wrapper.appendChild(this.$folder_icon);
      this.$folder_icon.addEventListener('click', (e) => this.handle_icon_click(e));
    }
    else
    {
      this.$element.classList.add('tree-node--leaf');
    }

    this.$icon = document.createElement('div');
    this.$icon.classList.add('tree-node__icon');

    let icon_svg = this.icons.ICON_OBJECT;
    let icon_class = 'tree-node__icon--object';

    // if (this.object3d.children.length > 0)
    // {
    //   icon_svg = this.icons.ICON_OBJECT_GROUP;
    //   icon_class = 'tree-node__icon--object-group';
    // }

    if (this.is_geometry)
    {
      icon_svg = this.icons.ICON_GEOMETRY;
      icon_class = 'tree-node__icon--geometry';

      if (this.object3d.isInstancedMesh)
      {
        icon_svg = this.icons.ICON_INSTANCED_MESH;
      }
    }

    if (this.is_bone)
    {
      icon_svg = this.icons.ICON_BONE;
      icon_class = 'tree-node__icon--bone';
    }

    if (this.is_armature)
    {
      icon_svg = this.icons.ICON_ARMATURE;
      icon_class = 'tree-node__icon--armature';
    }
    this.$icon.innerHTML = icon_svg;
    this.$icon.classList.add(icon_class);

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

    this.$label_wrapper.addEventListener('click', (e) => this.handle_label_click(e));
    this.$action.addEventListener('click', (e) => this.handle_action_click(e));
  }

  get_element()
  {
    return this.$element;
  }

  toggle_visibility()
  {
    this.object3d.visible = !this.object3d.visible;
    this.$action.innerHTML = this.object3d.visible ? this.icons.ICON_OPEN_EYE : this.icons.ICON_CLOSED_EYE;
    for (let i = 0; i < this.children.length; i++)
    {
      this.children[i].toggle_visibility();
    }
  }

  expand()
  {
    if (this.children.length > 0)
    {
      this.is_expanded = true;
      this.$children.style.display = 'block';
      this.$folder_icon.innerHTML = this.icons.ICON_ARROW_DOWN;
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

  expand_down_until_depth(target_depth, current_depth = 0)
  {
    if (current_depth < target_depth)
    {
      this.expand();
      for (let i = 0; i < this.children.length; i++)
      {
        this.children[i].expand_down_until_depth(target_depth, current_depth + 1);
      }
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
    if (this.children.length > 0)
    {
      this.is_expanded = false;
      this.$children.style.display = 'none';
      this.$folder_icon.innerHTML = this.icons.ICON_ARROW_RIGHT;
    }
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
    this.$element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

  find_object3d_by_name(name)
  {
    if (this.object3d.name === name)
    {
      return this.object3d;
    }
    for (let i = 0; i < this.children.length; i++)
    {
      const node = this.children[i].find_object3d_by_name(name);
      if (node)
      {
        return node;
      }
    }
    return null;
  }

  find_nodes_by_name_regex(regex, results = [])
  {
    if (regex.test(this.object3d.name))
    {
      results.push(this);
    }

    for (const child of this.children)
    {
      child.find_nodes_by_name_regex(regex, results);
    }

    return results;
  }

  sort_by_name()
  {
    const children = [...this.children];
    children.sort((a, b) =>
    {
      return a.object3d.name.localeCompare(b.object3d.name);
    });

    for (let i = 0; i < children.length; i++)
    {
      const child = children[i].$element;
      this.$children.appendChild(child);
      this.children[i].sort_by_name();
    }
  }

  sort_by_index()
  {
    for (let i = 0; i < this.children.length; i++)
    {
      const child = this.children[i].$element;
      this.$children.appendChild(child);
      this.children[i].sort_by_index();
    }
  }
}

export { HierarchyNode };
