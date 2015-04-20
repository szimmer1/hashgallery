(function(angular) {

    angular.module('s3Service', [])

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

            var awsbucket = new AWS.S3();
            var uploadProgress = {
                progress: 0,
                fileCount: 0
            };

            return {
                s3Init: function(id, secret, region, bucket) {
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
                        if (file.size < 1000000) {
                            awsbucket.putObject({
                                Key: uniqueName,
                                ContentType: file.type,
                                Body: file,
                                ServerSideEncryption: 'AES256'
                            }, function(err, data) {
                                if (err) {
                                    alert("s3Upload: "+err.message)
                                }
                                else {
                                    console.log('s3Upload: success');
                                    successCallback({
                                        key: uniqueName,
                                        uploaded: (new Date()).toString()
                                    }, err)
                                }
                            }).on('httpUploadProgress', function(progress) {
                                uploadProgress.progress = progress;
                            })
                            uploadProgress.fileCount++;
                        }
                        else {
                            alert('Pictures must be under 1mb')
                        }
                    })
                    uploadProgress.fileCount = 1;
                },

                getImageUrl: function(files) {
                },

                uploadProgress: uploadProgress
            }
        })

})(angular);
