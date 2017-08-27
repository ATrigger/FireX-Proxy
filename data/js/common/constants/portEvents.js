(function () {
    'use strict';

    angular
        .module('common')
        .constant('portEvents', portEvents());

    function portEvents() {
        return {
            FAVORITE_READ: 'favorite.read',
            ON_LIST: 'onList'
        };
    }

})();