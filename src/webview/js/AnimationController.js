import { AnimationMixer, Object3D } from 'three';
import { Time } from './Time';

export class AnimationController
{
  constructor()
  {
    this.scene = new Object3D();
    this.animations = [];

    this.mixer = new AnimationMixer(this.scene);
  }

  init_gltf(gltf)
  {
    this.scene.add(gltf.scene);
    this.animations = gltf.animations;

    this.mixer = new AnimationMixer(this.scene);
    this.play_animations();
  }

  play_animations(clamp = false)
  {
    this.animations.forEach(clip =>
    {
      const action = this.mixer.clipAction(clip);
      action.play();
    });

    this.elapsed_time = 0;
  }

  play_animation(animation)
  {
    const action = this.mixer.clipAction(animation);
    action.play();
  }

  stop_animation(animation)
  {
    const action = this.mixer.clipAction(animation);
    action.stop();
  }

  update()
  {
    this.mixer.update(Time.delta_time);
  }
}
