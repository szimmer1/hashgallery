/**
 * Created by mzimmerman on 4/17/15.
 */

(function(angular) {

    angular.module('gallery', [])

        .controller('GalleryController', ['$scope', '$stateParams', function($scope, $stateParams) {

            $scope.name = $stateParams.name;
            $scope.test = "This is the GalleryController from the gallery module";

        }])

})(angular);
