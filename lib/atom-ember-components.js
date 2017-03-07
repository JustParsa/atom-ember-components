'use babel';

import AtomEmberComponentsView from './atom-ember-components-view';
import { CompositeDisposable } from 'atom';
import Grep from 'simple-grep';

export default {

  atomEmberComponentsView: null,
  emberComponentsFooter: null,
  subscriptions: null,

  activate(state) {
    console.log("Activating atom-ember-components...");

    // instantiate view and create container elements
    this.atomEmberComponentsView = new AtomEmberComponentsView(state.atomEmberComponentsViewState);
    this.emberComponentsFooter = atom.workspace.addFooterPanel({
      item: this.atomEmberComponentsView.getElement(),
    });

    // add event listeners

    // upon opening new tab, display rendering components in footer
    atom.workspace.onDidChangeActivePaneItem(() => {
      if (this.emberComponentsFooter.isVisible()) {
        console.log('Changed Tab...');
        this.displayRenderingComponentsFooter();
      }
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-ember-components:toggle': () => this.toggle()
    }));

    this.displayRenderingComponentsFooter();
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
    console.log("Toggling atom-ember-components...");
    this.emberComponentsFooter.isVisible() ? this.emberComponentsFooter.hide() : this.emberComponentsFooter.show();
  },

  displayRenderingComponentsFooter() {
    this.deleteStaleComponentsFromDom();
    let editor = atom.workspace.getActivePaneItem();
    if (editor.buffer) {
      currentFilePath = editor.buffer.file.path;
    } else {
      return;
    }
    let currentFilePath = editor.buffer.file.path;
    let projectRootPath = atom.project.getPaths()[0];
    projectRootPath = projectRootPath.match(/.*\/app/) ? projectRootPath : `${projectRootPath}/app`;

    // strip out template.hbs extension so we only have component name with path
    // TODO: rename variables to be more descriptive
    let regex = new RegExp(`.*\/components\/(.*)\/(template.hbs|component.js)`);
    regexMatch = currentFilePath.match(regex);
    let currentComponentName;
    if (regexMatch) {
      currentComponentName = regexMatch[1];
      this.getAndDisplayRenderingComps(currentComponentName, projectRootPath);
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
      Grep(`{{#${currentComponentName}`, `${projectRootPath}`, (renderingCompsFilesListblock) => {
        renderingCompsFilesList.add(renderingCompsFilesListblock);//[...new Set([...renderingCompsFilesList ,...renderingCompsFilesListblock])];
        resolve(renderingCompsFilesList);
      });
    });
  },

  getRenderingCompsFilesListInline(currentComponentName, projectRootPath, renderingCompsFilesList) {
    return new Promise((resolve, reject) => {
      Grep(`{{${currentComponentName}`, `${projectRootPath}`, (renderingCompsFilesListInline) => {
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

    // simple grep does not allow for regex matching
    // TODO: stop using simple grep and use regex matching to increase search speed
    promises.push(this.getRenderingCompsFilesListblock(currentComponentName, projectRootPath, renderingCompsFilesListSet));
    promises.push(this.getRenderingCompsFilesListInline(currentComponentName, projectRootPath, renderingCompsFilesListSet));

    let renderingCompsFilesList = [];

    Promise.all(promises).then(() => {
      for (let searchResultsArr of renderingCompsFilesListSet) {
        renderingCompsFilesList = renderingCompsFilesList.concat(searchResultsArr);
      }
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
  }

};
