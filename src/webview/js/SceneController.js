import { VertexNormalsHelper, VertexTangentsHelper } from 'three/examples/jsm/Addons.js';
import { Renderer } from './Renderer.js';

import { InputController } from 'pit-js';
import {
  AlwaysDepth,
  AmbientLight,
  Box3,
  BufferGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  FrontSide,
  GridHelper,
  HemisphereLight,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshNormalMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  Raycaster,
  Scene,
  Vector3
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { AnimatedScene } from './AnimatedScene.js';
import { StudioLightScene } from './StudioLightScene.js';

class SceneController
{
  constructor(mainapp)
  {
    this.root_path = '';
    this.mainapp = mainapp;
    // console.log(REVISION);

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(75, 1, 0.1, 1000);
    this.camera.clear_color = new Color('#3F3F3F');
    this.camera.clear_alpha = 1;

    this.normal_helpers = [];
    this.tangent_helpers = [];
    this.line_length = 1;

    const dom_container = document.querySelector('.viewer');
    this.renderer = new Renderer(dom_container);

    this.input = new InputController();
    this.input.init(dom_container);

    this.hemisphere_light = new HemisphereLight(0xffffff, 0x444444);
    // this.scene.add(this.hemisphere_light);

    this.ambient_light = new AmbientLight(0xffffff, 0.5);
    // this.scene.add(this.ambient_light);

    this.directional_light = new DirectionalLight(0xffffff, 1);
    // this.scene.add(this.directional_light);

    this.controls = new OrbitControls(this.camera, dom_container);
    this.controls.update();

    this.loader = new GLTFLoader();

    this.ktx2_loader = new KTX2Loader();
    this.draco_loader = new DRACOLoader();
    this.meshopt_decoder = MeshoptDecoder;

    this.elapsed_time_at_button_pressed = 0;

    this.grid = new GridHelper(10, 10, '#4B4B4B', '#4B4B4B');
    this.scene.add(this.grid);

    this.selected_mesh = new Mesh(new BufferGeometry(), new MeshBasicMaterial({ color: '#50AF8E', wireframe: true, depthTest: false, depthFunc: AlwaysDepth, depthWrite: false, transparent: true, opacity: 0.5 }));
    this.selected_mesh.renderOrder = 500;
    this.scene.add(this.selected_mesh);

    this.subscribers = [];
  }

  init(ui_controller)
  {
    this.ui_controller = ui_controller;
    this.animate();
  }

  setLibURIs(root_path)
  {
    console.log('Setting Root URI:', root_path);

    this.draco_loader.setDecoderPath(`${root_path}/dist/webview/lib/draco/`);
    this.ktx2_loader.setTranscoderPath(`${root_path}/dist/webview/lib/basis/`);

    this.ktx2_loader.detectSupport(this.renderer.renderer);

    this.loader.setDRACOLoader(this.draco_loader);
    this.loader.setKTX2Loader(this.ktx2_loader);
    this.loader.setMeshoptDecoder(this.meshopt_decoder);

    this.root_path = root_path;
  }

  loadModel(dataUri)
  {
    if (!dataUri)
    {
      console.error('No data URI provided for model loading');
      return;
    }
    console.log('Loading model from data URI:', dataUri);

    this.loader.load(dataUri, (gltf) =>
    {
      // console.log('GLB loaded', gltf);
      this.model = new AnimatedScene(gltf);

      this.scene.add(this.model);

      this.model.traverse(child =>
      {
        child.frustumCulled = false;
        if (child.geometry)
        {
          if (child.isSkinnedMesh)
          {
            child.computeBoundingBox();
          }
        }

        child.globalPosition = new Vector3();
        child.globalScale    = new Vector3();
        const child_box            = new Box3();
        child_box.setFromObject(child);
        child_box.getCenter(child.globalPosition);
        child_box.getSize(child.globalScale);
      });

      const box = new Box3().setFromObject(this.model, true);
      const size = box.getSize(new Vector3()).length();
      const center = box.getCenter(new Vector3());

      this.camera.position.copy(center);
      this.camera.position.z += size * 1.5;
      this.camera.lookAt(center);

      if (size < 10)
      {
        this.camera.near = 0.01;
      }
      this.ui_controller.build_hierarchy_tree(this.model);
      this.focus_camera_on_object(this.model);

      for (let i = 0; i < this.subscribers.length; i++)
      {
        const subscriber = this.subscribers[i];
        subscriber.on_model_loaded(this.model);
      }
    });

    const pmrem = new PMREMGenerator(this.renderer.renderer);

    this.renderer.renderer.setClearColor(0x000000);
    this.scene.environment = pmrem.fromScene(new StudioLightScene()).texture;
    // this.scene.background = this.scene.environment;

    // this.scene.add(new Mesh(new SphereGeometry(), new MeshStandardMaterial({
    //   color: 0xffffff,
    //   roughness: 0.1,
    //   metalness: 1
    // })));
  }

  update()
  {
    this.model?.update();
    this.controls.update();

    if (this.input.left_mouse_button_pressed)
    {
      this.elapsed_time_at_button_pressed = Date.now();
    }

    if (this.input.left_mouse_button_released)
    {
      if (Date.now() - this.elapsed_time_at_button_pressed < 200)
      {
        const raycaster = new Raycaster();
        raycaster.setFromCamera(this.input.NDC, this.camera);
        const intersections = raycaster.intersectObject(this.model, true);
        if (intersections.length > 0)
        {
          this.handle_object_click(intersections[0].object);
        }
        else
        {
          this.selected_mesh.visible = false;
        }
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

  subscribe(object)
  {
    this.subscribers.push(object);
  }

  highlight_object(obj)
  {
    if (obj.geometry)
    {
      this.selected_mesh.visible = true;
      this.selected_mesh.geometry = obj.geometry;
      obj.getWorldPosition(this.selected_mesh.position);
      obj.getWorldScale(this.selected_mesh.scale);
      obj.getWorldQuaternion(this.selected_mesh.quaternion);
    }
    else
    {
      this.selected_mesh.visible = false;
    }
    // if (this.selected_outline)
    // {
    //   this.scene.remove(this.selected_outline);
    // }

    // const box = new Box3().setFromObject(obj);
    // const helper = new Box3Helper(box, 0xff0000);
    // this.selected_outline = helper;
    // this.scene.add(helper);
  }

  focus_camera_on_object(obj)
  {
    this.highlight_object(obj);
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

    this.camera.far = Math.max(this.camera.far, fit_distance + size.length());

    if (this.controls)
    {
      this.controls.target.copy(center);
      this.controls.update();
    }
  }

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
    case 'selection-wireframe':
      this.toggle_selection_wireframe(active);
      break;
    default:
      break;
    }
  }

  toggle_wireframe(active)
  {
    this.model.traverse(child =>
    {
      if (child.isMesh)
      {
        child.material.wireframe = active;
      }
    });
  }

  toggle_double_sided(active)
  {
    this.model.traverse(child =>
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
    this.remove_normal_helpers();
    if (active)
    {
      this.populate_normal_helpers();
    }
  }

  remove_normal_helpers()
  {
    for (let i = 0; i < this.normal_helpers.length; i++)
    {
      this.scene.remove(this.normal_helpers[i]);
    }
  }

  populate_normal_helpers()
  {
    this.model.traverse(child =>
    {
      if (child.isMesh)
      {
        const normal_helper = new VertexNormalsHelper(child, this.line_length, 0x00ff00);
        this.normal_helpers.push(normal_helper);
        this.scene.add(normal_helper);
      }
    });
  }

  toggle_tangents(active)
  {
    this.remove_tangent_helpers();
    if (active)
    {
      this.populate_tangent_helpers();
    }
  }

  remove_tangent_helpers()
  {
    for (let i = 0; i < this.tangent_helpers.length; i++)
    {
      this.scene.remove(this.tangent_helpers[i]);
    }
    this.tangent_helpers = [];
  }

  populate_tangent_helpers()
  {
    this.model.traverse(child =>
    {
      if (child.isMesh)
      {
        const geometry = child.geometry;
        // Check if geometry has all required attributes
        if (geometry.attributes.position &&
              geometry.attributes.normal &&
              geometry.attributes.uv &&
              geometry.index)
        {
          if (!geometry.attributes.tangent)
          {
            geometry.computeTangents();
          }
          const tangent_helper = new VertexTangentsHelper(child, this.line_length, 0x00ff00);
          this.tangent_helpers.push(tangent_helper);
          this.scene.add(tangent_helper);
        }
        else
        {
          console.warn('Mesh missing required attributes for tangent computation:', child.name);
        }
      }
    });
  }

  toggle_selection_wireframe(active)
  {
    this.selected_mesh.material.visible = active;
  }

  set_line_length(value)
  {
    this.line_length = value;

    if (this.tangent_helpers.length > 0)
    {
      this.remove_tangent_helpers();
      this.populate_tangent_helpers();
    }

    if (this.normal_helpers.length > 0)
    {
      this.remove_normal_helpers();
      this.populate_normal_helpers();
    }
  }
}

export { SceneController };
