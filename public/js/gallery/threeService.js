(function(angular, THREE) {

    function construct(method, constructor, context, args) {
        var F = function () {
            return method === 'apply' ? constructor.apply(context, args) : constructor.call(context, args)
        };

        F.prototype = constructor.prototype;
        return new F();
    }

    angular.module('threeService', [])
        .factory('threejsService', function($window, errorService) {

            if (!THREE) {
                errorService.setError('Script not found', 'three.js not found')
            }

            var _world = {
                'objects': [],
                'materials': {}
            };

            var geometries = {
                'box': {
                    'fn':THREE.BoxGeometry,
                    'p': ['width','height','depth']
                },
                'circle': {
                    'fn':THREE.CircleGeometry,
                    'p': ['radius','segments']
                },
                'plane': {
                    'fn':THREE.PlaneGeometry,
                    'p': ['width','height']
                },
                'sphere': {
                    'fn': THREE.SphereGeometry,
                    'p': ['radius','heightSegments','widthSegments']
                }
            };

            var materials = {
                'MeshBasic': {
                    'fn': THREE.MeshBasicMaterial
                }
            }

            var _render = function(cameraIdx, callback) {
                $window.requestAnimationFrame(_render);
                callback();
                _world.renderer.render( _world.scene, _world.cameras[cameraIdx])
            }

            return {
                world: _world,
                resetScene: function() {
                    _world.scene = new THREE.Scene();
                },

                newCamera: function(fov, aspect, near, far) {
                    if (_world.cameras) {
                        _world.cameras.push(new THREE.PerspectiveCamera(fov,aspect,near,far))
                    }
                    else {
                        _world.cameras = [new THREE.PerspectiveCamera(fov,aspect,near,far)]
                    }
                    return _world.cameras.length - 1
                },

                renderer: function() {
                    _world.renderer = new THREE.WebGLRenderer()
                },

                addMaterial: function(name, base, params) {
                    if (base in materials) {
                        _world.materials[name] = construct('call',materials[base].fn, THREE, params)
                    }
                },

                addObject: function(type, material, params) {
                    if (type in geometries) {
                        if (_.map(params, function(v,k) {return k}) != geometries[type].p) return;
                        var args = _.map(params, function(v) {return v});

                        _world.objects.push(construct('apply', geometries[type].fn, THREE, args));

                        _world.scene.add(new THREE.Mesh( _world.objects[_world.objects.length-1], _world.materials.material ))
                    }
                },

                render : _render
            };
        })

})(angular, THREE);
