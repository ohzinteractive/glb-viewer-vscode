import { GeometryItem } from './GeometryItem';
import { ResizableWindow } from './ResizeableWindow';

class Geometries extends ResizableWindow
{
  constructor(panel, name)
  {
    const container = document.querySelector('.geometries');
    const drag_handle = container.querySelector('.geometries-header');
    const resize_content = container.querySelector('.resize-content-wrapper');

    super(container, drag_handle, resize_content);

    this.name = name;
    this.panel = panel;
    this.$header = drag_handle;
    this.$rows_container = container.querySelector('.geometries-content');

    this.$header_title = container.querySelector('.geometries-header__title');

    this.$close_button = container.querySelector('.geometries-header__close');
    this.$close_button.addEventListener('click', this.handle_close_button_click.bind(this));

    this.geometry_items = [];
  }

  init(scene_controller)
  {
    this.scene_controller = scene_controller;
  }

  show()
  {
    this.$container.classList.remove('hidden');
  }

  hide()
  {
    this.$container.classList.add('hidden');
  }

  handle_close_button_click()
  {
    this.hide();
    this.panel.deactivate_button(this.name);
  }

  update_contents(object3d)
  {
    this.extract_geometries_list(object3d);
    this.build_geometries_list();

    this.$header_title.textContent = `Geometries (${this.get_geometries_count()})`;
  }

  extract_geometries_list(object3d)
  {
    const geometry_to_meshes = new Map();

    object3d.traverse((child) =>
    {
      if (child.geometry)
      {
        if (!geometry_to_meshes.has(child.geometry))
        {
          geometry_to_meshes.set(child.geometry, []);
        }
        geometry_to_meshes.get(child.geometry).push(child);
      }
    });
    const geo_array = Array.from(geometry_to_meshes.entries());
    geo_array.sort((a, b) =>
    {
      return b[0].attributes.position.count - a[0].attributes.position.count;
    });
    this.geometry_items = geo_array.map(([geometry, meshes], index) =>
      new GeometryItem(geometry, meshes, this, index)
    );
  }

  build_geometries_list()
  {
    // $content_container is the table body
    this.$rows_container.innerHTML = '';

    if (this.geometry_items.length < 1)
    {
      this.$rows_container.innerHTML = '<div class="geometries-empty">No geometries found</div>';
      return;
    }

    for (let i = 0; i < this.geometry_items.length; i++)
    {
      const $geometry_row = this.geometry_items[i].get_row();

      this.$rows_container.appendChild($geometry_row);
    }
  }

  get_geometries_count()
  {
    return this.geometry_items?.length || 0;
  }

  handle_mesh_name_click(mesh_name, row)
  {
    if (this.panel.handle_mesh_name_click(mesh_name))
    {
      this.handle_close_button_click();
    }
  }
}

export { Geometries };
