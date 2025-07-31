class TextureItem
{
  constructor(texture, parent)
  {
    this.parent = parent;
    this.name = texture.name;
    this.uuid = texture.uuid;
    this.image = texture.image;
    this.instance = texture.instance;
    this.used_in = texture.used_in;
    this.expanded = false;

    this.mesh_elements = [];
    this.material_elements = [];
    this.type_elements = [];

    this.row = document.createElement('tr');

    this.columns = {
      toggle: document.createElement('td'),
      label: document.createElement('td'),
      mesh_names: document.createElement('td'),
      materials: document.createElement('td'),
      types: document.createElement('td'),
      resolution: document.createElement('td'),
      download: document.createElement('td')
    };

    this.DOWNLOAD_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download-icon lucide-download"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>';
    this.OPEN_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right-icon lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>';
    this.CLOSE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down-icon lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>';

    this.init();
  }

  init()
  {
    this.columns.label.textContent = this.name;
    this.columns.label.title = this.name;

    this.columns.resolution.classList.add('textures-table__resolution');
    this.columns.resolution.textContent = `${this.image.width}x${this.image.height}`;

    this.columns.download.innerHTML = this.DOWNLOAD_ICON;
    this.columns.download.classList.add('textures__icon');

    for (let i = 0; i < this.used_in.length; i++)
    {
      const material = this.used_in[i];
      const material_elem = document.createElement('div');
      const type_elem = document.createElement('div');
      const mesh_elem = document.createElement('div');

      mesh_elem.classList.add('textures-table__mesh-name');
      mesh_elem.textContent = material.mesh_name || 'Unknown Mesh';
      mesh_elem.title = material.mesh_name || 'Unknown Mesh';
      mesh_elem.addEventListener('click', () => this.parent.handle_mesh_name_click(material.mesh_name, this.row));

      material_elem.classList.add('textures-table__material-name');
      material_elem.textContent = material.material_name || 'Unknown Material';
      material_elem.title = material.material_name || 'Unknown Material';

      type_elem.classList.add('textures-table__type-name');
      type_elem.textContent = material.channel || 'Unknown';
      type_elem.title = material.channel || 'Unknown';

      this.mesh_elements.push(mesh_elem);
      this.material_elements.push(material_elem);
      this.type_elements.push(type_elem);
    }

    if (this.mesh_elements.length > 1 || this.type_elements.length > 1 || this.material_elements.length > 1)
    {
      this.columns.toggle.innerHTML = this.OPEN_ICON;
      this.columns.toggle.classList.add('textures__icon');
      this.columns.toggle.addEventListener('click', this.handle_expand_button_click.bind(this));
    }
    else
    {
      this.columns.toggle.innerHTML = '';
    }
    this.columns.toggle.title = 'Expand';

    this.columns.download.innerHTML = this.DOWNLOAD_ICON;
    this.columns.download.classList.add('textures__icon');
    this.columns.download.addEventListener('click', this.parent.download_image.bind(this, this.instance, this.name));

    this.set_collapsed_content();
  }

  set_collapsed_content()
  {
    this.columns.mesh_names.textContent = '';
    this.columns.types.textContent = '';
    this.columns.materials.textContent = '';

    if (this.mesh_elements.length > 1)
    {
      this.columns.mesh_names.textContent = `[${this.mesh_elements.length} meshes]`;
    }
    else
    {
      this.columns.mesh_names.appendChild(this.mesh_elements[0]);
    }

    if (this.type_elements.length > 1 && !this.all_channels_same())
    {
      const set = new Set(this.type_elements.map(el => el.textContent));
      this.columns.types.textContent = `[${set.size} types]`;
    }
    else
    {
      this.columns.types.appendChild(this.type_elements[0]);
    }

    if (this.material_elements.length > 1 && !this.all_material_names_same())
    {
      const set = new Set(this.material_elements.map(el => el.textContent));
      this.columns.materials.textContent = `[${set.size} materials]`;
    }
    else
    {
      this.columns.materials.appendChild(this.material_elements[0]);
    }
  }

  all_channels_same()
  {
    return this.used_in.every(material => material.channel === this.used_in[0].channel);
  }

  all_material_names_same()
  {
    return this.used_in.every(material => material.material_name === this.used_in[0].material_name);
  }

  get_row()
  {
    this.row.appendChild(this.columns.toggle);
    this.row.appendChild(this.columns.label);
    this.row.appendChild(this.columns.mesh_names);
    this.row.appendChild(this.columns.materials);
    this.row.appendChild(this.columns.types);
    this.row.appendChild(this.columns.resolution);
    this.row.appendChild(this.columns.download);

    return this.row;
  }

  handle_expand_button_click(evt)
  {
    evt.preventDefault();
    evt.stopPropagation();

    this.expanded = !this.expanded;
    if (this.expanded)
    {
      this.columns.toggle.title = 'Collapse';
      this.columns.toggle.innerHTML = this.CLOSE_ICON;

      this.columns.mesh_names.innerHTML = this.mesh_elements.map(el => el.outerHTML).join('');
      this.columns.materials.innerHTML = this.material_elements.map(el => el.outerHTML).join('');
      this.columns.types.innerHTML = this.type_elements.map(el => el.outerHTML).join('');
    }
    else
    {
      this.columns.toggle.title = 'Expand';
      this.columns.toggle.innerHTML = this.OPEN_ICON;
      this.set_collapsed_content();
    }
  }
}

export { TextureItem };
