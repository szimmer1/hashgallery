/**
 * Created by mzimmerman on 4/17/15.
 */

(function(angular) {

    angular.module('app', ['ui.router', 'home', 'gallery'])

        .value('firebaseUrl', window.firebaseUrl)

        .config(function($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('home', {
                    url: '/home',
                    templateUrl: 'views/home.html',
                    controller: 'HomeController as home'
                })
                .state('gallery', {
                    url: '/artist/:name',
                    templateUrl: 'views/gallery.html',
                    controller: 'GalleryController as gallery'
                });

            $urlRouterProvider
                .when('/artist', '/artist')
                .otherwise('/home');

        })

})(angular);
