'use babel';

import AtomEmberComponentsView from './atom-ember-components-view';
import { CompositeDisposable } from 'atom';
import Grep from 'simple-grep';

export default {

  atomEmberComponentsView: null,
  emberComponentsFooter: null,
  subscriptions: null,

  activate(state) {
    console.log("Activating atom-ember-components");

    this.atomEmberComponentsView = new AtomEmberComponentsView(state.atomEmberComponentsViewState);
    this.emberComponentsFooter = atom.workspace.addFooterPanel({
      item: this.atomEmberComponentsView.getElement(),
      visible: false
    });

    // add event listeners
    atom.workspace.onDidChangeActivePaneItem(() => {
      if (this.emberComponentsFooter.isVisible()) {
        console.log('new tab opened');
        this.displayRenderingComponentsFooter();
      }
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-ember-components:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.emberComponentsFooter.destroy();
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
    this.emberComponentsFooter.isVisible() ? this.emberComponentsFooter.hide() : this.emberComponentsFooter.show();
  },

  displayRenderingComponentsFooter() {
    this.deleteStaleComponentsFromDom();
    let editor = atom.workspace.getActivePaneItem();
    let currentFilePath = editor.buffer.file.path;
    let projectRootPath = atom.project.getPaths()[0];

    // strip out template.hbs extension so we only have component name with path
    let regex = new RegExp(`${projectRootPath}\/app\/components\/(.*)\/template.hbs`);
    regexMatch = currentFilePath.match(regex);

    let currentComponentName;
    if (regexMatch) {
      currentComponentName = regexMatch[1];
      this.getAndDisplayRenderingComps(currentComponentName, projectRootPath);
    } else {

    }
  },

  deleteStaleComponentsFromDom() {
    var myNode = document.getElementById("components-list-container");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
  },

  getRenderingCompsFilesListblock(currentComponentName, projectRootPath, renderingCompsFilesList) {
    return new Promise((resolve, reject) => {
      Grep(`{{#${currentComponentName}`, `${projectRootPath}/app`, (renderingCompsFilesListblock) => {
        renderingCompsFilesList.add(renderingCompsFilesListblock);//[...new Set([...renderingCompsFilesList ,...renderingCompsFilesListblock])];
        resolve(renderingCompsFilesList);
      });
    });
  },

  getRenderingCompsFilesListInline(currentComponentName, projectRootPath, renderingCompsFilesList) {
    return new Promise((resolve, reject) => {
      Grep(`{{${currentComponentName}`, `${projectRootPath}/app`, (renderingCompsFilesListInline) => {
        renderingCompsFilesList.add(renderingCompsFilesListInline);
        // renderingCompsFilesList = [...new Set([...renderingCompsFilesList ,...renderingCompsFilesListInline])];
        resolve(renderingCompsFilesList);
      });
    });
  },

  // TODO: cleanup is necessary
  getAndDisplayRenderingComps(currentComponentName, projectRootPath) {
    let promises = [];
    // TODO: rethink name of this var
    let renderingCompsFilesListSet = new Set();

    promises.push(this.getRenderingCompsFilesListblock(currentComponentName, projectRootPath, renderingCompsFilesListSet));
    promises.push(this.getRenderingCompsFilesListInline(currentComponentName, projectRootPath, renderingCompsFilesListSet));

    let renderingCompsFilesList = [];

    Promise.all(promises).then(() => {
      for (let searchResultsArr of renderingCompsFilesListSet) {
        renderingCompsFilesList = renderingCompsFilesList.concat(searchResultsArr);
      }
      // renderingCompsFilesList = mergeDedupe(renderingCompsFilesListSet[0], renderingCompsFilesListSet[1]);
      // display title when promise resolves to prevent delay between appearance of title and components
      this.atomEmberComponentsView.renderComponentListTitle();
      for (var fileIndex = 0; fileIndex < renderingCompsFilesList.length; fileIndex++) {
        let arr = renderingCompsFilesList[fileIndex].file.split('/');
        // fileName is the name of the template that renders the current component
        let fileName = arr[arr.length-3] + '/' + arr[arr.length-2];
        this.appendCompButtonToFooter(renderingCompsFilesList, fileName, fileIndex);
      }
    });

  },

  appendCompButtonToFooter(renderingCompsFilesList, fileName, fileIndex) {
    let btn = this.atomEmberComponentsView.getCompButton(fileName);
    let renderingPath = renderingCompsFilesList[fileIndex].file;
    btn.addEventListener("click", function(){
      atom.workspace.open(renderingPath);
    });
    this.atomEmberComponentsView.getComponentListContainer().appendChild(btn);
  },

  // TODO: move into utils
  // Input: [ [1, 2, 3], [101, 2, 1, 10], [2, 1] ]
  // Output: [1, 2, 3, 101, 10]
  mergeDedupe( arr ) {
    return [ ...new Set( [].concat( ...arr ) ) ];
  }

};
