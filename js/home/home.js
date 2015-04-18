/**
 * Created by mzimmerman on 4/17/15.
 */

(function(angular) {

    angular.module('home', [])

        .controller('HomeController', ['$scope', '$stateParams', function($scope, $stateParams) {

            $scope.test = "This is the HomeController from the home module"

        }])

})(angular);
