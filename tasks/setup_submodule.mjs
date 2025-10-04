import { execSync } from 'child_process';
import fs from 'fs';

class SetupSubmodule
{
  async read_folder(folder)
  {
    try
    {
      const files = await fs.promises.readdir(folder);

      // If submodule folder is corrupted, remove it and add it again.
      if (files.length < 3)
      {
        fs.rmSync(process.argv[2], { recursive: true, force: true });
      }
    }
    catch (e)
    {
      console.error('Error:', e);
    }

    execSync(`git submodule add -f https://github.com/ohzinteractive/${process.argv[2]}`, { stdio: 'inherit' });
  }
}

const setup_submodule = new SetupSubmodule();
setup_submodule.read_folder(`./${process.argv[2]}`);
