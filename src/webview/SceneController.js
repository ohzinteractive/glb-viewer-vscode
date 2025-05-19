import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class SceneController
{
  constructor(parent)
  {
    this.parent = parent;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('.viewer'), antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.hemisphere_light = new THREE.HemisphereLight(0xffffff, 0x444444);
    this.scene.add(this.hemisphere_light);

    this.ambient_light = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(this.ambient_light);

    this.directional_light = new THREE.DirectionalLight(0xffffff, 1);
    this.scene.add(this.directional_light);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.update();

    this.loader = new GLTFLoader();
  }

  init()
  {
    window.addEventListener('resize', () =>
    {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

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

      const box = new THREE.Box3().setFromObject(gltf.scene);
      const size = box.getSize(new THREE.Vector3()).length();
      const center = box.getCenter(new THREE.Vector3());

      this.camera.position.copy(center);
      this.camera.position.z += size * 1.5;
      this.camera.lookAt(center);

      this.renderer.setClearColor(0xeeeeee, 1);

      const grid = new THREE.GridHelper(10, 10);
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

    const box = new THREE.Box3().setFromObject(obj);
    const helper = new THREE.Box3Helper(box, 0xff0000);
    this.selected_outline = helper;
    this.scene.add(helper);
  }

  focus_camera_on_object(obj)
  {
    const box = new THREE.Box3().setFromObject(obj);
    const center = box.getCenter(new THREE.Vector3());

    const size = box.getSize(new THREE.Vector3());
    const bounding_sphere_radius = size.length() / 2;

    const fov = THREE.MathUtils.degToRad(this.camera.fov);
    const aspect = this.renderer.domElement.clientWidth / this.renderer.domElement.clientHeight;

    const distance_for_height = bounding_sphere_radius / Math.sin(fov / 2);
    const distance_for_width = bounding_sphere_radius / Math.sin(Math.atan(Math.tan(fov / 2) * aspect));
    const fit_distance = Math.max(distance_for_height, distance_for_width) * 1.2;

    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    direction.negate();

    const new_position = center.clone().add(direction.multiplyScalar(fit_distance));
    this.camera.position.copy(new_position);

    this.camera.near = fit_distance / 100;
    this.camera.far = fit_distance * 100;
    this.camera.updateProjectionMatrix();

    if (this.controls)
    {
      this.controls.target.copy(center);
      this.controls.update();
    }
  }
}

export { SceneController };
