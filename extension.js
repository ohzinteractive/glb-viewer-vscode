const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

// const _disposables = [];

function getHTML(panel)
{
  const publicPath = path.join(__dirname, 'public');
  const htmlPath = path.join(publicPath, 'webview', 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf8');

  // Replace all asset references with webview URIs
  html = html.replace(/(["'])(\/webview\/assets\/[^"']+\.(js|css))\1/g, (match, quote, assetPath) =>
  {
    const assetFullPath = path.join(publicPath, assetPath);

    const webviewUri = panel.webview.asWebviewUri(vscode.Uri.file(assetFullPath));
    return `${quote}${webviewUri.toString()}${quote}`;
  });

  // Also replace any relative paths to assets
  html = html.replace(/(["'])\.\/webview\/assets\/([^"']+\.(js|css))\1/g, (match, quote, assetFile) =>
  {
    const assetFullPath = path.join(publicPath, 'assets', assetFile);

    const webviewUri = panel.webview.asWebviewUri(vscode.Uri.file(assetFullPath));
    return `${quote}${webviewUri.toString()}${quote}`;
  });

  html = html.replace(
    '<!-- content-security-policy-replaced-on-extension-js-->',
    `<meta http-equiv="Content-Security-Policy" 
    default-src 'none'; img-src ${panel.webview.cspSource} https: data: blob:; 
    script-src ${panel.webview.cspSource}; 
    style-src ${panel.webview.cspSource} 'unsafe-inline'; 
    connect-src ${panel.webview.cspSource} https:; 
    >`
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

function getWebViewPath(webviewPanel)
{
  // console.log('getWebViewPath');

  // Handle requests for library URIs
  const webviewPath = path.join(__dirname);
  const webviewUri = webviewPanel.webview.asWebviewUri(vscode.Uri.file(webviewPath));

  return `${webviewUri.toString()}/public/webview`;
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

async function sendModelAsBase64(panel, modelUri)
{
  try
  {
    const data = await vscode.workspace.fs.readFile(modelUri); // works with git+ and file+

    const dataBase64 = Buffer.from(data).toString('base64');

    console.log('Sending model data as base64, length:', dataBase64.length);

    // send back as base64 or ArrayBuffer
    panel.webview.postMessage({
      type: 'loadModelFromBase64',
      data: dataBase64
    });
  }
  catch (err)
  {
    vscode.window.showErrorMessage(`Failed to read GLB: ${err}`);
  }
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

      const modelUri = webviewPanel.webview.asWebviewUri(document.uri);
      const modelUriString = modelUri.toString();

      webviewPanel.webview.options = {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(__dirname, 'public', 'webview')),
          vscode.Uri.file(path.dirname(document.uri.fsPath))
        ],
        enableFindWidget: true,
        retainContextWhenHidden: true
      };

      webviewPanel.webview.html = getHTML(webviewPanel, modelUriString);

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
            type: 'setWebViewPath',
            webview_path: getWebViewPath(webviewPanel)
          });

          console.log('Sending modelUri to WebView:', modelUriString);

          if (modelUriString.includes('git'))
          {
            sendModelAsBase64(webviewPanel, document.uri);
          }
          else
          {
            webviewPanel.webview.postMessage({
              type: 'loadModelFromUri',
              dataUri: modelUriString
            });
          }
        }
        if (message.type === 'openJson')
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

        if (message.type === 'openAsText')
        {
          vscode.commands.executeCommand('vscode.openWith', document.uri, 'default');
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

  const openAsTextCommand = vscode.commands.registerCommand('glbViewer.openAsText', async(uri) =>
  {
    if (!uri && vscode.window.activeTextEditor)
    {
      uri = vscode.window.activeTextEditor.document.uri;
    }
    if (!uri) return;

    // Force open with default text editor
    await vscode.commands.executeCommand('vscode.openWith', uri, 'default');
  });

  context.subscriptions.push(openAsTextCommand);

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
