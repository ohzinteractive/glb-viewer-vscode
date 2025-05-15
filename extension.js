const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function setupWebview(panel)
{
  const distPath = path.join(__dirname, 'dist', 'webview');
  const htmlPath = path.join(distPath, 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf8');

  // Replace all /assets/... with webview URIs
  html = html.replace(/(["'])\/assets\/([^"']+\.(js|css))\1/g, (match, quote, assetFile) =>
  {
    const assetFullPath = path.join(distPath, 'assets', assetFile);
    const webviewUri = panel.webview.asWebviewUri(vscode.Uri.file(assetFullPath));
    return `${quote}${webviewUri.toString()}${quote}`;
  });

  console.log('html', html);
  panel.webview.html = html;
}

function activate(context)
{
  context.subscriptions.push(
    vscode.window.registerWebviewPanelSerializer('customView', {
      async deserializeWebviewPanel(panel)
      {
        console.log('deserializeWebviewPanel');
        setupWebview(panel);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('extension.openCustomWebview', () =>
    {
      const panel = vscode.window.createWebviewPanel('customView', 'Custom View', vscode.ViewColumn.One, {
        enableScripts: true
      });
      setupWebview(panel);
    })
  );
}

function deactivate()
{}

module.exports = {
  activate,
  deactivate
};
