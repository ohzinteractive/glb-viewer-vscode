import { VertexNormalsHelper, VertexTangentsHelper } from 'three/examples/jsm/Addons.js';
import { Renderer } from './Renderer.js';

import { InputController } from 'pit-js';
import {
  AlwaysDepth,
  AmbientLight,
  ArrowHelper,
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
  Object3D,
  PerspectiveCamera,
  PMREMGenerator,
  Raycaster,
  Scene,
  SkinnedMesh,
  Vector3
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { AnimationController } from './AnimationController.js';
import { StudioLightScene } from './StudioLightScene.js';
import { Time } from './Time.js';

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

    this.animation_controller = new AnimationController();
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
    this.grid.material.depthWrite = false;
    this.grid.renderOrder = -999999;
    this.scene.add(this.grid);

    const wireframe_material = new MeshBasicMaterial({ color: '#50AF8E', wireframe: true, depthTest: false, depthFunc: AlwaysDepth, depthWrite: false, transparent: true, opacity: 0.5 });
    this.selected_mesh = new Mesh(new BufferGeometry(), wireframe_material);
    this.selected_mesh.renderOrder = 500;
    this.selected_skinned_mesh = new SkinnedMesh(new BufferGeometry(), wireframe_material.clone());
    this.selected_skinned_mesh.renderOrder = 500;

    this.selected_empty_object = new Object3D();

    const right_arrow   = new ArrowHelper(new Vector3(1, 0, 0), new Vector3(0, 0, 0), 1, '#EA334C');
    const up_arrow      = new ArrowHelper(new Vector3(0, 1, 0), new Vector3(0, 0, 0), 1, '#80CA1E');
    const forward_arrow = new ArrowHelper(new Vector3(0, 0, 1), new Vector3(0, 0, 0), 1, '#2D83E8');

    this.selected_empty_object.add(right_arrow);
    this.selected_empty_object.add(up_arrow);
    this.selected_empty_object.add(forward_arrow);

    this.axis_helper = new Object3D();

    this.axis_helper.add(new ArrowHelper(new Vector3(1, 0, 0), new Vector3(0, 0, 0), 1, '#EA334C', 0));
    this.axis_helper.add(new ArrowHelper(new Vector3(0, 1, 0), new Vector3(0, 0, 0), 1, '#80CA1E', 0));
    this.axis_helper.add(new ArrowHelper(new Vector3(0, 0, 1), new Vector3(0, 0, 0), 1, '#2D83E8', 0));

    this.scene.add(this.axis_helper);

    this.selected_empty_object.traverse(child =>
    {
      if (child.material)
      {
        child.material.depthTest = false;
        child.material.depthFunc = AlwaysDepth;
        child.renderOrder = 99999;
      }
    });

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
      console.log('GLB loaded', gltf);
      this.model = gltf.scene;
      this.gltf = gltf;
      this.animation_controller.init_gltf(gltf);

      this.scene.add(this.model);
      this.model.updateMatrixWorld(true);
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
      this.ui_controller.update_panel_contents(this.model);
      this.focus_camera_on_object(this.model, false);

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
    this.controls.update();
    this.animation_controller.update();
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

        const visible_intersection = intersections.find(inter => inter.object.visible);
        if (visible_intersection)
        {
          this.handle_object_click(visible_intersection.object);
        }
        else
        {
          this.selected_mesh.visible = false;
          this.selected_skinned_mesh.visible = false;
          this.selected_empty_object.visible = false;
        }
      }
    }
    this.selected_empty_object.scale.setScalar(this.getWorldSizeFromScreenSize(100, this.selected_empty_object.position, this.camera));
    this.renderer.render(this.scene, this.camera);
    this.input.clear();
  }

  getWorldSizeFromScreenSize(desiredScreenSize, target_pos, camera)
  {
    const vFov = (camera.fov * Math.PI) / 180; // Convert vertical FOV to radians
    const heightAtDistance = 2 * Math.tan(vFov / 2) * camera.position.distanceTo(target_pos);
    return (desiredScreenSize / window.innerHeight) * heightAtDistance;
  }

  animate(elapsed_time)
  {
    Time.update(elapsed_time);
    this.update();
    requestAnimationFrame(this.animate.bind(this));
  }

  subscribe(object)
  {
    this.subscribers.push(object);
  }

  highlight_object(obj)
  {
    this.selected_mesh.visible = false;
    this.selected_skinned_mesh.visible = false;
    this.selected_empty_object.visible = false;
    this.selected_skinned_mesh.removeFromParent();
    this.selected_mesh.removeFromParent();
    this.selected_empty_object.removeFromParent();

    if (obj.geometry)
    {
      if (obj.isSkinnedMesh)
      {
        this.selected_skinned_mesh.visible = true;
        this.selected_skinned_mesh.geometry = obj.geometry;
        this.selected_skinned_mesh.skeleton = obj.skeleton;
        this.selected_skinned_mesh.morphTargetDictionary = obj.morphTargetDictionary;
        this.selected_skinned_mesh.morphTargetInfluences = obj.morphTargetInfluences;
        this.scene.add(this.selected_skinned_mesh);
        // console.log('SKINNED MESH SELECTED', obj, this.selected_skinned_mesh);
      }
      else
      {
        this.selected_mesh.visible = true;
        this.selected_mesh.geometry = obj.geometry;
        this.selected_mesh.morphTargetDictionary = obj.morphTargetDictionary;
        this.selected_mesh.morphTargetInfluences = obj.morphTargetInfluences;
        this.scene.add(this.selected_mesh);
        // console.log('NORMAL OBJECT SELECTED', obj, this.selected_mesh);
      }
      obj.getWorldPosition(this.selected_mesh.position);
      obj.getWorldScale(this.selected_mesh.scale);
      obj.getWorldQuaternion(this.selected_mesh.quaternion);
    }

    if (this.axis_helper.visible)
    {
      this.selected_empty_object.visible = true;
    }
    this.scene.add(this.selected_empty_object);
    obj.getWorldPosition(this.selected_empty_object.position);
    obj.getWorldQuaternion(this.selected_empty_object.quaternion);
  }

  focus_camera_on_object(obj, highlight = true)
  {
    if (highlight)
    {
      this.highlight_object(obj);
    }
    const box = new Box3().setFromObject(obj);
    const center = box.getCenter(new Vector3());

    if (center.length() < 0.001)
    {
      obj.getWorldPosition(center);
    }
    const size = box.getSize(new Vector3());
    const bounding_sphere_radius = size.length() / 2;

    const fov = MathUtils.degToRad(this.camera.fov);
    const aspect = this.camera.aspect;

    const distance_for_height = Math.max(1, bounding_sphere_radius) / Math.sin(fov / 2);
    const distance_for_width = Math.max(1, bounding_sphere_radius) / Math.sin(Math.atan(Math.tan(fov / 2) * aspect));
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
    case 'origin-arrows':
      this.toggle_origin_arrows(active);
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
    this.selected_skinned_mesh.material.visible = active;
  }

  toggle_origin_arrows(active)
  {
    this.axis_helper.visible = active;
    this.selected_empty_object.visible = active;
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
