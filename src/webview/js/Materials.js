import { MaterialDetails } from './MaterialDetails';
import { MaterialItem } from './MaterialItem';
import { ResizableWindow } from './ResizeableWindow';

class Materials extends ResizableWindow
{
  constructor(panel, name)
  {
    const container = document.querySelector('.materials');
    const drag_handle = container.querySelector('.materials-header');
    const content_container = container.querySelector('.materials-content');

    super(container, drag_handle, content_container);

    this.name = name;
    this.panel = panel;
    this.$header = drag_handle;

    this.$header_title = container.querySelector('.materials-header__title');

    this.$close_button = container.querySelector('.materials-header__close');
    this.$close_button.addEventListener('click', this.handle_close_button_click.bind(this));

    this.material_items = [];

    this.material_details = new MaterialDetails();
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
  }

  update_contents(object3d)
  {
    this.extract_material_list(object3d);
    this.build_materials_list();

    this.$header_title.textContent = `Materials (${this.get_material_count()})`;
  }

  extract_material_list(object3d)
  {
    const material_to_meshes = new Map();

    object3d.traverse((child) =>
    {
      if (child.material)
      {
        if (Array.isArray(child.material))
        {
          for (const material of child.material)
          {
            if (material)
            {
              if (!material_to_meshes.has(material))
              {
                material_to_meshes.set(material, []);
              }
              material_to_meshes.get(material).push(child);
            }
          }
        }
        else if (child.material)
        {
          if (!material_to_meshes.has(child.material))
          {
            material_to_meshes.set(child.material, []);
          }
          material_to_meshes.get(child.material).push(child);
        }
      }
    });

    this.material_items = Array.from(material_to_meshes.entries()).map(([material, meshes]) =>
      new MaterialItem(material, meshes, this)
    );
  }

  build_materials_list()
  {
    this.$content_container.innerHTML = '';

    if (this.material_items.length < 1)
    {
      this.$content_container.innerHTML = '<div class="materials-empty">No materials found</div>';
      return;
    }

    for (let i = 0; i < this.material_items.length; i++)
    {
      const $material_element = this.material_items[i].get_element();

      this.$content_container.appendChild($material_element);
    }
  }

  get_material_count()
  {
    return this.material_items?.length || 0;
  }
}

export { Materials };
