class TextureItem
{
  constructor(texture, parent, key)
  {
    this.parent = parent;
    this.name = texture.name;
    this.uuid = texture.uuid;
    this.image = texture.image;
    this.instance = texture.instance;
    this.used_in = texture.used_in;
    this.expanded = false;

    this.bitmap = null;

    this.key = key;

    this.mesh_elements = [];
    this.material_elements = [];
    this.type_elements = [];

    this.row = document.createElement('tr');
    this.row.addEventListener('click', () => this.parent.on_row_click(this));

    this.columns = {
      toggle: document.createElement('td'),
      label: document.createElement('td'),
      mesh_names: document.createElement('td'),
      materials: document.createElement('td'),
      types: document.createElement('td'),
      resolution: document.createElement('td'),
      download: document.createElement('td')
    };

    this.collapsed_meshes = document.createElement('div');
    this.collapsed_materials = document.createElement('div');
    this.collapsed_types = document.createElement('div');

    this.expanded_meshes = document.createElement('div');
    this.expanded_meshes.classList.add('hidden');
    this.expanded_materials = document.createElement('div');
    this.expanded_materials.classList.add('hidden');
    this.expanded_types = document.createElement('div');
    this.expanded_types.classList.add('hidden');

    this.columns.mesh_names.appendChild(this.collapsed_meshes);
    this.columns.materials.appendChild(this.collapsed_materials);
    this.columns.types.appendChild(this.collapsed_types);
    this.columns.mesh_names.appendChild(this.expanded_meshes);
    this.columns.materials.appendChild(this.expanded_materials);
    this.columns.types.appendChild(this.expanded_types);

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
      mesh_elem.addEventListener('click', (evt) =>
      {
        evt.preventDefault();
        evt.stopPropagation();

        this.parent.handle_mesh_name_click(material.mesh_name, this.row);
      });

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
    this.columns.download.addEventListener('click', (evt) =>
    {
      evt.preventDefault();
      evt.stopPropagation();
      this.parent.download_image(this);
    });

    this.set_collapsed_content();
    this.set_expanded_content();
  }

  set_bitmap(bitmap)
  {
    this.bitmap = bitmap;
  }

  set_collapsed_content()
  {
    if (this.mesh_elements.length > 1)
    {
      this.collapsed_meshes.textContent = `[${this.mesh_elements.length} meshes]`;
    }
    else
    {
      this.collapsed_meshes.appendChild(this.mesh_elements[0]);
    }

    if (this.type_elements.length > 1 && !this.all_channels_same())
    {
      const set = new Set(this.type_elements.map(el => el.textContent));
      this.collapsed_types.textContent = `[${set.size} types]`;
    }
    else
    {
      this.collapsed_types.appendChild(this.type_elements[0]);
    }

    if (this.material_elements.length > 1 && !this.all_material_names_same())
    {
      const set = new Set(this.material_elements.map(el => el.textContent));
      this.collapsed_materials.textContent = `[${set.size} materials]`;
    }
    else
    {
      this.collapsed_materials.appendChild(this.material_elements[0]);
    }
  }

  set_expanded_content()
  {
    for (let i = 0; i < this.mesh_elements.length; i++)
    {
      const el = this.mesh_elements[i];
      const clonedEl = el.cloneNode(true);
      clonedEl.addEventListener('click', (evt) =>
      {
        evt.preventDefault();
        evt.stopPropagation();
        this.parent.handle_mesh_name_click(el.textContent, this.row);
      });
      this.expanded_meshes.appendChild(clonedEl);
    }

    this.expanded_materials.innerHTML = this.material_elements.map(el => el.outerHTML).join('');
    this.expanded_types.innerHTML = this.type_elements.map(el => el.outerHTML).join('');
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

      this.expanded_meshes.classList.remove('hidden');
      this.expanded_materials.classList.remove('hidden');
      this.expanded_types.classList.remove('hidden');

      this.collapsed_materials.classList.add('hidden');
      this.collapsed_types.classList.add('hidden');
      this.collapsed_meshes.classList.add('hidden');
    }
    else
    {
      this.columns.toggle.title = 'Expand';
      this.columns.toggle.innerHTML = this.OPEN_ICON;

      this.expanded_materials.classList.add('hidden');
      this.expanded_types.classList.add('hidden');
      this.expanded_meshes.classList.add('hidden');

      this.collapsed_materials.classList.remove('hidden');
      this.collapsed_types.classList.remove('hidden');
      this.collapsed_meshes.classList.remove('hidden');
    }
  }
}

export { TextureItem };
