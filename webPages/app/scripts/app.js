'use strict';

/**
 * @ngdoc overview
 * @name webPagesApp
 * @description
 * # webPagesApp
 *
 * Main module of the application.
 */
angular
  .module('webPagesApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/hello', {
        templateUrl: 'views/hello.html',
        controller: 'HelloCtrl',
        controllerAs: 'hello'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
