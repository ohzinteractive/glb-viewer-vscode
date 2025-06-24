import { SceneController } from './SceneController';
import { UIController } from './UiController';

/* global acquireVsCodeApi */
class MainApplication
{
  constructor()
  {
    this.ui_controller = new UIController(this);
    this.scene_controller = new SceneController(this);

    this.vscode = acquireVsCodeApi();
  }

  init()
  {
    this.ui_controller.init(this.scene_controller);
    this.scene_controller.init(this.ui_controller);

    // Listen for messages from the extension
    window.addEventListener('message', event =>
    {
      const message = event.data;
      switch (message.type)
      {
      case 'loadModel':
        this.scene_controller.loadModel(message.dataUri);
        break;
      case 'setRootPath':
        this.scene_controller.setLibURIs(message.root_path);
        break;
      }
    });

    this.vscode.postMessage({ type: 'ready' });
  }
}

document.addEventListener('DOMContentLoaded', () =>
{
  console.log('WebView loaded!');

  const main_application = new MainApplication();
  main_application.init();
});
