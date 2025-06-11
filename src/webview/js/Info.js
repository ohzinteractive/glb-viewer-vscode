import { ResizableWindow } from './ResizeableWindow';

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

  rendered_vertex_count(scene)
  {
    let total = 0;
    scene.traverse((child) =>
    {
      if (child.isMesh && child.geometry?.isBufferGeometry)
      {
        const pos = child.geometry.getAttribute('position');
        if (pos) total += pos.count;
      }
    });
    return total;
  }

  fill_info()
  {
    const info = this.scene_controller.renderer.renderer.info;
    const gltf = this.scene_controller.model?.original_gltf;
    const vertices = this.rendered_vertex_count(this.scene_controller.scene);

    // console.log(this.scene_controller.model);

    this.$content.innerHTML = '';

    this.create_node('Generator', gltf?.asset?.generator || 'Unknown');
    this.create_node('Geometries', info.memory.geometries);
    this.create_node('Textures', info.memory.textures);
    this.create_node('Calls', info.render.calls);
    this.create_node('Animations', gltf?.animations?.length || 0);
    this.create_node('Materials', gltf?.parser?.json?.materials?.length || 0);
    this.create_node('Images', gltf?.parser?.json?.images?.length || 0);
    this.create_node('Vertices', vertices || 0);
    this.create_node('Triangles', info.render.triangles);
    this.create_node('Extensions', gltf?.parser?.json?.extensionsUsed?.length > 0 ? (gltf.parser.json.extensionsUsed.join('<br> ')) : 'None');
  }

  get_texture_count()
  {
    return this.scene_controller.model?.original_gltf?.parser?.json?.textures?.length || 0;
  }

  get_animation_count()
  {
    return this.scene_controller.model?.original_gltf?.animations?.length || 0;
  }

  create_node(label, value)
  {
    const $node = document.createElement('div');
    const $label = document.createElement('div');
    const $value = document.createElement('div');

    $node.classList.add('info-node');
    $node.classList.add(`info-node--${label.toLowerCase()}`);
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
}

export { Info };
