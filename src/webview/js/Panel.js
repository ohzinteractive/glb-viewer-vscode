import { Animations } from './Animations';
import { HierarchyTree } from './HierarchyTree';
import { Info } from './Info';
import { Materials } from './Materials';
import { Textures } from './Textures';

class Panel
{
  constructor(ui_controller)
  {
    this.$container = document.querySelector('.panel');
    this.$buttons_container = document.querySelector('.panel-buttons');
    this.$content = document.querySelector('.panel-content');

    this.ui_controller = ui_controller;

    this.contents = {
      hierarchy: new HierarchyTree(this, 'hierarchy'),
      textures: new Textures(this, 'textures'),
      materials: new Materials(this, 'materials'),
      info: new Info(this, 'info'),
      animations: new Animations(this, 'animations')
    };

    this.buttons = {
      hierarchy: this.$buttons_container.querySelector('.panel-button[data-name="hierarchy"]'),
      textures: this.$buttons_container.querySelector('.panel-button[data-name="textures"]'),
      materials: this.$buttons_container.querySelector('.panel-button[data-name="materials"]'),
      info: this.$buttons_container.querySelector('.panel-button[data-name="info"]'),
      animations: this.$buttons_container.querySelector('.panel-button[data-name="animations"]')
    };

    for (const button of Object.values(this.buttons))
    {
      button.addEventListener('click', this.handle_button_click.bind(this, button));
    }
  }

  update_contents(object3d)
  {
    this.contents.hierarchy.build_hierarchy_tree(object3d);
    this.contents.textures.update_contents(object3d);
    this.contents.materials.update_contents(object3d);
  }

  handle_object_click(object3d)
  {
    this.ui_controller.handle_object_click(object3d);
  }

  handle_mesh_name_click(mesh_name)
  {
    const object3d = this.contents.hierarchy.find_object3d_by_name(mesh_name);
    if (object3d)
    {
      this.ui_controller.handle_object_click(object3d);
      return true;
    }
  }

  init(scene_controller, details_panel)
  {
    this.scene_controller = scene_controller;
    scene_controller.subscribe(this);

    this.contents.info.init(scene_controller);

    this.contents.textures.init(scene_controller);

    this.contents.hierarchy.init(scene_controller, details_panel);

    this.open_panel();
  }

  on_model_loaded(model)
  {
    if (this.contents.info.get_texture_count() > 0)
    {
      this.buttons.textures.classList.remove('hidden');
    }

    if (this.contents.materials.get_material_count() > 0)
    {
      this.buttons.materials.classList.remove('hidden');
    }

    if (this.contents.info.get_animation_count() > 0)
    {
      this.buttons.animations.classList.remove('hidden');
      this.contents.animations.init(this.scene_controller);
    }
  }

  handle_button_click(button)
  {
    const button_name = button.dataset.name;
    const content = this.contents[button_name];

    if (button.classList.contains('panel-button--active'))
    {
      if (content.is_focused())
      {
        content.shake();
      }
      content.bring_forward();
    }
    else
    {
      if (!content.has_changed)
      {
        const position = this.calculate_initial_position();
        content.$container.style.top = `${position.top}px`;
        content.$container.style.left = `${position.left}px`;
      }

      content.show();
      content.bring_forward();
      this.set_active_button(button_name);
    }
  }

  set_active_button(button_name)
  {
    this.close_panel();

    this.buttons[button_name].classList.add('panel-button--active');
  }

  deactivate_button(button_name)
  {
    this.buttons[button_name].classList.remove('panel-button--active');

    if (this.$buttons_container.querySelector('.panel-button--active') === null)
    {
      this.open_panel();
    }
  }

  open_panel()
  {
    this.$buttons_container.classList.add('panel-buttons--open');
  }

  close_panel()
  {
    this.$buttons_container.classList.remove('panel-buttons--open');
  }

  calculate_initial_position()
  {
    const positions = [];
    const startTop = 10;
    const startLeft = 60;
    const step = 25;

    for (const [name, content] of Object.entries(this.contents))
    {
      if (this.buttons[name].classList.contains('panel-button--active'))
      {
        const rect = content.$container.getBoundingClientRect();
        positions.push({
          top: rect.top,
          left: rect.left
        });
      }
    }

    const find_available_position = (top, left) =>
    {
      for (const pos of positions)
      {
        if (Math.abs(pos.top - top) < step && Math.abs(pos.left - left) < step)
        {
          return find_available_position(top + step, left + step);
        }
      }
      return { top, left };
    };

    return find_available_position(startTop, startLeft);
  }
}

export { Panel };
