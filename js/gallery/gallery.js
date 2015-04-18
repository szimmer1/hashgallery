/**
 * Created by mzimmerman on 4/17/15.
 */

(function(angular) {

    angular.module('gallery', [])

        .factory('awsService', function() {

            if (!AWS) {
                alert("AWS SDK not found!");
                return
            }

            function h(direction, input) {
                if (direction === 'in') {
                    var hash = "";
                    _(input.length).times(function(i) {
                        var n = input.charCodeAt(i);
                        hash = hash.concat(n);
                    });
                    return hash;
                }
                else if (direction === 'out') {
                    var key = "";
                    _(input.length).times(function(i) {
                        var n = input.charCodeAt(i);
                        key = key.concat(n);
                    });
                    return key;
                }
            }

            return {
                s3Init: function(id, secret) {
                    AWS.config.update({
                        accessKeyId: id,
                        secretAccessKey: secret
                    });
                },

                s3Upload: function(id, secret, files) {
                },

                getImageUrl: function(files) {
                }
            }
        })

        .controller('GalleryController', ['$scope', '$stateParams', 'awsService',
            function($scope, $stateParams, awsService) {

                awsService.s3Init(window.s3id, window.s3secret);

                $scope.name = $stateParams.name;
                $scope.test = "This is the GalleryController from the gallery module";

                $scope.upload = awsService.s3Upload;

            }])

})(angular);
