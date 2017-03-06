'use babel';

export default class AtomEmberComponentsView {

  constructor(serializedState) {
    console.log('AtomEmberComponentsView constructed!');
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

  renderComponentListTitle() {
    const componentsListTitle = document.createElement('div');
    componentsListTitle.textContent = 'Current component rendered from: ';
    componentsListTitle.classList.add('info-text');
    this.componentListContainer.appendChild(componentsListTitle);
  }

  getCompButton(compName) {
    let btn = document.createElement('button');
    btn.setAttribute('class', 'btn comp-btn not-recently-opened');
    btn.innerHTML = compName;
    return btn;
  }

  getComponentListContainer() {
    return this.componentListContainer;
  }

  getElement() {
    return this.element;
  }

}
