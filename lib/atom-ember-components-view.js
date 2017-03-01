'use babel';


export default class AtomEmberComponentsView {

  constructor(serializedState) {
    console.log('AtomEmberComponentsView constructed!');
    this.element = document.createElement('div');
    this.element.classList.add('atom-ember-components');
    // let parent = this.element;
    const message = document.createElement('div');
    message.textContent = 'Current component rendered from: ';
    message.classList.add('message');
    this.element.appendChild(message);
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}
