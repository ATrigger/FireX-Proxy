(function () {
    'use strict';

    angular
        .module('common')
        .constant('RouteStates', RouteStates());

    function RouteStates() {
        return {
            LIST: 'list',
            SETTINGS: 'settings'
        };
    }

})();