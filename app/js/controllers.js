'use strict';

/* Controllers */

angular.module('3vent.controllers',[]).
    controller('filterCtrl', ["$scope", "angularFire", "fbData", "authService", function($scope, angularFire, fbData, authService) {
	
	$scope.pagedEvents = [];
	$scope.currentPage = 1;
	$scope.numPerPage = 10;
	$scope.maxSize = 5;

	$scope.dtStarts = new Date();
	var dt = new Date();
	$scope.dtEnds = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + 7);

	// pass the data setup to the login callback
	authService.login( function(user) {
	    var userId = user.id;
	    $scope.username = user.username;
	    loadData(userId);
	    fbData.getEvents(userId, false);
	    $scope.userId = userId;
	});

	$scope.repullFB = function() {
	    fbData.getEvents($scope.userId, true);
	}

	// the click handler to login
	$scope.login = function() {
	    authService.loginSetup();
	}

	$scope.$watch( function () { return fbData.pullingFB; }, function (data) {
	    console.log("in watch: pulling fb is " + data.status);
	    $scope.pullingFB = data.status;
	}, true);

	var loadData = function(userId) { 
	    var url = "https://creaturefeature.firebaseIO.com/events/"+userId;
	    var promise = angularFire(url, $scope, 'eventsRaw', {});
	    // change events to an array bc thats how angular likes it
 	    promise.then(function() {
		$scope.events = [];
		for (var key in $scope.eventsRaw) {
		    // event preprocessing
		    var e = $scope.eventsRaw[key];
		    var d = new Date(e.start_time);
		    e.pretty_start = dateFormat(d, "dddd, mmmm dS, yyyy, h:MM TT Z");

		    e.venueString = '';
		    for (var key in e.venue) { 
			e.venueString = e.venueString + ", " + e.venue[key];
		    }
		    e.pretty_location = e.location || e.venueString;
		    $scope.events.push(e);
		}

		$scope.numPages = function () {
		    return Math.ceil($scope.events.length / $scope.numPerPage);
		};

	    });    
	}
	
	$scope.filters = function(event) {
	    //console.log("scope info: " + $scope.minInvited + ", " + $scope.maxInvited + ", " + $scope.textSearchQuery);
	    var res1 = numMembers(event);
	    var res2 = textSearch(event);
	    var res3 = dateFilters(event);
	    var res4 = locationFilters(event);
	    // console.log ("res1 is " + res1 + " and res2 is " + res2);
	    return res1 && res2 && res3 && res4;

	}

	$scope.sortFunc = function(event) {
	    return Date.parse(event.start_time);
	};

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
	    var start = Date.parse(event.start_time);
	    var end = Date.parse(event.end_time);
	    if ((start < $scope.dtStarts) || (end > $scope.dtEnds)) {
		return false;
	    }
	    return true;
	}

	var locationFilters = function(event) {
	    if (!$scope.locationSearchQuery) {
		return true;
	    }
	    return event.pretty_location && event.pretty_location.toLowerCase().indexOf($scope.locationSearchQuery.toLowerCase()) >= 0;
	};

  }])
  .controller('MyCtrl2', [function() {

  }]);