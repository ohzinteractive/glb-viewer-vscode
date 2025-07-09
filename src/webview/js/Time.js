class Time
{
  constructor()
  {
    this.delta_time = 0;
    this.elapsed_time = 0;
    this.previous_elapsed_time = 0;
  }

  update(elapsed_time)
  {
    this.delta_time = (elapsed_time - this.previous_elapsed_time) / 1000;
    this.elapsed_time = elapsed_time / 1000;
    this.previous_elapsed_time = elapsed_time;
  }
}

const time = new Time();
export { time as Time };
