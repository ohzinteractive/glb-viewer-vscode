import { execSync } from 'child_process';
import fs from 'fs';

class CreateTag
{
  create()
  {
    try
    {
      const package_json = JSON.parse(fs.readFileSync('./package.json'));

      const app_version = package_json.version;

      execSync(`git tag -a "v${app_version}" -m "Release Version ${app_version}" && git push origin "v${app_version}"`, { stdio: 'inherit' });
    }
    catch (e)
    {
      console.error('Error:', e);
    }
  }
}

const create_tag = new CreateTag();
create_tag.create();
