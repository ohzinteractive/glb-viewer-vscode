import { Renderer } from './Renderer.js';

import {
  AmbientLight,
  Box3,
  Box3Helper,
  Color,
  DirectionalLight,
  GridHelper,
  HemisphereLight,
  MathUtils,
  PerspectiveCamera,
  REVISION,
  Scene,
  Vector3
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class SceneController
{
  constructor(parent)
  {
    console.log(REVISION);

    this.parent = parent;
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(75, 1, 0.1, 200);
    this.camera.clear_color = new Color('#eeeeee');
    this.camera.clear_alpha = 1;

    const dom_container = document.querySelector('.viewer');
    this.renderer = new Renderer(dom_container);

    this.hemisphere_light = new HemisphereLight(0xffffff, 0x444444);
    this.scene.add(this.hemisphere_light);

    this.ambient_light = new AmbientLight(0xffffff, 0.5);
    this.scene.add(this.ambient_light);

    this.directional_light = new DirectionalLight(0xffffff, 1);
    this.scene.add(this.directional_light);

    this.controls = new OrbitControls(this.camera, dom_container);
    this.controls.update();

    this.loader = new GLTFLoader();

    this.draco_loader = new DRACOLoader();
    this.draco_loader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.0/');
    this.loader.setDRACOLoader(this.draco_loader);
  }

  init()
  {
    this.animate();
  }

  loadModel(dataUri)
  {
    if (!dataUri)
    {
      console.error('No data URI provided for model loading');
      return;
    }

    this.loader.load(dataUri, (gltf) =>
    {
      console.log('GLB loaded', gltf);
      this.scene.add(gltf.scene);
      gltf.scene.traverse(child =>
      {
        child.frustumCulled = false;
        if (child.geometry)
        {
          if (child.isSkinnedMesh)
          {
            child.computeBoundingBox();
          }
        }
      });

      const box = new Box3().setFromObject(gltf.scene, true);
      const size = box.getSize(new Vector3()).length();
      const center = box.getCenter(new Vector3());

      this.camera.position.copy(center);
      this.camera.position.z += size * 1.5;
      this.camera.lookAt(center);

      const grid = new GridHelper(10, 10);
      this.scene.add(grid);

      this.parent.build_hierarchy_tree(gltf.scene);
      this.focus_camera_on_object(gltf.scene);
    });
  }

  update()
  {
  }

  animate()
  {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  highlight_object(obj)
  {
    if (this.selected_outline)
    {
      this.scene.remove(this.selected_outline);
    }

    const box = new Box3().setFromObject(obj);
    const helper = new Box3Helper(box, 0xff0000);
    this.selected_outline = helper;
    this.scene.add(helper);
  }

  focus_camera_on_object(obj)
  {
    const box = new Box3().setFromObject(obj);
    const center = box.getCenter(new Vector3());

    const size = box.getSize(new Vector3());
    const bounding_sphere_radius = size.length() / 2;

    const fov = MathUtils.degToRad(this.camera.fov);
    const aspect = this.camera.aspect;

    const distance_for_height = bounding_sphere_radius / Math.sin(fov / 2);
    const distance_for_width = bounding_sphere_radius / Math.sin(Math.atan(Math.tan(fov / 2) * aspect));
    const fit_distance = Math.max(distance_for_height, distance_for_width) * 1.2;

    const direction = new Vector3();
    this.camera.getWorldDirection(direction);
    direction.negate();

    const new_position = center.clone().add(direction.multiplyScalar(fit_distance));
    this.camera.position.copy(new_position);
    this.camera.updateProjectionMatrix();

    if (this.controls)
    {
      this.controls.target.copy(center);
      this.controls.update();
    }
  }
}

export { SceneController };
