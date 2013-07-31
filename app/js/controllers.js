'use strict';

/* Controllers */

angular.module('myApp.controllers',[]).
    controller('MyCtrl1', ["$scope", "angularFire", "fbData", "authService", function($scope, angularFire, fbData, authService) {
	
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
	    //var url = "https://creaturefeature.firebaseIO.com/kissandtell/friends/"+userId;
	    //var friendsDB = new Firebase(url);
	    //fbPager(friendsDB, "/me/friends?limit=500&fields=name,id,picture", 0);
	    //var promise = angularFire(url, $scope, 'friends', {});
	    
	    var url = "https://creaturefeature.firebaseIO.com/events/"+userId;
	    var promise = angularFire(url, $scope, 'events', {}); 	    
	}



  }])
  .controller('MyCtrl2', [function() {

  }]);