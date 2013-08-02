'use strict';

/* Services */

angular.module('3vent.services', ['firebase']).
    service("fbData", function() {

	var data = null;
	console.log("running loaddata service");
	var getEventsInner = function(userId) {
	    var url = "https://creaturefeature.firebaseIO.com/events/"+userId;
	    var eventsDB = new Firebase(url);

	    console.log("running getevents inner");
	    FB.api(
		{
		    method: 'fql.query',
		    //query: 'SELECT uid2 FROM friend WHERE uid1=me()'
		    query: 'SELECT eid, name, description, start_time, location, all_members_count, attending_count, creator, declined_count, end_time, has_profile_pic, host, pic_square, venue FROM event WHERE eid IN (SELECT eid FROM event_member WHERE uid IN (SELECT uid2 FROM friend WHERE uid1=me() limit 200)) limit 50'
		    //query: 'SELECT eid, name  FROM event WHERE eid IN (SELECT eid FROM event_member WHERE uid IN (SELECT uid2 FROM friend WHERE uid1=me())) limit 10'
		},
		function(resp) {
		    console.log("got the events!");
		    console.dir(resp);
		    _.each(resp, function(el) {
			eventsDB.child(el.eid).update(el);
		    });
		    

		}
	    );
	}

	return {
	    getEvents: getEventsInner
	}

    }).
    service("authService", function() {
	var data = new Firebase("https://creaturefeature.firebaseIO.com");
	var user = null;
	var auth = null;
	var login = function(cb) {
	    auth = new FirebaseSimpleLogin(data, function(error, u) {
		if (error) {
		    // an error occurred while attempting login
		    console.log(error);
		} else if (u) {
		    // user authenticated with Firebase
		    console.log('User ID: ' + u.id + ', Provider: ' + u.provider);
		    cb(u.id);
		} else {
		    // user is logged out
		    console.log("not logged in");
		}
	    });
	}
	var loginSetup = function() {
	    auth.login('facebook', {
		rememberMe: true,
		scope: "email,user_events,friends_events",
	    });
	}
	
	return {
	    loginSetup: loginSetup,
	    login: login
	}

    });
	   

//old
	var fbPager = function(datastore, baseUrl, offset) { 
            var next = true;
	    FB.api(baseUrl + "&offset=" +offset, function(resp) { 
		console.log("running with offset " + offset );
		if (resp.data) {
		    _.each(resp.data, function(el) {
			// console.dir(el);
			datastore.child(el.id).update(el);
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
