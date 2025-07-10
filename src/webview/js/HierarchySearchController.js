class HierarchySearchController
{
  constructor(tree)
  {
    this.tree = tree;

    this.$search_results = document.querySelector('.tree-search-results');
    this.$search_icon = document.querySelector('.tree-search__icon');
    this.$search_clear_icon = document.querySelector('.tree-clear__icon');
    this.$search_input = document.querySelector('.tree-search__input');
    this.$search_input.addEventListener('input', this.handle_search_input.bind(this));
    this.$search_input.addEventListener('focus', this.handle_search_input_focus.bind(this));
    this.$search_input.addEventListener('blur', this.handle_search_input_blur.bind(this));
    this.$search_clear_icon.addEventListener('click', this.clear_search_input.bind(this));
  }

  handle_search_input(e)
  {
    const user_input = e.target.value;
    const regex = new RegExp(user_input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const matches = this.tree.first_node.find_nodes_by_name_regex(regex);

    // const to_log = matches.map(node => node.object3d.name);
    // console.log(to_log);

    this.$search_results.innerHTML = '';
    for (let i = 0; i < matches.length; i++)
    {
      const node = matches[i];
      const $node = node.$label_wrapper.cloneNode(true);
      $node.classList.add('tree-search-results__item');
      $node.addEventListener('click', (e) =>
      {
        node.handle_label_click(e);
        this.clear_search_input();
      });
      this.$search_results.appendChild($node);
    }
  }

  handle_search_input_focus()
  {
    this.tree.$content_container.classList.add('hidden');
    this.$search_results.classList.remove('hidden');
    this.$search_icon.classList.add('tree-search__icon--focused');
    this.$search_clear_icon.classList.remove('hidden');
  }

  clear_search_input()
  {
    this.tree.$content_container.classList.remove('hidden');
    this.$search_results.classList.add('hidden');
    this.$search_input.value = '';
    this.$search_results.innerHTML = '';
    this.$search_icon.classList.remove('tree-search__icon--focused');
    this.$search_clear_icon.classList.add('hidden');
  }

  handle_search_input_blur()
  {
    if (this.$search_input.value === '')
    {
      this.clear_search_input();
    }
  }
}

export { HierarchySearchController };
