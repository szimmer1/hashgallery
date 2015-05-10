/**
 * Created by mzimmerman on 4/17/15.
 */

(function(angular, THREE) {

    angular.module('gallery', ['firebase', 's3Service', 'todoError', 'threeService'])

        .controller('GalleryController', function(
            $rootScope,
            $scope,
            $stateParams,
            awsService,
            errorService,
            threejsService,
            $firebaseObject,
            $firebaseArray,
            cWidth,
            cHeight,
            $window
        ) {
                $scope.name = $stateParams.name;

                var artistRef = new Firebase($rootScope.keys.firebaseUrl+$scope.name);

                // load artist data
                var artistData = $firebaseObject(artistRef);
                var imageData = $firebaseArray(artistRef.child('/images'));
                artistData.$loaded().then(function() {
                    artistData.$bindTo($scope, 'artistData');
                });

                $scope.makeGallery = function() {
                    if (!artistData.galleryCreated) {
                        artistData.galleryCreated = (new Date().toString());
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
                        this.flashError('Error','tried to upload before gallery was created');
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
                            var parsedKey = data.key.split(" ").join("+");

                            imageData.$add({
                                key: data.key,
                                type: data.type,
                                url: $rootScope.keys.s3domain + parsedKey,
                                uploaded: data.uploaded
                            }).then(function() {
                                artistData.fileCount++;
                                artistData.$save();
                            });

                            //errorService.setError("Upload success!");
                            $scope.localImage = false;
                        }
                    });
                };

                $scope.truncImage = function() {
                    imageData.$remove(this.$index).then(function() {
                        artistData.fileCount--;
                        artistData.$save();
                    })
                }

                $scope.generate = function() {
                    threejsService.resetScene();
                    var cameraIdx = threejsService.newCamera(75,cWidth/cHeight,0.1,1000);
                    this.setupRenderer();

                    var material = new THREE.MeshBasicMaterial({color:0xffff00});
                    var geo = new THREE.BoxGeometry(1.0,1.0,1.0);
                    var obj = new THREE.Mesh( geo, material);

                    threejsService.world.scene.add(obj);
                    threejsService.world.cameras[cameraIdx].position.z = 5.0;

                    var render = function() {
                        $window.requestAnimationFrame(render);

                        obj.rotation.x += 0.01;
                        obj.rotation.z += 0.01;

                        threejsService.world.renderer.render(threejsService.world.scene,threejsService.world.cameras[cameraIdx])
                    };

                    render();
                    /*
                    threejsService.addMaterial('flatGreen', 'MeshBasic', {'color':0xffff00});
                    threejsService.addObject('box',threejsService.world.materials.flatGreen, {
                        'width':5,
                        'height':5,
                        'depth':5
                    })
                    */
                }

            })

        .directive('hashgalleryRenderer', function(threejsService, cWidth, cHeight) {
            return {
                restrict: 'AE',
                link: function(scope, ele, attr) {
                    scope.setupRenderer = function() {
                        threejsService.renderer(cWidth, cHeight);
                        threejsService.world.renderer.setSize(cWidth, cHeight);
                        $(ele).find('button').remove();
                        $(ele).append(threejsService.world.renderer.domElement);
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

})(angular, THREE);
