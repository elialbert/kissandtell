'use strict';


// Declare app level module which depends on filters, and services
angular.module('3vent', ['firebase','ui.bootstrap', 'uiSlider', '3vent.filters', '3vent.services', '3vent.controllers']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'filterCtrl'});
    $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
    $routeProvider.otherwise({redirectTo: '/view1'});
  }]);
