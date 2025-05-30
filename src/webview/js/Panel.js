import { HierarchyTree } from './HierarchyTree';
import { Textures } from './Textures';

class Panel
{
  constructor()
  {
    this.is_dragging = false;
    this.offset_x = 0;
    this.offset_y = 0;
    this.is_resizing = false;
    this.initial_x = 0;

    this.$container = document.querySelector('.panel');
    this.$headers = document.querySelector('.panel-headers');
    this.$content = document.querySelector('.panel-content');
    this.$splitter = document.querySelector('.splitter');

    this.contents = {
      hierarchy: new HierarchyTree(),
      textures: new Textures()
    };

    this.tabs = {
      hierarchy: this.$headers.querySelector('.panel-header__item[data-name="hierarchy"]'),
      textures: this.$headers.querySelector('.panel-header__item[data-name="textures"]')
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
    this.contents.hierarchy.init(scene_controller, details_panel);
    this.contents.textures.init(scene_controller, details_panel);

    this.set_active_tab('hierarchy');
    this.contents.hierarchy.show();

    for (const tab of Object.values(this.tabs))
    {
      tab.addEventListener('click', (e) => this.handle_tab_click(e));
    }

    // this.$header.addEventListener('mousedown', (e) =>
    // {
    //   this.is_dragging = true;
    //   document.body.style.cursor = 'move';
    //   this.offset_x = e.clientX - this.$container.offsetLeft;
    //   this.offset_y = e.clientY - this.$container.offsetTop;
    // });

    this.$splitter.addEventListener('mousedown', (e) =>
    {
      this.is_resizing = true;
      document.body.style.cursor = 'col-resize';
      this.initial_x = e.clientX;
    });
  }

  handle_mouse_move(e)
  {
    if (this.is_resizing)
    {
      const new_width = e.clientX;
      if (new_width > 200 && new_width < window.innerWidth - 200)
      {
        this.$container.style.width = new_width + 'px';
      }
    }
    if (this.is_dragging)
    {
      const new_x = e.clientX - this.offset_x;
      const new_y = e.clientY - this.offset_y;

      const max_x = window.innerWidth - this.$container.offsetWidth;
      const max_y = window.innerHeight - this.$container.offsetHeight;

      this.$container.style.left = Math.min(Math.max(0, new_x), max_x) + 'px';
      this.$container.style.top = Math.min(Math.max(0, new_y), max_y) + 'px';
    }
  }

  handle_mouse_up()
  {
    this.is_resizing = false;
    this.is_dragging = false;
  }

  handle_tab_click(e)
  {
    console.log('handle_tab_click', e.target);
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
