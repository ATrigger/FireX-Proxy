(function () {
    'use strict';

    class ProxyServerModel {

        constructor () {
            this.ipAddress = null;
            this.originalProtocol = null;
            this.country = null;
            this.port = null;
            this.activeState = null;
            this.favoriteState = null;
        }

        toggle () {
            this.activeState = !this.activeState;

            return this.activeState;
        }
    }

    angular
        .module('common')
        .factory('ProxyServerModel', () => new ProxyServerModel());
})();