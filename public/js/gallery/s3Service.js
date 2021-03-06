(function(angular) {

    angular.module('s3Service', ['todoError'])

        .factory('awsService', function(errorService) {

            if (!AWS) {
                errorService.setError('Script not found',"AWS SDK not found!");
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

            function isImg(ext) {
                var i = ext.indexOf("/");
                var e = ext.slice(i === -1 ? 0 : i+1, ext.length);
                return e === "png" || e === "jpg" || e === "jpeg" || e === "gif"
            }

            var awsbucket = new AWS.S3();
            var uploadProgress = {
                progress: 0,
                fileCount: 0
            };

            return {
                s3Init: function(id, secret, region, bucket, isDemo) {
                    if (isDemo) return;
                    AWS.config.update({
                        accessKeyId: id,
                        secretAccessKey: secret
                    });
                    AWS.config.region = region;
                    awsbucket = new AWS.S3({
                        params: {
                            Bucket: bucket
                        }
                    });
                    uploadProgress.progress = 0;
                    uploadProgress.fileCount = 1;
                },

                s3Upload: function(files, successCallback) {
                    uploadProgress.progress = 0;
                    uploadProgress.fileCount = 1;
                    _.each(files, function(file, key) {
                        var uniqueName = (new Date()).getTime() + "-" + file.name;
                        if (file.size > 999999) {
                            errorService.setError('Error','files must be under 1mb')
                        }
                        else if (!isImg(file.type)) {
                            errorService.setError('Error','file is not an image')
                        }
                        else {
                            awsbucket.putObject({
                                Key: uniqueName,
                                ContentType: file.type,
                                Body: file,
                                ServerSideEncryption: 'AES256'
                            }, function(err, data) {
                                    successCallback({
                                        key: uniqueName,
                                        type: file.type,
                                        uploaded: (new Date()).toString()
                                    }, err)
                            })
                            uploadProgress.fileCount++;
                        }
                    });
                    uploadProgress.fileCount = 1;
                },

                getImageUrl: function(files) {
                },

                uploadProgress: uploadProgress
            }
        })

})(angular);
