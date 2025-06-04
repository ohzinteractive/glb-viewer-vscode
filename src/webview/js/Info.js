
class Info
{
  constructor()
  {
    this.$container = document.querySelector('.info');
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

  fill_info()
  {
    const info = this.scene_controller.renderer.renderer.info;

    this.$container.innerHTML = '';

    this.create_node('Geometries', info.memory.geometries);
    this.create_node('Textures', info.memory.textures);
    this.create_node('Calls', info.render.calls);
    this.create_node('Triangles', info.render.triangles);
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

    this.$container.appendChild($node);
  }
}

export { Info };
