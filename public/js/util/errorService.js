(function(angular) {

    angular.module('todoError', [])
        .factory('errorService', function($rootScope) {
        var currentError = {};

        return {
            currentError: currentError,
            setError: function(title, message) {
                currentError = {
                    header: title,
                    message: message
                };
                $rootScope.$emit('hashgalleryerror', currentError);
            }
        }

        })

})(angular);
