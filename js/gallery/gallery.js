/**
 * Created by mzimmerman on 4/17/15.
 */

(function(angular) {

    angular.module('gallery', ['firebase', 's3Service'])

        .controller('GalleryController', function(
            $scope,
            $stateParams,
            awsService,
            $firebaseObject,
            $firebaseArray,
            firebaseUrl,
            s3Url
        ) {

                $scope.name = $stateParams.name;

                var artistRef = new Firebase(firebaseUrl+'/'+$scope.name);

                // load artist data
                var artistData = $firebaseObject(artistRef);
                artistData.images = $firebaseArray(artistRef.child('/images'));
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
                    else if (artistData.fileCount > 4) {
                        alert('for now, #gallery allows up to 4 artworks');
                        return;
                    }
                    awsService.s3Upload($scope.files, function(data, err) {
                        if (err) {
                            alert("s3Upload: "+err)
                        }
                        else {
                            artistData.images.$add({
                                key: data.key,
                                type: data.type,
                                uploaded: data.uploaded
                            }).then(function() {
                                artistData.fileCount++;
                                artistData.$save();
                            });
                        }
                    });
                };

                $scope.uploadProgress = awsService.uploadProgress;

                $scope.localImage = false;

            })

        .directive('galleryUpload', function() {
            return {
                restrict: 'AE',
                link: function(scope, element, attr) {
                    element.bind('change', function(event) {
                        // update files object
                        scope.files = event.target.files;

                        //update local image
                        scope.localImage = URL.createObjectURL(event.target.files[0]);
                        scope.$apply();
                    })
                }
            }
        })

})(angular);
