import { SceneController } from './SceneController';
import { UIController } from './UiController';

class MainApplication
{
  constructor()
  {
    this.ui_controller = new UIController(this);
    this.scene_controller = new SceneController(this);
  }

  init()
  {
    this.ui_controller.init();
    this.scene_controller.init();

    // Listen for messages from the extension
    window.addEventListener('message', event =>
    {
      const message = event.data;
      switch (message.type)
      {
      case 'loadModel':
        this.scene_controller.loadModel(message.dataUri);
        break;
      }
    });
  }

  focus_camera_on_object(obj)
  {
    this.scene_controller.focus_camera_on_object(obj);
  }

  build_hierarchy_tree(object3d)
  {
    this.ui_controller.build_hierarchy_tree(object3d);
  }

  handle_action_click(action, active)
  {
    this.scene_controller.handle_action_click(action, active);
  }
}

document.addEventListener('DOMContentLoaded', () =>
{
  console.log('WebView loaded!');

  const main_application = new MainApplication();
  main_application.init();
});
