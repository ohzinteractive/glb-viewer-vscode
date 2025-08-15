
class MaterialItem
{
  constructor(material, meshes = [], parent)
  {
    this.material = material;
    this.meshes = meshes;

    this.parent = parent;

    this.$row = document.createElement('tr');
    this.$row.className = 'materials-row';

    this.columns = {
      toggle: document.createElement('td'),
      name: document.createElement('td'),
      type: document.createElement('td'),
      meshes: document.createElement('td'),
      more: document.createElement('td')
    };

    this.mesh_elements = [];
    this.expanded = false;

    this.$collapsed_meshes = document.createElement('div');
    this.$collapsed_meshes.classList.add('materials-row__collapsed-meshes');

    this.$expanded_meshes = document.createElement('div');
    this.$expanded_meshes.classList.add('materials-row__expanded-meshes');
    this.$expanded_meshes.classList.add('hidden');

    this.columns.toggle.classList.add('materials__icon');
    this.columns.name.classList.add('materials-row__name');
    this.columns.type.classList.add('materials-row__type');
    this.columns.meshes.classList.add('materials-row__meshes');
    this.columns.more.classList.add('materials__icon');
    this.columns.more.title = 'Open details';

    this.columns.meshes.appendChild(this.$collapsed_meshes);
    this.columns.meshes.appendChild(this.$expanded_meshes);

    this.OPEN_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right-icon lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>';
    this.CLOSE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down-icon lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>';
    this.MORE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-receipt-text-icon lucide-receipt-text"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M14 8H8"/><path d="M16 12H8"/><path d="M13 16H8"/></svg>';

    this.init();

    this.$row.addEventListener('click', this.handle_row_select.bind(this));
  }

  init()
  {
    this.columns.name.textContent = this.material.name || `Material ${this.material.uuid}`;
    this.columns.name.title = 'Click for more details';
    this.columns.type.textContent = this.material.type;

    this.columns.name.addEventListener('click', this.handle_more_button_click.bind(this));

    this.set_collapsed_content();
    this.set_expanded_content();

    if (this.meshes.length > 1)
    {
      this.columns.toggle.innerHTML = this.OPEN_ICON;
      this.columns.toggle.title = 'Expand';
      this.columns.toggle.addEventListener('click', this.handle_expand_button_click.bind(this));
    }
    else
    {
      this.columns.toggle.innerHTML = '';
    }

    this.columns.more.innerHTML = this.MORE_ICON;
    this.columns.more.addEventListener('click', this.handle_more_button_click.bind(this));

    this.$row.appendChild(this.columns.toggle);
    this.$row.appendChild(this.columns.name);
    this.$row.appendChild(this.columns.type);
    this.$row.appendChild(this.columns.meshes);
    this.$row.appendChild(this.columns.more);
  }

  set_collapsed_content()
  {
    this.$collapsed_meshes.innerHTML = '';
    if (this.meshes.length > 1)
    {
      this.$collapsed_meshes.textContent = `[${this.meshes.length} meshes]`;
    }
    else
    {
      const mesh = this.meshes[0];
      const mesh_elem = document.createElement('div');
      mesh_elem.classList.add('materials-row__mesh-name');
      mesh_elem.textContent = mesh.name;
      mesh_elem.title = mesh.name;
      mesh_elem.addEventListener('click', this.handle_mesh_click.bind(this, mesh));

      this.$collapsed_meshes.appendChild(mesh_elem);
    }
  }

  set_expanded_content()
  {
    this.$expanded_meshes.innerHTML = '';
    for (let i = 0; i < this.meshes.length; i++)
    {
      const mesh = this.meshes[i];
      const mesh_elem = document.createElement('div');
      mesh_elem.classList.add('materials-row__mesh-name');
      mesh_elem.textContent = mesh.name;
      mesh_elem.title = mesh.name;
      mesh_elem.addEventListener('click', this.handle_mesh_click.bind(this, mesh));
      this.$expanded_meshes.appendChild(mesh_elem);
    }
  }

  get_element()
  {
    return this.$row;
  }

  handle_expand_button_click(evt)
  {
    evt.preventDefault();
    evt.stopPropagation();

    this.expanded = !this.expanded;

    this.$expanded_meshes.classList.toggle('hidden');
    this.$collapsed_meshes.classList.toggle('hidden');

    if (this.expanded)
    {
      this.columns.toggle.innerHTML = this.CLOSE_ICON;
      this.columns.toggle.title = 'Collapse';
    }
    else
    {
      this.columns.toggle.innerHTML = this.OPEN_ICON;
      this.columns.toggle.title = 'Expand';
    }
  }

  handle_more_button_click(evt)
  {
    evt.preventDefault();
    evt.stopPropagation();

    this.parent.material_details.show_material_details(this.material);
  }

  handle_row_select()
  {
    const selected_row = document.querySelector('.materials-row.selected');
    selected_row?.classList.remove('selected');

    if (selected_row !== this.$row)
    {
      this.$row.classList.add('selected');
    }
  }

  handle_mesh_click(mesh)
  {
    this.parent.panel.handle_mesh_name_click(mesh.name);
  }
}

export { MaterialItem };
