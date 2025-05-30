import { spawn } from 'child_process';

class StartApp
{
  constructor()
  {
    this.vite_process = null;
    this.copy_process = null;
  }

  async start(env_variables_string)
  {
    try
    {
      const env_variables = this.get_env_variables(env_variables_string);

      Object.assign(env_variables, process.env);

      this.run_vite_process(env_variables);

      // Handle termination
      const terminate = () =>
      {
        console.log('\nStopping processes...');

        if (this.copy_process)
        {
          this.copy_process.kill('SIGINT');
        }
        if (this.vite_process)
        {
          this.vite_process.kill('SIGINT');
        }

        // Exit after a short delay to allow cleanup
        setTimeout(() => process.exit(), 1000);
      };

      process.on('SIGINT', terminate);
      process.on('SIGTERM', terminate);
    }
    catch (e)
    {
      console.error('Error:', e);
    }
  }

  run_vite_process(env_variables)
  {
    console.log('run_vite_process, Starting Vite process...');

    this.vite_process = spawn('yarn', ['watch'], { env: env_variables, shell: true }); //, { stdio: 'pipe' }

    this.vite_process.stdout.on('data', (data) =>
    {
      const data_str = '' + data;

      console.log(data_str);

      if (data_str.includes('built in'))
      {
        console.log('Vite process started');

        if (!this.copy_process)
        {
          this.run_copy_process(env_variables);
        }
      }
    });
  }

  run_copy_process(env_variables)
  {
    console.log('run_copy_process, Starting copy process...');

    this.copy_process = spawn('yarn', ['copy-public'], { shell: true, env: env_variables });

    this.copy_process.stdout.on('data', (data) =>
    {
      // const data_str = '' + data;
      console.log('Stdout1: ' + data);
    });

    this.copy_process.stderr.on('data', (data) =>
    {
      const data_str = '' + data;

      console.log(data_str);
    });
  }

  get_env_variables(env_variables_string)
  {
    const env_variables = {};

    if (env_variables_string)
    {
      const env_variables_array = env_variables_string.split(',');

      for (const env_variable of env_variables_array)
      {
        const env_variable_array = env_variable.split('=');
        env_variables[env_variable_array[0]] = env_variable_array[1];
      }
    }

    return env_variables;
  }
}

const start_app = new StartApp();
start_app.start(process.argv[2] === 'true', process.argv[3]);
