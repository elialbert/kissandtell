'use strict';

/* Controllers */

angular.module('3vent.controllers',[]).
    controller('filterCtrl', ["$scope", "angularFire", "fbData", "authService", function($scope, angularFire, fbData, authService) {
	
	$scope.pagedEvents = [];
	$scope.currentPage = 1;
	$scope.numPerPage = 10;
	$scope.maxSize = 5;
	$scope.minInvited = 10;
	$scope.maxInvited = 200;
	$scope.minAttending = 20;
	$scope.maxAttending = 200;
	$scope.dtStarts = new Date();
	$scope.username = null;
	$scope.whenRadio = "Present";

	var dt = new Date();
	$scope.dtEnds = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + 7);

	// pass the data setup to the login callback
	authService.login( function(user) {
	    var userId = user.id;
	    $scope.username = user.username;
	    console.log("scope username is " + $scope.username + " and pullingFB is " + $scope.pullingFB);
	    loadData(userId);
	    fbData.getEvents(userId, false);
	    $scope.userId = userId;
	    $scope.$$phase || $scope.$apply(); // why?
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

	$scope.$watch( function () { return $scope.maxAttending; }, function (data) {
	    if ($scope.maxAttending == 400) { 
		$scope.maxAttending = null;
	    }
	}, true);
	$scope.$watch( function () { return $scope.maxInvited; }, function (data) {
	    if ($scope.maxInvited == 400) { 
		$scope.maxInvited = null;
	    }
	}, true);

	var loadData = function(userId) { 
	    var url = "https://creaturefeature.firebaseIO.com/events/"+userId;
	    var promise = angularFire(url, $scope, 'eventsRaw', {});
	    // change events to an array bc thats how angular likes it
 	    promise.then(function() {
		console.log("loaded from angularfire");
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
		    e.full_location = e.location + " " + e.venueString;
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

	var dateSort = function(event) {
	    return Date.parse(event.start_time);
	};
	var invitedSort = function(event) {
	    return event.all_members_count;
	};
	var attendingSort = function(event) {
	    return event.attending_count;
	};
	    
	$scope.sortChoice = "date";

	$scope.sortFunc = function(event) {
	    if ($scope.sortChoice == "date") {
		return dateSort(event);
	    }
	    if ($scope.sortChoice == "invited") {
		return invitedSort(event);
	    }
	    if ($scope.sortChoice == "attending") {
		return attendingSort(event);
	    }
	    return dateSort(event);	    
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
	    if (!event.start_time) {
		return true; //maybe skip these?
	    }
	    var start = Date.parse(event.start_time);

	    if ($scope.whenRadio == "Past") {
		if ((start < $scope.dtStarts) || (start > $scope.dtEnds)) {
		    return true
		}
		return false
	    }

	    if ($scope.whenRadio == "Present") {
		if ((start > $scope.dtStarts) && (start < $scope.dtEnds)) {
		    return true;
		}
		return false
	    }

	    if ($scope.whenRadio == "Future") { 
		if (start > $scope.dtEnds) {
		    return true
		}
		return false
	    }
	}

	var locationFilters = function(event) {
	    if (!$scope.locationSearchQuery) {
		return true;
	    }
	    return event.full_location && event.full_location.toLowerCase().indexOf($scope.locationSearchQuery.toLowerCase()) >= 0;
	};

  }])
  .controller('MyCtrl2', [function() {

  }]);