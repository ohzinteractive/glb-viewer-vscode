import { VertexNormalsHelper, VertexTangentsHelper } from 'three/examples/jsm/Addons.js';
import { Renderer } from './Renderer.js';

import {
  AmbientLight,
  Box3,
  Box3Helper,
  Color,
  DirectionalLight,
  DoubleSide,
  FrontSide,
  GridHelper,
  HemisphereLight,
  MathUtils,
  MeshNormalMaterial,
  PerspectiveCamera,
  Raycaster,
  REVISION,
  Scene,
  Vector3
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { InputController } from 'pit-js';

class SceneController
{
  constructor()
  {
    console.log(REVISION);

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(75, 1, 0.1, 200);
    this.camera.clear_color = new Color('#eeeeee');
    this.camera.clear_alpha = 1;

    this.normal_helpers = [];
    this.tangent_helpers = [];

    const dom_container = document.querySelector('.viewer');
    this.renderer = new Renderer(dom_container);

    this.input = new InputController();
    this.input.init(dom_container);

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

    this.elapsed_time_at_button_pressed = 0;

    this.grid = new GridHelper(10, 10);
    this.scene.add(this.grid);
  }

  init(ui_controller)
  {
    this.ui_controller = ui_controller;
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

      this.ui_controller.build_hierarchy_tree(gltf.scene);
      this.focus_camera_on_object(gltf.scene);
    });
  }

  update()
  {
    this.controls.update();

    if (this.input.left_mouse_button_pressed)
    {
      this.elapsed_time_at_button_pressed = Date.now();
    }

    if (this.input.left_mouse_button_released)
    {
      if (Date.now() - this.elapsed_time_at_button_pressed < 200)
      {
        this.grid.visible = false;
        const raycaster = new Raycaster();
        raycaster.setFromCamera(this.input.NDC, this.camera);
        const intersections = raycaster.intersectObject(this.scene, true);
        if (intersections.length > 0)
        {
          this.focus_camera_on_object(intersections[0].object);
        }
        this.grid.visible = true;
      }
    }

    this.renderer.render(this.scene, this.camera);
    this.input.clear();
  }

  animate()
  {
    this.update();
    requestAnimationFrame(this.animate.bind(this));
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

  // @TODO: handle raycast to call this function
  handle_object_click(object3d)
  {
    this.focus_camera_on_object(object3d);
    this.ui_controller.handle_object_click(object3d);
  }

  handle_action_click(action, active)
  {
    switch (action)
    {
    case 'wireframe':
      this.toggle_wireframe(active);
      break;
    case 'double-sided':
      this.toggle_double_sided(active);
      break;
    case 'normals':
      this.toggle_normals(active);
      break;
    case 'normals-vectors':
      this.toggle_normals_vectors(active);
      break;
    case 'tangents':
      this.toggle_tangents(active);
      break;
    default:
      break;
    }
  }

  toggle_wireframe(active)
  {
    this.scene.traverse(child =>
    {
      if (child.isMesh)
      {
        child.material.wireframe = active;
      }
    });
  }

  toggle_double_sided(active)
  {
    this.scene.traverse(child =>
    {
      if (child.isMesh)
      {
        child.material.side = active ? DoubleSide : FrontSide;
      }
    });
  }

  toggle_normals(active)
  {
    this.scene.overrideMaterial = active ? new MeshNormalMaterial() : null;
  }

  toggle_normals_vectors(active)
  {
    if (active)
    {
      this.scene.traverse(child =>
      {
        if (child.isMesh)
        {
          const normal_helper = new VertexNormalsHelper(child, 1, 0x00ff00);
          this.normal_helpers.push(normal_helper);
          this.scene.add(normal_helper);
        }
      });
    }
    else
    {
      for (let i = 0; i < this.normal_helpers.length; i++)
      {
        this.scene.remove(this.normal_helpers[i]);
      }
      this.normal_helpers = [];
    }
  }

  toggle_tangents(active)
  {
    if (active)
    {
      this.scene.traverse(child =>
      {
        if (child.isMesh)
        {
          if (!child.geometry.attributes.tangent)
          {
            child.geometry.computeTangents();
          }
          const tangent_helper = new VertexTangentsHelper(child, 1, 0x00ff00);
          this.tangent_helpers.push(tangent_helper);
          this.scene.add(tangent_helper);
        }
      });
    }
    else
    {
      for (let i = 0; i < this.tangent_helpers.length; i++)
      {
        this.scene.remove(this.tangent_helpers[i]);
      }
      this.tangent_helpers = [];
    }
  }
}

export { SceneController };
