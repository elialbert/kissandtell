'use strict';

/* Controllers */

angular.module('3vent.controllers',[]).
    controller('filterCtrl', ["$scope", "angularFire", "fbData", "authService", function($scope, angularFire, fbData, authService) {
	
	$scope.pagedEvents = [];
	$scope.currentPage = 1;
	$scope.numPerPage = 10;
	$scope.maxSize = 5;

	// pass the data setup to the login callback
	authService.login( function(userId) {
	    loadData(userId);
	    // fbData.getEvents(userId);
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

		$scope.numPages = function () {
		    return Math.ceil($scope.events.length / $scope.numPerPage);
		};

	    });    
	}
	
	$scope.filters = function(event) {
	    //console.log("scope info: " + $scope.minInvited + ", " + $scope.maxInvited + ", " + $scope.textSearchQuery);
	    var res1 = numMembers(event)
	    var res2 = textSearch(event);
	    // console.log ("res1 is " + res1 + " and res2 is " + res2);
	    return res1 && res2;

	}

	var numMembers = function(event) {
	    if ($scope.minInvited && event.all_members_count < parseInt($scope.minInvited)) {
		return false;
	    }
	    if ($scope.maxInvited && event.all_members_count > parseInt($scope.maxInvited)) {
		return false;
	    }
	    if ($scope.minAttending && event.attending_count < parseInt($scope.minAttending)) {
		return false;
	    }
	    if ($scope.maxAttending && event.attending_count > parseInt($scope.maxAttending)) {
		return false;
	    }
	    return true;
	}
	var textSearch = function(event) {
	    if (!$scope.textSearchQuery) {
		return true;
	    }
	    return event.name.toLowerCase().indexOf($scope.textSearchQuery.toLowerCase()) >= 0 || event.description.toLowerCase().indexOf($scope.textSearchQuery.toLowerCase()) >= 0;
	};

	var dateFilters = function(event) { 
	    // Date.parse(event.start_date);
	    return true;
	}

  }])
  .controller('MyCtrl2', [function() {

  }]);