import { HierarchyNode } from './HierarchyNode';
import { HierarchySearchController } from './HierarchySearchController';
import { ResizableWindow } from './ResizeableWindow';

class HierarchyTree extends ResizableWindow
{
  constructor(panel, name)
  {
    const container = document.querySelector('.tree');
    const drag_handle = container.querySelector('.tree-header');
    const content_container = container.querySelector('.tree-content');

    super(container, drag_handle, content_container);

    this.name = name;
    this.panel = panel;
    this.$close_button = this.$container.querySelector('.tree-header__close');

    this.$close_button.addEventListener('click', this.handle_close_button_click.bind(this));

    this.search_controller = new HierarchySearchController(this);
  }

  init(scene_controller, details_panel)
  {
    this.scene_controller = scene_controller;
    this.details_panel = details_panel;
  }

  show()
  {
    this.$container.classList.remove('hidden');
  }

  hide()
  {
    this.$container.classList.add('hidden');
  }

  unhighlight_all()
  {
    this.first_node.unhighlight();
  }

  build_hierarchy_tree(object3d)
  {
    this.first_node = new HierarchyNode(object3d, this.panel, this);
    const $node = this.first_node.get_element();
    this.$content_container.appendChild($node);

    this.first_node.expand_down_until_depth(3);
  }

  find_node_by_object3d(object3d)
  {
    return this.first_node.find_node_by_object3d(object3d);
  }

  handle_object_click(object3d)
  {
    const node = this.find_node_by_object3d(object3d);
    if (node)
    {
      node.expand_up();
      this.unhighlight_all();
      node.highlight();
    }
  }

  find_object3d_by_name(name)
  {
    return this.first_node.find_object3d_by_name(name);
  }

  handle_close_button_click()
  {
    this.hide();
    this.panel.deactivate_button(this.name);
  }

  expand_all()
  {
    this.first_node.expand_down();
  }
}

export { HierarchyTree };
