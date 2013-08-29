'use strict';

/* Services */

angular.module('3vent.services', ['firebase']).
    service("fbData", function() {
	var dt = new Date();
	var early = Math.round(new Date().setDate(new Date().getDate() - 1) / 1000);
	var late = Math.round(new Date().setDate(new Date().getDate() + 21) / 1000);
	var step = 100;
	var pullingFB = {status:1};
	var getEventsLooper = function(idx, user, eventsDB, refreshDB, tries) {
	    var data = {};
	    if (idx == 0) {
		FB.api(
		    {
			method: 'fql.query',
			query: "SELECT eid, name, description, start_time, location, all_members_count, attending_count, creator, declined_count, end_time, has_profile_pic, host, pic, venue FROM event WHERE start_time >= " + early + " AND start_time <= " + late + " AND eid IN (SELECT eid FROM event_member WHERE uid=me())",
			access_token: user.accessToken
		    },
		    function(resp) {
			var extra_data = {};
			if (resp.error || resp.error_code) {
			    console.log("pulling self events error is: " + error);
			    console.dir(resp)
			}
			else {
			    _.each(resp, function(el) {
				el.selfEvent = true;
				data[el.eid] = el;
			    });			
			}
		    }


		)}
	    else {
		data = {};
	    }


	    FB.api(
		{
		    method: 'fql.query',
		    
		    //query: 'SELECT uid2 FROM friend WHERE uid1=me()' // for testing
		    query: "SELECT eid, name, description, start_time, location, all_members_count, attending_count, creator, declined_count, end_time, has_profile_pic, host, pic, venue FROM event WHERE start_time >= " + early + " AND start_time <= " + late + " AND eid IN (SELECT eid FROM event_member WHERE uid IN (SELECT uid2 FROM friend WHERE uid1=me() limit " + step + " offset " + idx*step + "))",
		    access_token: user.accessToken
		    
		},
		function(resp) {
		    if (!resp.length) {
			if (resp.error || resp.error_code) {
			    if (tries > 2) {
				return
			    }
			    console.log("error - " + resp.error);
			    console.dir(resp);
			    step = Math.round(step / 2);
			    return getEventsLooper(idx, user, eventsDB, refreshDB, tries+1);
			}
			else {
			    refreshDB.update({'latest':new Date()});
			    pullingFB.status = false;
			    return;
			}
		    }

		    pullingFB.status += 1;
		    if (idx == 20) { 
			console.log("breaking prematurely");
			pullingFB.status = false;
			return;
		    }
		    _.each(resp, function(el) {
			el.selfEvent = false;
			data[el.eid] = el;
		    });
		    eventsDB.update(data);
		    if (step < 100) {
			step += 10;
		    }
		    
		    return getEventsLooper(idx+1, user, eventsDB, refreshDB, 0);
		    

		}
	    );
	}

	var getEventsInner = function(user, forceRefresh) {
	    var userId = user.id;
	    var eventsUrl = "https://creaturefeature.firebaseIO.com/events/"+userId;
	    var refreshUrl = "https://creaturefeature.firebaseIO.com/refresh/"+userId;
	    var eventsDB = new Firebase(eventsUrl);
	    var refreshDB = new Firebase(refreshUrl);

	    if (forceRefresh) {
		return getEventsLooper(0, user, eventsDB, refreshDB, 0);
	    }

	    refreshDB.on('value', function(snapshot) { 
		refreshDB.off('value')
		if (snapshot.val()) {
		    var latestDate = Date.parse(snapshot.val().latest);
		    var now = new Date();
		    if ((now - latestDate) < 120*60*1000 ) { 
			pullingFB.status = false;
			return
		    }
		}
		getEventsLooper(0, user, eventsDB, refreshDB, 0);
	    });

	}

	return {
	    getEvents: getEventsInner,
	    pullingFB: pullingFB
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
		    cb(u);
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
	   