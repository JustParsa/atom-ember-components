'use babel';

import AtomEmberComponentsView from './atom-ember-components-view';
import { CompositeDisposable } from 'atom';
import Grep from 'simple-grep';

export default {

  atomEmberComponentsView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    // add event listeners
    console.log("Activating atom-ember-components");
    this.atomEmberComponentsView = new AtomEmberComponentsView(state.atomEmberComponentsViewState);
    this.modalPanel = atom.workspace.addFooterPanel({
      item: this.atomEmberComponentsView.getElement()
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-ember-components:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.atomEmberComponentsView.destroy();
  },

  serialize() {
    return {
      atomEmberComponentsViewState: this.atomEmberComponentsView.serialize()
    };
  },

  toggle() {
    console.log("Toggling...");
    this.displayRenderingComponentsFooter();
  },

  displayRenderingComponentsFooter() {
    let editor = atom.workspace.getActivePaneItem();
    let currentFilePath = editor.buffer.file.path;
    let projectRootPath = atom.project.getPaths()[0];

    // strip out template.hbs extension so we only have component name with path
    let regex = new RegExp(`${projectRootPath}\/app\/components\/(.*)\/template.hbs`);
    let currentComponentName = currentFilePath.match(regex)[1];

    this.getAndDisplayRenderingComps(currentComponentName, projectRootPath);
  },

  getAndDisplayRenderingComps(currentComponentName, projectRootPath) {
    // issues: will inapprpriately match components whose substrings match this component's name
    Grep(`{{${currentComponentName}`, `${projectRootPath}/app`, (renderingCompsFilesList) => {
      for (var fileIndex = 0; fileIndex < renderingCompsFilesList.length; fileIndex++) {
        let arr = renderingCompsFilesList[fileIndex].file.split('/');
        // fileName is the name of the template that renders the current component
        let fileName = arr[arr.length-3] + '/' + arr[arr.length-2];
        this.appendCompButtonToFooter(renderingCompsFilesList, fileName, fileIndex);
      }
    });
  },

  appendCompButtonToFooter(renderingCompsFilesList, fileName, fileIndex) {
    let btn = document.createElement('button');
    btn.setAttribute('class', 'btn');
    btn.innerHTML = fileName;
    let renderingPath = renderingCompsFilesList[fileIndex].file;
    btn.addEventListener("click", function(){
      atom.workspace.open(renderingPath);
    });
    this.atomEmberComponentsView.getElement().appendChild(btn);
  }

};
