import { Details } from './Details';
import { Panel } from './Panel';
import { Settings } from './Settings';

class UIController
{
  constructor()
  {
    this.details = new Details(this);
    this.panel = new Panel(this);
    this.settings = new Settings(this);
  }

  init(scene_controller)
  {
    this.scene_controller = scene_controller;

    this.details.init();
    this.panel.init(this.scene_controller, this.details);
    this.settings.init(this.scene_controller);
  }

  update()
  {

  }

  handle_object_click(object3d)
  {
    this.details.handle_object_click(object3d);
    this.panel.contents.hierarchy.handle_object_click(object3d);
    this.scene_controller.focus_camera_on_object(object3d);
  }

  update_panel_contents(object3d)
  {
    this.panel.update_contents(object3d);
  }

  handle_action_click(action, active)
  {
    this.scene_controller.handle_action_click(action, active);
  }
}

export { UIController };
