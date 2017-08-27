(function () {
    'use strict';

    class proxyRepository {

        consturctor() {
            this.proxyList = null;
        }

        update(proxyList) {
            this.proxyList = this.proxyList || [];
            //TODO: UPDATE;
        }

        get() {
            return this.proxyList;
        }
    }

    angular
        .module('data')
        .service('proxyRepository', proxyRepository);

})();