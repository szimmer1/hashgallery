/**
 * Created by mzimmerman on 4/17/15.
 */

(function(angular) {

    angular.module('gallery', ['firebase', 's3Service', 'todoError', 'threeService'])

        .controller('GalleryController', [
            '$rootScope',
            '$scope',
            '$stateParams',
            'awsService',
            'errorService',
            'threejsService',
            '$firebaseObject',
            '$firebaseArray',

            function(
            $rootScope,
            $scope,
            $stateParams,
            awsService,
            errorService,
            threejsService,
            $firebaseObject,
            $firebaseArray
        ) {
                $scope.name = $stateParams.name;

                var artistRef = new Firebase($rootScope.keys.firebaseUrl+$scope.name);

                // load artist data
                var artistData = $firebaseObject(artistRef);
                artistData.galleryCreated = false;
                var imageData = $firebaseArray(artistRef.child('/images'));
                artistData.$loaded().then(function() {
                    artistData.$bindTo($scope, 'artistData');
                });

                $scope.description = "";

                $scope.makeGallery = function() {
                    if (!artistData.galleryCreated && this.description) {
                        if (this.description.length > 200) {
                            errorService.setError("Error", "Description is too long");
                            return;
                        }
                        artistData.galleryCreated = (new Date().toString());
                        artistData.description = this.description;
                        artistData.fileCount = 0;
                        artistData.$save();
                    }
                };

                $scope.files = {};
                $scope.localImage = false;
                $scope.bucket = awsService.s3Init($rootScope.keys.s3id, $rootScope.keys.s3secret,
                    $rootScope.keys.region, $rootScope.keys.bucket);

                // takes files object, every time a file is uploaded, callback is called
                $scope.upload = function() {
                    if (!artistData.galleryCreated) {
                        errorService.setError('Error','tried to upload before gallery was created');
                        return;
                    }
                    else if (_.isEmpty($scope.files)) {
                        errorService.setError('Error','no file(s) selected');
                        return;
                    }
                    else if (artistData.fileCount >= 3) {
                        errorService.setError('Error','for now, #gallery allows up to 3 artworks');
                        return;
                    }
                    awsService.s3Upload($scope.files, function(data, err) {
                        if (err) {
                            errorService.setError('Error', "s3Upload: "+err)
                        }
                        else {
                            console.log("s3Upload: success");
                            var parsedKey = data.key.split(" ").join("+");

                            artistData.fileCount++;
                            artistData.$save();
                            imageData.$add({
                                key: data.key,
                                type: data.type,
                                url: $rootScope.keys.s3domain + parsedKey,
                                uploaded: data.uploaded
                            })

                            //errorService.setError("Upload success!");
                            $scope.localImage = false;
                        }
                    });
                };

                $scope.truncImage = function() {
                    artistData.fileCount--;
                    artistData.$save();
                    imageData.$remove(this.$index)
                };
            }])

        .directive('hashgalleryRenderer', function(threejsService, cWidth, cHeight) {
            return {
                restrict: 'AE',
                link: function(scope, ele, attr) {
                    scope.generate = function() {
                        $(ele).find('button').remove();
                        threejsService.world.setDim(cWidth, cHeight);
                        $(ele).append(threejsService.world.getDomElement());
                        threejsService.animate()
                    }
                }
            }
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

        .directive('buildsTexture', function(threejsService, errorService) {
            return {
                restrict : 'EA',
                link : function(scope, element, attr) {
                    element.bind('load', function(event) {
                        var img = event.target;
                        threejsService.addPicture('picture_'+scope.$index, img.src, {
                            width: img.width,
                            height: img.height
                        }, null, null, function() {errorService.setError("Error", "Could not generate texture "+scope.$index)})
                    })
                }
            }
        })

})(angular);
