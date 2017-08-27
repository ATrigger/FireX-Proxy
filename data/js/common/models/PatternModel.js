(function () {
    'use strict';

    class PatternModel {

        constructor () {
            this.address = null;
            this.editingState = false;
        }

        toggleState () {
            this.editingState = !this.editingState;
        }

        isEditing () {
            return this.editingState;
        }
    }

    angular
        .module('common')
        .factory('PatternModel', () => new PatternModel());
})();