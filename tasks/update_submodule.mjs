import { execSync } from 'child_process';

execSync(`git submodule update --init ${process.argv[2]} || echo 'Done'`, { stdio: 'inherit' });
execSync(`cd ${process.argv[2]} && git pull origin main`, { stdio: 'inherit' });
