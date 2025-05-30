import { SceneController } from './SceneController';
import { UIController } from './UiController';

// Unregister any existing service workers to speedup plugin initialization
if ('serviceWorker' in navigator)
{
  navigator.serviceWorker.getRegistrations().then(function(registrations)
  {
    for (const registration of registrations)
    {
      registration.unregister(); // WARNING: this affects cache, so test carefully
      // console.log('Unregistered service worker:', registration);
    }
  });
}

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
      case 'setLibURIs':
        this.scene_controller.setLibURIs(message.libs_urls);
        break;
      }
    });

    // TODO: Improve this?
    const lib_names = ['draco', 'basis'];

    this.vscode.postMessage({ type: 'ready', lib_names: lib_names });
  }
}

document.addEventListener('DOMContentLoaded', () =>
{
  console.log('WebView loaded!');

  const main_application = new MainApplication();
  main_application.init();
});
