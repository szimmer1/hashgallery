/**
 * Created by mzimmerman on 4/17/15.
 */

(function(angular) {

    angular.module('gallery', ['firebase', 's3Service'])

        .controller('GalleryController', function($scope, $stateParams, awsService, $firebaseObject, firebaseUrl) {

                $scope.name = $stateParams.name;

                var artistRef = new Firebase(firebaseUrl+'/'+$scope.name);

                // load artist data
                var artistData = $firebaseObject(artistRef);
                artistData.$loaded().then(function() {
                    artistData.$bindTo($scope, 'imageData');
                });

                $scope.makeGallery = function() {
                    if (!artistData.galleryCreated) {
                        artistData.galleryCreated = (new Date().toString());
                        artistData.fileCount = 0;
                        artistData.$save();
                    }
                };

                $scope.files = {};
                $scope.bucket = awsService.s3Init(window.s3id, window.s3secret, window.region, window.bucket);

                // takes files object, every time a file is uploaded, callback is called
                $scope.upload = function() {
                    if (!artistData.galleryCreated) {
                        alert('tried to upload before gallery was created');
                        return;
                    }
                    else if (_.isEmpty($scope.files)) {
                        alert('no file(s) selected');
                        return;
                    }
                    awsService.s3Upload($scope.files, function(data, err) {
                        if (err) {
                            alert("s3Upload: "+err)
                        }
                        else {
                            debugger;
                            artistData[artistData.fileCount] = {
                                key: data.key,
                                uploaded: data.uploaded
                            };
                        }
                        artistData.fileCount++;
                    });
                    artistData.$save();
                };
                $scope.uploadProgress = awsService.uploadProgress;

            })

        .directive('galleryUpload', function() {
            return {
                restrict: 'AE',
                scope: true,
                link: function(scope, element, attr) {
                    element.bind('change', function(event) {
                        scope.files = event.target.files;
                        scope.$parent.files = event.target.files;
                        scope.$apply();
                    })
                }
            }
        })

})(angular);
