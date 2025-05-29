import path from 'path';
import pug from 'pug';
import packagejson from '../../package.json';

const renderPug = () =>
{
  const templatePath = path.resolve(__dirname, '../../src/webview/index.pug');

  return {
    name: 'render-pug-to-html',
    transformIndexHtml(html)
    {
      return pug.renderFile(templatePath, {
        package: packagejson
      });
    },
    configureServer(server)
    {
      // Watch the pug file during dev
      server.watcher.add(templatePath);
    }
  };
};

export { renderPug };
