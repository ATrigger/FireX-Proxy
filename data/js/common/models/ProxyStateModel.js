(function () {
    'use strict';

    class ProxyStateModel {

        constructor () {
            this.isFavoriteEnabled = false;
            this.refreshProcess = false;
        }

        startRefreshProcess () {
            this.refreshProcess = true;
        }

        stopRefreshProcess () {
            this.refreshProcess = false;
        }
    }

    angular
        .module('common')
        .factory('ProxyStateModel', () => new ProxyStateModel());
})();