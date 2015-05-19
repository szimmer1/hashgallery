/**
 * Created by mzimmerman on 4/17/15.
 */

(function(angular, window) {

    angular.module('app', ['ui.router', 'home', 'gallery'])

        .value('cWidth', window.innerWidth)
        .value('cHeight', window.innerHeight)
        .config(function($stateProvider, $urlRouterProvider) {

            $stateProvider
                .state('home', {
                    url: '/home',
                    templateUrl: '../views/home.html',
                    controller: 'HomeController'
                })
                .state('gallery', {
                    url: '/artist/:name',
                    templateUrl: '../views/gallery.html',
                    controller: 'GalleryController'
                });

            $urlRouterProvider
                .when('/artist', '/artist')
                .otherwise('/home');

        })

        .run(function($rootScope, $http, $location) {

            $http.get($location.protocol() + "://" + window.location.host+"/api/keys")
            .success( function(data, status) {
                $rootScope.keys = JSON.parse(data);
            }).error( function(data, status) {
                alert("Error on retreiving keys; "+status)
            });

        })

        .directive('sessionFlash', function() {
            return {
                restrict: 'AE',
                replace: 'true',
                templateUrl: 'views/error.html',
                link: function(scope, element, attr) {
                    var e = $(element[0]);
                    var title = e.find('.modal-title');
                    var body = e.find('.modal-body');
                    scope.$on('hashgalleryerror', function(event, opts) {
                        title.html(opts.header);
                        body.html("<p>"+opts.message+"</p>");
                        e.modal('show');
                    })
                }
            }
        })
})(angular,window);
