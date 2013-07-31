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
	    var promise = angularFire(url, $scope, 'eventsRaw', {});
	    // change events to an array bc thats how angular likes it
 	    promise.then(function() {
		$scope.events = [];
		for (var key in $scope.eventsRaw) {
		    $scope.events.push($scope.eventsRaw[key]);
		}
	    });    
	}
	
	$scope.filters = {
	    'numMembers': function(event) {
		return event.all_members_count > 1000;
	    }
	};

  }])
  .controller('MyCtrl2', [function() {

  }]);