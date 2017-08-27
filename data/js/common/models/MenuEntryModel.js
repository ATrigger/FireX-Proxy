(function () {
    'use strict';

    class MenuEntryModel {

        constructor () {
            this.resource = null;
            this.icon = null;
            this.placeholder = null;
            this.isActive = null;
        }

    }

    angular
        .module('common')
        .factory('MenuEntryModel', () => new MenuEntryModel());
})();