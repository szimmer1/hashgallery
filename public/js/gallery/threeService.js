(function(angular) {

    angular.module('threeService', [])
        .factory('threejsService', function($window, errorService, cWidth, cHeight) {

            if (!$window.World) {
                errorService.setError("Error", "include world.js before angular module files")
            }

            var _world = new $window.World(500, 500);

            var time = 0;
            _world.animate = function () {
                time = time > 1000000000 ? 0 : time + 0.01;
                $window.requestAnimationFrame(_world.animate);

                var delta = _world.clock.getDelta();
                _world.cameras[_world.currentCamera].controls.update(delta);

                _world.renderer.render(_world.scene, _world.cameras[_world.currentCamera])
            }

            return {
                world : _world,
                animate : _world.animate.bind(_world),
                addPicture : _world.addPicture.bind(_world),
                generateKeyHandler : function(callback) {
                    $window.addEventListener("keypress", function(event) {
                        _world.handleKeyPress(event, callback);
                    })
                }
            };
        })

})(angular);
