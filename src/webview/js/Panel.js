import { Animations } from './Animations';
import { HierarchyTree } from './HierarchyTree';
import { Info } from './Info';
import { ResizableWindow } from './ResizeableWindow';
import { Textures } from './Textures';

class Panel extends ResizableWindow
{
  constructor()
  {
    const $container = document.querySelector('.panel');
    const $headers = document.querySelector('.panel-headers');
    const $content = document.querySelector('.panel-content');

    super($container, $headers, $content);

    this.$container = $container;
    this.$headers = $headers;
    this.$content = $content;

    this.contents = {
      hierarchy: new HierarchyTree(),
      textures: new Textures(),
      info: new Info(),
      animations: new Animations()
    };

    this.tabs = {
      hierarchy: this.$headers.querySelector('.panel-header__item[data-name="hierarchy"]'),
      textures: this.$headers.querySelector('.panel-header__item[data-name="textures"]'),
      info: this.$headers.querySelector('.panel-header__item[data-name="info"]'),
      animations: this.$headers.querySelector('.panel-header__item[data-name="animations"]')
    };
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

    this.set_active_tab('hierarchy');
    this.contents.hierarchy.show();

    for (const tab of Object.values(this.tabs))
    {
      tab.addEventListener('click', (e) => this.handle_tab_click(e));
    }
  }

  on_model_loaded(model)
  {
    if (this.contents.info.get_texture_count() > 0)
    {
      this.tabs.textures.classList.remove('hidden');
    }

    if (this.contents.info.get_animation_count() > 0)
    {
      this.tabs.animations.classList.remove('hidden');
      this.contents.animations.init(this.scene_controller);
    }

    this.update_min_dimensions();
  }

  handle_tab_click(e)
  {
    // console.log('handle_tab_click', e.target);
    const $tab = e.target;
    const tab_name = $tab.dataset.name;

    for (const content of Object.values(this.contents))
    {
      content.hide();
    }

    this.contents[tab_name]?.show();
    this.set_active_tab(tab_name);
  }

  set_active_tab(tab_name)
  {
    for (const tab of Object.values(this.tabs))
    {
      tab.classList.remove('panel-header__item--active');
    }

    this.tabs[tab_name].classList.add('panel-header__item--active');
  }
}

export { Panel };
