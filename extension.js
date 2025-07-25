const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

// const _disposables = [];

function getHTML(panel)
{
  const distPath = path.join(__dirname, 'dist', 'webview');
  const htmlPath = path.join(distPath, 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf8');

  // Replace all asset references with webview URIs
  html = html.replace(/(["'])(\/assets\/[^"']+\.(js|css))\1/g, (match, quote, assetPath) =>
  {
    const assetFullPath = path.join(distPath, assetPath);
    const webviewUri = panel.webview.asWebviewUri(vscode.Uri.file(assetFullPath));
    return `${quote}${webviewUri.toString()}${quote}`;
  });

  // Also replace any relative paths to assets
  html = html.replace(/(["'])\.\/assets\/([^"']+\.(js|css))\1/g, (match, quote, assetFile) =>
  {
    const assetFullPath = path.join(distPath, 'assets', assetFile);
    const webviewUri = panel.webview.asWebviewUri(vscode.Uri.file(assetFullPath));
    return `${quote}${webviewUri.toString()}${quote}`;
  });

  html = html.replace(
    'content="content-security-policy-replaced-on-extension-js"',
    `default-src 'none'; 
     img-src ${panel.webview.cspSource} https: data: blob:;
     script-src ${panel.webview.cspSource}; 
     style-src ${panel.webview.cspSource} 'unsafe-inline'; 
     connect-src ${panel.webview.cspSource} https:;"
    `
  );

  return html;
}

class GLBDocument
{
  constructor(uri)
  {
    this.uri = uri;
  }

  dispose()
  {

  }
}

// function disposePanel(panel)
// {
//   console.log('Disposing panel:', panel.title);
//   // Clean up our resources
//   panel.dispose();

//   _disposables.forEach(d => d.dispose());
//   _disposables.length = 0; // Clear the disposables array
// }

function getRootPath(webviewPanel)
{
  // console.log('getRootPath');

  // Handle requests for library URIs
  const rootPath = path.join(__dirname);
  const rootUri = webviewPanel.webview.asWebviewUri(vscode.Uri.file(rootPath));

  return rootUri.toString();
}

function checkFileExtensionDefaults(context)
{
  const gltfPromptedKey = 'gltfEditorPromptShown';

  // Reset question for testing
  // context.globalState.update('gltfEditorPromptShown', false);

  const alreadyPrompted = context.globalState.get(gltfPromptedKey);

  const disposable = vscode.workspace.onDidOpenTextDocument((document) =>
  {
    if (!alreadyPrompted && document.uri.fsPath.endsWith('.gltf'))
    {
      vscode.window.showInformationMessage(
        'Would you like to use the GLTF Visual Viewer for .gltf files?',
        'Yes', 'No'
      ).then(selection =>
      {
        if (selection === 'Yes')
        {
          const config = vscode.workspace.getConfiguration('workbench');
          const associations = config.get('editorAssociations') || {};
          associations['*.gltf'] = 'glbViewer.customEditor';
          config.update('editorAssociations', associations, vscode.ConfigurationTarget.Global).then(async() =>
          {
            // Reopen the file with your custom editor
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor && activeEditor.document.uri.fsPath.endsWith('.gltf'))
            {
              const uri = activeEditor.document.uri;
              await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
              await vscode.commands.executeCommand('vscode.openWith', uri, 'glbViewer.customEditor');
            }
          });

          context.globalState.update(gltfPromptedKey, true);
        }
        else
        {
          context.globalState.update(gltfPromptedKey, true);
        }
      });
    }
  });

  context.subscriptions.push(disposable);
}

function activate(context)
{
  const provider =
  {
    async openCustomDocument(uri, openContext, token)
    {
      return new GLBDocument(uri);
    },

    async resolveCustomEditor(document, webviewPanel, _token)
    {
      console.log('Resolving custom editor for:', document.uri.toString());

      const rootUri = webviewPanel.webview.asWebviewUri(document.uri);
      const dataUri = rootUri.toString();

      webviewPanel.webview.options = {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(__dirname, 'dist', 'webview')),
          vscode.Uri.file(path.dirname(document.uri.fsPath))
        ],
        enableFindWidget: true,
        retainContextWhenHidden: true
      };

      webviewPanel.webview.html = getHTML(webviewPanel, dataUri);

      // Listen for messages from the WebView
      webviewPanel.webview.onDidReceiveMessage(message =>
      {
        if (message.type === 'ready')
        {
          // console.log('WebView is ready');
          webviewPanel.webview.postMessage({
            type: 'updateConfig',
            config: vscode.workspace.getConfiguration('glbViewer')
          });

          webviewPanel.webview.postMessage({
            type: 'setRootPath',
            root_path: getRootPath(webviewPanel)
          });

          webviewPanel.webview.postMessage({
            type: 'loadModel',
            dataUri
          });
        }
        if (message.command === 'openJson')
        {
          const jsonContent = JSON.stringify(message.payload, null, 2);

          vscode.workspace.openTextDocument({
            content: jsonContent,
            language: 'json'
          }).then(doc =>
          {
            vscode.window.showTextDocument(doc, vscode.ViewColumn.Active, true);
          });
        }
      });

      // webviewPanel.onDidChangeViewState(e =>
      // {
      //   console.log('onDidChangeViewState', e.webviewPanel.title);

      //   if (e.webviewPanel.visible)
      //   {
      //     console.log('WebView is now visible');

      //     webviewPanel.webview.postMessage({
      //       type: 'startRenderLoop'
      //     });
      //   }
      //   else
      //   {
      //     webviewPanel.webview.postMessage({
      //       type: 'stopRenderLoop'
      //     });
      //   }
      // });

      // webviewPanel.onDidDispose(() => disposePanel(webviewPanel), null, _disposables);

      vscode.workspace.onDidChangeConfiguration((event) =>
      {
        if (event.affectsConfiguration('glbViewer.relevant3dObjectKeys'))
        {
          webviewPanel.webview.postMessage({
            type: 'updateConfig',
            config: vscode.workspace.getConfiguration('glbViewer')
          });
        }
        if (event.affectsConfiguration('glbViewer.prettifyPropertyLabels'))
        {
          webviewPanel.webview.postMessage({
            type: 'updateConfig',
            config: vscode.workspace.getConfiguration('glbViewer')
          });
        }
      });
    }
  };

  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(
      'glbViewer.customEditor',
      provider,
      {
        webviewOptions: {
          retainContextWhenHidden: true
        }
      }
    )
  );

  checkFileExtensionDefaults(context);
}

function deactivate()
{}

module.exports = {
  activate,
  deactivate
};
