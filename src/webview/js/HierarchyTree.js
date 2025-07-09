import { HierarchyNode } from './HierarchyNode';
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
    this.$header = drag_handle;
    this.$content = content_container;
    this.$close_button = container.querySelector('.tree-header__close');

    this.$close_button.addEventListener('click', this.handle_close_button_click.bind(this));
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
    this.$content.appendChild($node);
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
      node.highlight();
    }
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

  expand_up(node)
  {
    const parent = node.parentElement;
    if (parent)
    {
      const wrapper = parent.querySelector('.tree-node__label-wrapper');
      const children_node = node.querySelector('.tree-node__children');
      children_node.style.display = 'block';

      if (node.dataset.is_geometry === 'false' && node.dataset.is_empty_object === 'false')
      {
        wrapper.querySelector('.tree-node__icon').innerHTML = this.icons.ICON_ARROW_DOWN;
      }
      this.expand_up(parent);
    }
  }

  highlight_selected_node(node)
  {
    const wrapper = node.querySelector('.tree-node__label-wrapper');
    wrapper.classList.add('tree-node__label-wrapper--selected');
  }
}

export { HierarchyTree };
