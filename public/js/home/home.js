/**
 * Created by mzimmerman on 4/17/15.
 */

(function(angular) {

    angular.module('home', ['firebase', 'todoError'])

        .controller('HomeController', ['$scope', '$stateParams', '$location', 'errorService', '$firebaseObject', '$firebaseArray', '$rootScope', '$filter',
            function($scope, $stateParams, $location, errorService, $firebaseObject, $firebaseArray, $rootScope, $filter) {

                $scope.imageArray = {};

                var rootRef = new Firebase($rootScope.keys.firebaseUrl);
                var artists = $firebaseObject(rootRef);
                artists.$loaded().then(function(){
                    artists.$bindTo($scope, 'artists')
                })

                $scope.name = "";
                $scope.goGallery = function() {
                    if ($scope.name) {
                        $location.url('/artist/' + $scope.name.split(' ').join('%20'))
                    }
                    else {
                        errorService.setError('Error','Please provide the artist\'s name');
                    }
                }

                $scope.checkImage = function(name) {
                    if (!($scope.imageArray && $scope.imageArray[name])) {
                        $scope.imageArray[name] = _.map(this.artist.images, function(image) {return image});
                    }
                    else {
                        return $scope.imageArray[name][0] && $scope.imageArray[name][0].url
                    }
                }
        }])

})(angular);
