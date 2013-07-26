'use strict';

/* Controllers */

angular.module('myApp.controllers',[]).
    controller('MyCtrl1', ["$scope", "angularFire", function($scope, angularFire) {
	var data = new Firebase("https://creaturefeature.firebaseIO.com");
	var auth = new FirebaseSimpleLogin(data, function(error, user) {
	    if (error) {
		// an error occurred while attempting login
		console.log(error);
	    } else if (user) {
		// user authenticated with Firebase
		console.log('User ID: ' + user.id + ', Provider: ' + user.provider);
		loadFriends(user.id);
	    } else {
	      // user is logged out
	      console.log("not logged in");
	    }
	});


	$scope.login = function() {
	    auth.login('facebook', {
		rememberMe: true,
		scope: "email,friends_photos",
	    });
	}

	var fbPager = function(datastore, baseUrl, offset) { 
            var next = true;
	    FB.api(baseUrl + "?limit=500&fields=name,id,picture&offset="+offset, function(resp) { 
		console.log("running with offset " + offset );
		if (resp.data) {
		    _.each(resp.data, function(el) {
			// console.dir(el);
			datastore.push(el);
		    });
		    if (resp.paging) {
			next = resp.paging.next;
		    }
		    else {
			next = false;
		    }
		    offset = offset + 500;
		    if (next) {
			console.log("going to next page");
			fbPager(datastore, baseUrl,offset);
		    }
		} 
	    });
	}

	
	var loadFriends = function(userId) { 
	    var url = "https://creaturefeature.firebaseIO.com/kissandtell/friends/"+userId;
	    var friendsDB = new Firebase(url);
	    fbPager(friendsDB, "/me/friends", 0);
	    var promise = angularFire(url, $scope, 'friends', {});
	}



  }])
  .controller('MyCtrl2', [function() {

  }]);