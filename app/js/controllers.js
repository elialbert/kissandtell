'use strict';

/* Controllers */

angular.module('3vent.controllers',[]).
    controller('filterCtrl', ["$scope", "angularFire", "fbData", "authService", function($scope, angularFire, fbData, authService) {
	
	// pass the data setup to the login callback
	authService.login( function(userId) {
	    loadData(userId);
	    fbData.getEvents(userId);
	});

	// the click handler to login
	$scope.login = function() {
	    authService.loginSetup();
	}

	var loadData = function(userId) { 
	    var url = "https://creaturefeature.firebaseIO.com/events/"+userId;
	    var promise = angularFire(url, $scope, 'events', {}); 	    
	}

  }])
  .controller('MyCtrl2', [function() {

  }]);