import { Details } from './Details';
import { HierarchyTree } from './HierarchyTree';

class UIController
{
  constructor(parent)
  {
    this.parent = parent;

    this.details = new Details(this);
    this.hierarchy_tree = new HierarchyTree(this);
  }

  init()
  {
    this.details.init();
    this.hierarchy_tree.init();

    document.addEventListener('mouseup', () =>
    {
      this.hierarchy_tree.handle_mouse_up();
      this.details.handle_mouse_up();
      document.body.style.cursor = 'default';
    });

    document.addEventListener('mousemove', (e) =>
    {
      this.hierarchy_tree.handle_mouse_move(e);
      this.details.handle_mouse_move(e);
    });
  }

  update()
  {

  }

  handle_object_click(object3d)
  {
    this.details.handle_object_click(object3d);
    if (object3d.isObject3D || object3d.isMesh)
    {
      this.parent.focus_camera_on_object(object3d);
    }
  }

  build_hierarchy_tree(object3d)
  {
    this.hierarchy_tree.build_hierarchy_tree(object3d);
  }
}

export { UIController };
