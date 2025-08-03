
class MaterialItem
{
  constructor(material, meshes = [], parent)
  {
    this.material = material;
    this.meshes = meshes;

    this.parent = parent;

    this.$material_element = document.createElement('div');
    this.$material_element.className = 'materials-item';

    const meshCount = this.meshes.length;
    const meshText = meshCount === 1 ? '1 mesh' : `${meshCount} meshes`;

    this.$material_element.innerHTML = `
      <div class="material-name">${this.material.name || `Material ${this.material.uuid}`}</div>
      <div class="material-meshes">${meshText}</div>
    `;

    this.$material_element.addEventListener('click', this.handle_click.bind(this));
  }

  get_element()
  {
    return this.$material_element;
  }

  get_material_details()
  {
    return {
      name: this.material.name || `Material ${this.material.uuid}`,
      type: this.material.type || 'Unknown',
      uuid: this.material.uuid,
      color: this.material.color ? this.material.color.getHexString() : null,
      transparent: this.material.transparent,
      opacity: this.material.opacity,
      wireframe: this.material.wireframe,
      side: this.material.side,
      userData: this.material.userData || {},
      meshes: this.meshes.map(mesh => ({
        name: mesh.name || `Mesh ${mesh.uuid}`,
        uuid: mesh.uuid,
        type: mesh.type
      })),
      properties: {
        hasColor: !!this.material.color,
        hasTexture: !!this.material.map,
        hasNormalMap: !!this.material.normalMap,
        hasRoughnessMap: !!this.material.roughnessMap,
        hasMetalnessMap: !!this.material.metalnessMap,
        hasEmissiveMap: !!this.material.emissiveMap,
        hasAOMap: !!this.material.aoMap
      }
    };
  }

  handle_click()
  {
    document.querySelectorAll('.materials-item').forEach((item) =>
    {
      item.classList.remove('selected');
    });

    const details = this.get_material_details();
    this.parent.material_details.show_material_details(details);

    this.$material_element.classList.add('selected');
  }
}

export { MaterialItem };
