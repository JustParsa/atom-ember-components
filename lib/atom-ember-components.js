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

    this.atomEmberComponentsView = new AtomEmberComponentsView(state.atomEmberComponentsViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.atomEmberComponentsView.getElement(),
      visible: false
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
    console.log('AtomEmberComponents was toggled!');
    /*
      Do a regex match for in /components and /template.hbs
      For now return if either fails;
      We only want to do this for component templates for the time being)
    */


    let editor = atom.workspace.getActivePaneItem();
    // if (editor.buffer !== null) {
      // currentFilePath = editor.buffer.file.path;
    // }
    let projectRootPath = atom.project.getPaths()[0];
    let currentFilePath = editor.buffer.file.path;
    let regex = new RegExp(`${projectRootPath}\/app\/components\/(.*)`);
    let componentTemplate = currentFilePath.match(regex)[1];

    // strip out template.hbs extension so we only have component name with path

    debugger;

    // let absComponentPath = `${projectRootPath}/${relativeComponentPath}`;
    //
    // Grep(currentComponentName, absComponentPath, function ( files_list ) {
    //   console.log( files_list );
    // });
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
