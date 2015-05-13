/**
 * Created by mzimmerman on 4/17/15.
 */

(function(angular) {

    angular.module('home', [])

        .controller('HomeController', ['$scope', '$stateParams', '$location', function($scope, $stateParams, $location) {

            $scope.name = "";
            $scope.goGallery = function() {
                $location.url('/artist/'+$scope.name.split(' ').join('%20'))
            }

        }])

})(angular);
