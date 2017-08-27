(function () {
    'use strict';

    class PatternStateModel {

        constructor () {
            this.isBlacklistEnabled = false;
        }
    }

    angular
        .module('common')
        .factory('PatternStateModel', () => new PatternStateModel());
})();