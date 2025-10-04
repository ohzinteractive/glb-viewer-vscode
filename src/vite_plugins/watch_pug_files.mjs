import fs from 'fs';
import path from 'path';

const watchPugFiles = () =>
{
  return {
    name: 'watch-all-pug',
    buildStart()
    {
      // Recursively add all .pug files in your glb-viewer-core/src/webview directory
      const walk = dir =>
      {
        fs.readdirSync(dir).forEach(file =>
        {
          const fullPath = path.join(dir, file);
          if (fs.statSync(fullPath).isDirectory())
          {
            walk(fullPath);
          }
          else if (file.endsWith('.pug'))
          {
            this.addWatchFile(fullPath);
          }
        });
      };
      walk(path.resolve(__dirname, '../../glb-viewer-core/src/webview'));
    }
  };
};

export { watchPugFiles };
