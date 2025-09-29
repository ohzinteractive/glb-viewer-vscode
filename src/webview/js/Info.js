import { ResizableWindow } from './ResizeableWindow';
import { VSCodeContext } from './VSCodeContext';

class Info extends ResizableWindow
{
  constructor(panel, name)
  {
    const container = document.querySelector('.info');
    const drag_handle = container.querySelector('.info-header');
    const content_container = container.querySelector('.info-content');

    super(container, drag_handle, content_container);

    this.name = name;
    this.panel = panel;

    this.$header = drag_handle;
    this.$content = content_container;

    this.$close_button = container.querySelector('.info-header__close');
    this.$close_button.addEventListener('click', this.handle_close_button_click.bind(this));
    this.$inspect_button = this.$container.querySelector('.info-button__inspect-json');
    this.$inspect_button.addEventListener('click', this.handle_inspect_button_click.bind(this));
    this.extension = '';
  }

  init(scene_controller)
  {
    this.scene_controller = scene_controller;
  }

  show()
  {
    this.fill_info();
    this.$container.classList.remove('hidden');
  }

  hide()
  {
    this.$container.classList.add('hidden');
  }

  model_vertex_count(scene)
  {
    let total = 0;
    scene.traverse((child) =>
    {
      if (child.geometry)
      {
        total += child.geometry.getAttribute('position').count;
      }
    });
    return total;
  }

  rendered_vertex_count(scene)
  {
    let total = 0;
    scene.traverse((child) =>
    {
      if (child.geometry && child.isInstancedMesh === undefined)
      {
        total += child.geometry.getAttribute('position').count;
      }
    });
    return total;
  }

  instanced_vertex_count(scene)
  {
    let total = 0;
    scene.traverse((child) =>
    {
      if (child.isInstancedMesh)
      {
        total += child.geometry.getAttribute('position').count * child.count;
      }
    });
    return total;
  }

  fill_info()
  {
    const gltf = this.scene_controller.gltf;
    const model_vertices = this.model_vertex_count(this.scene_controller.model);
    const vertices = this.rendered_vertex_count(this.scene_controller.model);
    const instanced_vertices = this.instanced_vertex_count(this.scene_controller.model);
    this.$content.innerHTML = '';

    this.create_node('drawcalls', 'Drawcalls',   this.scene_controller.scene_drawcall_count);
    this.create_node('geometries', 'Geometries', gltf.parser.json.meshes?.length || 0);
    this.create_node('textures', 'Textures',     gltf.parser.json.textures?.length || 0);
    this.create_node('animations', 'Animations', gltf.animations.length);
    this.create_node('materials', 'Materials',   gltf.parser.json.materials?.length || 0);
    this.create_node('images', 'Images',         gltf.parser.json.images?.length || 0);

    if (instanced_vertices > 0)
    {
      this.create_node('model-vertices', 'Model vertices',     model_vertices);
      this.create_node('drawn-vertices', 'Drawn vertices',     vertices + instanced_vertices);
      this.create_node('regular-vertices',   '---> Regular Vertices', vertices);
      this.create_node('instanced-vertices', '---> Instanced vertices', instanced_vertices);
      this.create_node('generator', 'Generator',  gltf.asset.generator || 'Unknown');
    }
    else
    {
      this.create_node('model-vertices', 'Vertices',     model_vertices);
    }
    if (gltf.parser.json.extensionsUsed)
    {
      this.create_node('extensions', 'Extensions', gltf.parser.json.extensionsUsed.length > 0 ? (gltf.parser.json.extensionsUsed.join('<br> ')) : 'None');
    }
    else
    {
      this.create_node('extensions', 'Extensions', 'None');
    }
  }

  get_texture_count()
  {
    return this.scene_controller.gltf.parser.json.textures?.length || 0;
  }

  get_animation_count()
  {
    return this.scene_controller.animation_controller.animations.length;
  }

  create_node(id, label, value)
  {
    const $node = document.createElement('div');
    const $label = document.createElement('div');
    const $value = document.createElement('div');

    $node.classList.add('info-node');
    $node.classList.add(`info-node--${id}`);
    $label.classList.add('info-node__label');
    $value.classList.add('info-node__value');

    $label.innerHTML = label;
    $value.innerHTML = value;

    $node.appendChild($label);
    $node.appendChild($value);

    this.$content.appendChild($node);
  }

  handle_close_button_click()
  {
    this.hide();
    this.panel.deactivate_button(this.name);
  }

  handle_inspect_button_click()
  {
    if (this.extension === 'gltf')
    {
      this.open_as_text();
    }
    else
    {
      this.open_as_json();
    }
  }

  open_as_json()
  {
    VSCodeContext.ctx.postMessage({
      command: 'openJson',
      payload: this.scene_controller.gltf.parser.json
    });
  }

  open_as_text()
  {
    VSCodeContext.ctx.postMessage({
      command: 'openAsText'
    });
  }

  update_extension(uri)
  {
    this.extension = uri.split('.').pop();
    this.$inspect_button.children[0].textContent = this.extension === 'gltf' ? 'Open as Text' : 'Open as JSON';
  }
}

export { Info };
