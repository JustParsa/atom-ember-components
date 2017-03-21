'use babel';

export default class AtomEmberComponentsView {

  constructor(serializedState) {
    // console.log('AtomEmberComponentsView constructed!');
    this.renderAtomEmberComponentsContainers();
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  renderAtomEmberComponentsContainers() {
    this.element = document.createElement('div');
    this.element.id = ('atom-ember-components');

    this.componentListContainer = document.createElement('div');
    this.componentListContainer.id = 'components-list-container';

    this.element.appendChild(this.componentListContainer);
  }

  renderComponentListTitle(noComponentsRendered=false) {
    const componentsListTitle = document.createElement('div');
    componentsListTitle.textContent = noComponentsRendered ? 'This component is not statically rendered from any other components.' : 'Current component rendered from: ';
    componentsListTitle.classList.add('component-info-text');
    this.componentListContainer.appendChild(componentsListTitle);
  }

  getCompButton(compName) {
    let btn = document.createElement('button');
    btn.innerHTML = compName;
    btn.className = "btn not-recently-opened";
    // Only apply custom themes to title and buttons if UI theme is dark
    if (document.getElementsByClassName('theme-atom-dark-ui').length || document.getElementsByClassName('theme-one-dark-ui').length) {
      btn.className += " custom-theme";
      document.getElementsByClassName('component-info-text')[0].className += " custom-theme";
    }
    return btn;
  }

  getComponentListContainer() {
    return this.componentListContainer;
  }

  getElement() {
    return this.element;
  }

}
