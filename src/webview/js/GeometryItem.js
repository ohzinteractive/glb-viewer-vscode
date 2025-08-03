import { VSCodeContext } from './VSCodeContext';

class GeometryItem
{
  constructor(geometry, meshes = [], parent, index)
  {
    this.geometry = geometry;

    this.meshes = meshes;

    this.parent = parent;
    this.index = index;

    this.$row = document.createElement('tr');
    this.$row.className = 'geometries-row';

    this.mesh_elements = [];
    this.attribute_elements = [];

    this.$collapsed_meshes = document.createElement('div');
    this.$collapsed_meshes.classList.add('geometries-row__collapsed-meshes');

    this.$expanded_meshes = document.createElement('div');
    this.$expanded_meshes.classList.add('geometries-row__expanded-meshes');
    this.$expanded_meshes.classList.add('hidden');

    this.$collapsed_attributes = document.createElement('div');
    this.$collapsed_attributes.classList.add('geometries-row__collapsed-attributes');

    this.$expanded_attributes = document.createElement('div');
    this.$expanded_attributes.classList.add('geometries-row__expanded-attributes');
    this.$expanded_attributes.classList.add('hidden');

    this.columns = {
      toggle: document.createElement('td'),
      name: document.createElement('td'),
      meshes: document.createElement('td'),
      attributes: document.createElement('td'),
      copy: document.createElement('td')
    };

    this.columns.toggle.classList.add('geometries__icon');
    this.columns.name.classList.add('geometries__name');
    this.columns.meshes.classList.add('geometries__meshes');
    this.columns.attributes.classList.add('geometries__attributes');
    this.columns.copy.classList.add('geometries__icon');
    this.columns.copy.title = 'Open details JSON in new tab';

    this.columns.meshes.appendChild(this.$collapsed_meshes);
    this.columns.meshes.appendChild(this.$expanded_meshes);

    this.columns.attributes.appendChild(this.$collapsed_attributes);
    this.columns.attributes.appendChild(this.$expanded_attributes);

    this.OPEN_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right-icon lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>';
    this.CLOSE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down-icon lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>';
    this.COPY_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link-icon lucide-external-link"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>';
    this.CHECK_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"/></svg>';

    this.init();

    this.$row.addEventListener('click', this.select_row.bind(this));
  }

  init()
  {
    this.columns.name.textContent = this.geometry.name || `Geometry ${this.index + 1}`;
    this.columns.name.title = this.geometry.name || `Geometry ${this.index + 1}`;

    this.mesh_elements = [];
    for (let i = 0; i < this.meshes.length; i++)
    {
      const mesh = this.meshes[i];
      const mesh_elem = document.createElement('div');
      mesh_elem.classList.add('geometries-row__mesh-name');
      mesh_elem.textContent = mesh.name;
      mesh_elem.title = mesh.name;
      this.mesh_elements.push(mesh_elem);
    }

    this.attribute_elements = [];
    const keys = Object.keys(this.geometry.attributes);
    for (let i = 0; i < keys.length; i++)
    {
      const key = keys[i];
      const attribute_elem = document.createElement('div');
      attribute_elem.classList.add('geometries-row__attribute');
      attribute_elem.textContent = `${key}: ${this.beautify_attribute(this.geometry.attributes[key])}`;
      this.attribute_elements.push(attribute_elem);
    }

    this.set_collapsed_content();
    this.set_expanded_content();

    if (this.meshes.length > 1 || this.attribute_elements.length > 0)
    {
      this.columns.toggle.innerHTML = this.OPEN_ICON;
      this.columns.toggle.title = 'Expand';
      this.columns.toggle.addEventListener('click', this.handle_expand_button_click.bind(this));
    }
    else
    {
      this.columns.toggle.innerHTML = '';
    }

    this.columns.copy.innerHTML = this.COPY_ICON;
    this.columns.copy.addEventListener('click', this.handle_inspect_json_button_click.bind(this));

    this.$row.appendChild(this.columns.toggle);
    this.$row.appendChild(this.columns.name);
    this.$row.appendChild(this.columns.meshes);
    this.$row.appendChild(this.columns.attributes);
    this.$row.appendChild(this.columns.copy);
  }

  set_collapsed_content()
  {
    if (this.mesh_elements.length > 1)
    {
      this.$collapsed_meshes.textContent = `[${this.mesh_elements.length} meshes]`;
    }
    else
    {
      const element = this.mesh_elements[0];
      element.classList.add('geometries__mesh-name');
      const clonedElement = element.cloneNode(true);
      clonedElement.addEventListener('click', (evt) =>
      {
        evt.preventDefault();
        evt.stopPropagation();
        this.parent.handle_mesh_name_click(element.textContent, this.$row);
      });
      this.$collapsed_meshes.appendChild(clonedElement);
    }

    if (this.attribute_elements.length > 0)
    {
      this.$collapsed_attributes.textContent = `[${Object.keys(this.geometry.attributes).join(', ')}]`;
    }
    else
    {
      this.$collapsed_attributes.textContent = '[No attributes]';
    }
  }

  set_expanded_content()
  {
    for (let i = 0; i < this.mesh_elements.length; i++)
    {
      const clonedElement = this.mesh_elements[i].cloneNode(true);
      clonedElement.addEventListener('click', (evt) =>
      {
        evt.preventDefault();
        evt.stopPropagation();
        this.parent.handle_mesh_name_click(this.mesh_elements[i].textContent, this.$row);
      });
      clonedElement.classList.add('geometries__mesh-name');
      this.$expanded_meshes.appendChild(clonedElement);
    }

    for (let i = 0; i < this.attribute_elements.length; i++)
    {
      this.$expanded_attributes.appendChild(this.attribute_elements[i]);
    }

    this.$expanded_attributes.addEventListener('click', (evt) =>
    {
      evt.preventDefault();
      evt.stopPropagation();
      navigator.clipboard.writeText(
        this.attribute_elements.map(element => element.textContent).join('\n')
      );
      const prev_content = this.$expanded_attributes.innerHTML;
      this.$expanded_attributes.innerHTML = 'Copied to clipboard';

      setTimeout(() =>
      {
        this.$expanded_attributes.innerHTML = prev_content;
      }, 1000);
    });
  }

  get_row()
  {
    return this.$row;
  }

  get_geometry_details()
  {
    return {
      name: this.geometry.name || `Geometry ${this.geometry.uuid}`,
      type: this.geometry.type || 'Unknown',
      uuid: this.geometry.uuid,
      vertexCount: this.geometry.attributes.position ? this.geometry.attributes.position.count : 0,
      faceCount: this.geometry.index ? this.geometry.index.count / 3 : 0,
      attributes: this.geometry.attributes,
      userData: this.geometry.userData || {},
      meshes: this.meshes.map(mesh => ({
        name: mesh.name || `Mesh ${mesh.uuid}`,
        uuid: mesh.uuid,
        type: mesh.type
      })),
      properties: {
        hasPosition: !!this.geometry.attributes.position,
        hasNormal: !!this.geometry.attributes.normal,
        hasUV: !!this.geometry.attributes.uv,
        hasTangent: !!this.geometry.attributes.tangent,
        hasColor: !!this.geometry.attributes.color,
        hasIndex: !!this.geometry.index
      }
    };
  }

  select_row()
  {
    const selected_row = document.querySelector('.geometries-row.selected');
    selected_row?.classList.remove('selected');

    if (selected_row !== this.$row)
    {
      this.$row.classList.add('selected');
      const details = this.get_geometry_details();
      console.log('Geometry details:', details);
    }
  }

  handle_expand_button_click(evt)
  {
    evt.preventDefault();
    evt.stopPropagation();

    this.expanded = !this.expanded;
    if (this.expanded)
    {
      this.columns.toggle.innerHTML = this.CLOSE_ICON;
      this.columns.toggle.title = 'Collapse';

      this.$collapsed_meshes.classList.add('hidden');
      this.$expanded_meshes.classList.remove('hidden');
      this.$collapsed_attributes.classList.add('hidden');
      this.$expanded_attributes.classList.remove('hidden');
    }
    else
    {
      this.columns.toggle.innerHTML = this.OPEN_ICON;
      this.columns.toggle.title = 'Expand';

      this.$expanded_meshes.classList.add('hidden');
      this.$collapsed_meshes.classList.remove('hidden');
      this.$expanded_attributes.classList.add('hidden');
      this.$collapsed_attributes.classList.remove('hidden');
    }
  }

  beautify_attribute(attribute)
  {
    if (typeof attribute === 'object')
    {
      return JSON.stringify(attribute, null, 2);
    }
    else
    {
      return attribute;
    }
  }

  handle_inspect_json_button_click()
  {
    const details = this.get_geometry_details();
    VSCodeContext.ctx.postMessage({
      command: 'openJson',
      payload: details
    });

    this.columns.copy.innerHTML = this.CHECK_ICON;
    setTimeout(() =>
    {
      this.columns.copy.innerHTML = this.COPY_ICON;
    }, 1000);
  }
}

export { GeometryItem };
