(function () {
    'use strict';

    angular
        .module('data', [])
        .run(setPort);

    function setPort(proxyRepository) {
        addon.port.on('onList', proxyRepository.update);
    }
})();