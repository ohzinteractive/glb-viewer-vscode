const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

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

  // Replace all relative paths to the draco folder
  // html = html.replace(/(["'])\.\/lib\/draco\/([^"']+\.(js|css))\1/g, (match, quote, assetFile) =>
  // {
  //   const assetFullPath = path.join(distPath, 'lib', 'draco', assetFile);
  //   const webviewUri = panel.webview.asWebviewUri(vscode.Uri.file(assetFullPath));
  //   return `${quote}${webviewUri.toString()}${quote}`;
  // });

  // Replace all draco paths with the webview URI
  html = html.replace(/(["'])\.\/lib\/draco\/([^"']+\.(js|wasm))\1/g, (match, quote, fileName) =>
  {
    const assetFullPath = path.join(distPath, 'lib', 'draco', fileName);
    const webviewUri = panel.webview.asWebviewUri(vscode.Uri.file(assetFullPath));
    return `${quote}${webviewUri.toString()}${quote}`;
  });

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
      const fileData = await vscode.workspace.fs.readFile(document.uri);
      const base64Data = Buffer.from(fileData).toString('base64');
      const dataUri = `data:application/octet-stream;base64,${base64Data}`;

      webviewPanel.webview.options = {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(__dirname, 'dist', 'webview')),
          vscode.Uri.file(path.dirname(document.uri.fsPath)),
          vscode.Uri.file(path.join(__dirname, 'dist', 'webview', 'lib', 'draco'))
        ],
        enableFindWidget: true,
        retainContextWhenHidden: true
      };

      webviewPanel.webview.html = getHTML(webviewPanel);

      // Send the data URI to the webview
      webviewPanel.webview.postMessage({
        type: 'loadModel',
        dataUri
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
}

function deactivate()
{}

module.exports = {
  activate,
  deactivate
};
