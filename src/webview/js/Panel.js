import { Animations } from './Animations';
import { HierarchyTree } from './HierarchyTree';
import { Info } from './Info';
import { Textures } from './Textures';

class Panel
{
  constructor()
  {
    this.$container = document.querySelector('.panel');
    this.$buttons_container = document.querySelector('.panel-buttons');
    this.$content = document.querySelector('.panel-content');

    this.contents = {
      hierarchy: new HierarchyTree(this, 'hierarchy'),
      textures: new Textures(this, 'textures'),
      info: new Info(this, 'info'),
      animations: new Animations(this, 'animations')
    };

    this.buttons = {
      hierarchy: this.$buttons_container.querySelector('.panel-button[data-name="hierarchy"]'),
      textures: this.$buttons_container.querySelector('.panel-button[data-name="textures"]'),
      info: this.$buttons_container.querySelector('.panel-button[data-name="info"]'),
      animations: this.$buttons_container.querySelector('.panel-button[data-name="animations"]')
    };

    for (const button of Object.values(this.buttons))
    {
      button.addEventListener('click', this.handle_button_click.bind(this, button));
    }
  }

  build_hierarchy_tree(object3d)
  {
    this.contents.hierarchy.build_hierarchy_tree(object3d);
    this.contents.textures.build_textures_list(object3d);
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

    if (this.contents.info.get_animation_count() > 0)
    {
      this.buttons.animations.classList.remove('hidden');
      this.contents.animations.init(this.scene_controller);
    }
  }

  handle_button_click(button)
  {
    const button_name = button.dataset.name;

    // for (const content of Object.values(this.contents))
    // {
    //   content.hide();
    // }

    if (button.classList.contains('panel-button--active'))
    {
      this.contents[button_name].hide();
      this.deactivate_button(button_name);
    }
    else
    {
      this.contents[button_name].show();
      this.contents[button_name].update_min_dimensions();
      this.contents[button_name].bring_forward();
      this.set_active_button(button_name);
    }
  }

  set_active_button(button_name)
  {
    // for (const button of Object.values(this.buttons))
    // {
    //   button.classList.remove('panel-button--active');
    // }

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
}

export { Panel };
