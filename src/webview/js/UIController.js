import { Details } from './Details';
import { HierarchyTree } from './HierarchyTree';
import { Settings } from './Settings';

class UIController
{
  constructor()
  {
    this.details = new Details(this);
    this.hierarchy_tree = new HierarchyTree(this);
    this.settings = new Settings(this);
  }

  init(scene_controller)
  {
    this.scene_controller = scene_controller;

    this.details.init();
    this.hierarchy_tree.init(this.scene_controller, this.details);
    this.settings.init();
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
  }

  build_hierarchy_tree(object3d)
  {
    this.hierarchy_tree.build_hierarchy_tree(object3d);
  }

  handle_action_click(action, active)
  {
    this.scene_controller.handle_action_click(action, active);
  }
}

export { UIController };
