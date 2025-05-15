const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function setupWebview(panel)
{
  const htmlPath = path.join(__dirname, '../../dist/webview/index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  panel.webview.html = html;
}

function activate(context)
{
  context.subscriptions.push(
    vscode.window.registerWebviewPanelSerializer('customView', {
      async deserializeWebviewPanel(panel)
      {
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
