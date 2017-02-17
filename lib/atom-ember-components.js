'use babel';

import AtomEmberComponentsView from './atom-ember-components-view';
import { CompositeDisposable } from 'atom';
import Grep from 'simple-grep';

export default {

  atomEmberComponentsView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
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

    Grep('simple-grep', '~/.atom/packages', function ( files_list ) {
      console.log( files_list );
    }); 
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
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
