import { AnimationMixer, Object3D } from 'three';
// import { SkeletonHelper } from 'three';
// import { LoopOnce } from 'three';

// import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

export class AnimatedScene extends Object3D
{
  constructor(animated_gltf)
  {
    super();

    // const scene = SkeletonUtils.clone(animated_gltf.scene);
    const scene = animated_gltf.scene;

    this.animations = animated_gltf.animations;
    // console.log(this.animations);

    this.original_gltf = animated_gltf;

    this.mixer = new AnimationMixer(scene);

    // gltf.animations.forEach((clip) =>
    // {
    //   this.mixer.clipAction(clip).play();
    //   console.log(clip);
    // });

    this.name = animated_gltf.scene.children[0].name;

    // this.duration = 0;
    // for (let i = 0; i < this.animations.length; i++)
    // {
    //   this.duration = Math.max(this.duration, this.animations[i].duration);
    // }
    // const texture = ResourceContainer.get(this.name + '_texture');

    // const material = new MeshBasicMaterial();
    // const material = new MeshBasicMaterial({map: texture});
    // gltf.scene.traverse(child =>
    // {
    //   if (child.material)
    //   {
    //     child.material = material;
    //     child.frustumCulled = false;
    //   }
    // });

    this.add(scene);

    this.elapsed_time = 0;

    this.frustumCulled = false;

    this.play_animation();
  }

  clone()
  {
    return new AnimatedScene(this.original_gltf);
  }

  play_animation(clamp = false)
  {
    this.animations.forEach(clip =>
    {
      const action = this.mixer.clipAction(clip);
      // action.clampWhenFinished = clamp;
      // if (clamp)
      // {
      //   action.setLoop(LoopOnce);
      // }
      // console.log(clip);
      action.play();
    });

    this.elapsed_time = 0;
  }

  update()
  {
    this.mixer.update(0.016);
    this.elapsed_time += 0.016;
  }

  get animation_finished()
  {
    return this.elapsed_time > this.duration;
  }

  // setup_texture()
  // {
  //   const texture = ResourceContainer.get(this.name + '_texture');
  //   texture.flipY = false;

  //   this.traverse(child =>
  //   {
  //     if (child.material)
  //     {
  //       child.material.map = texture;
  //     }
  //   });
  // }
}
