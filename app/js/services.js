'use strict';

/* Services */

angular.module('3vent.services', ['firebase']).
    service("fbData", function() {
	console.log("running loaddata service");

	var getEventsLooper = function(idx, eventsDB, refreshDB) {
	    console.log("in getEventsLooper, idx is " + idx);
	    FB.api(
		{
		    method: 'fql.query',
		    //query: 'SELECT uid2 FROM friend WHERE uid1=me()' // for testing
		    query: "SELECT eid, name, description, start_time, location, all_members_count, attending_count, creator, declined_count, end_time, has_profile_pic, host, pic, venue FROM event WHERE eid IN (SELECT eid FROM event_member WHERE uid IN (SELECT uid2 FROM friend WHERE uid1=me() limit 100 offset " + idx*100 + "))"
		},
		function(resp) {
		    console.log("got the events! " + resp.length);
		    if (!resp.length) {
			console.log("all fresh out!");
			refreshDB.update({'latest':new Date()});
			return;
		    }
		    if (idx == 10) {
			console.log("breaking prematurely");
			return;
		    }
		    var data = {};
		    console.log("preparing event data to update");
		    _.each(resp, function(el) {
			// eventsDB.child(el.eid).update(el); //very slow way
			data[el.eid] = el;
		    });
		    console.log("running big update");
		    eventsDB.update(data);
		    console.log("done with big update");
		    return getEventsLooper(idx+1, eventsDB, refreshDB);
		    

		}
	    );
	}

	var getEventsInner = function(userId) {
	    console.log("running getevents inner");
	    var eventsUrl = "https://creaturefeature.firebaseIO.com/events/"+userId;
	    var refreshUrl = "https://creaturefeature.firebaseIO.com/refresh/"+userId;
	    var eventsDB = new Firebase(eventsUrl);
	    var refreshDB = new Firebase(refreshUrl);

	    refreshDB.on('value', function(snapshot) { 
		console.log("got snapshot");
		refreshDB.off('value')
		if (snapshot.val()) {
		    var latestDate = Date.parse(snapshot.val().latest);
		    var now = new Date();
		    console.log ("found latest date " + latestDate); 
		    if ((now - latestDate) < 120*60*1000 ) { 
			console.log ("refreshed in the last hour!");
			return
		    }
		}
		console.log ("on to eventsl ooperS");
		getEventsLooper(0, eventsDB, refreshDB);
	    });





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
