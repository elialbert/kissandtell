'use strict';

/* Services */

angular.module('3vent.services', ['firebase']).
    service("fbData", function() {
	console.log("running loaddata service");
	var dt = new Date();
	var early = Math.round(new Date().setDate(new Date().getDate() - 1) / 1000);
	var late = Math.round(new Date().setDate(new Date().getDate() + 21) / 1000);
	var step = 100;
	var pullingFB = {};
	var getEventsLooper = function(idx, eventsDB, refreshDB, tries) {
	    console.log("setting pullingfb to true, step is " + step);
	    pullingFB.status=true;
	    console.log("in getEventsLooper, idx is " + idx);
	    var data = {};
	    if (idx == 0) {
		FB.api(
		    {
			method: 'fql.query',
			query: "SELECT eid, name, description, start_time, location, all_members_count, attending_count, creator, declined_count, end_time, has_profile_pic, host, pic, venue FROM event WHERE start_time >= " + early + " AND start_time <= " + late + " AND eid IN (SELECT eid FROM event_member WHERE uid=me())"
		    },
		    function(resp) {
			var extra_data = {};
			console.dir(resp);
			console.log("preparing self event data to update");
			if (resp.error) {
			    console.log("pulling self events error is: " + error);
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
		    query: "SELECT eid, name, description, start_time, location, all_members_count, attending_count, creator, declined_count, end_time, has_profile_pic, host, pic, venue FROM event WHERE start_time >= " + early + " AND start_time <= " + late + " AND eid IN (SELECT eid FROM event_member WHERE uid IN (SELECT uid2 FROM friend WHERE uid1=me() limit " + step + " offset " + idx*step + "))"
		},
		function(resp) {
		    console.log("got the events! " + resp.length);
		    if (!resp.length) {
			if (resp.error) {
			    if (tries > 2) {
				return
			    }
			    console.log("error - " + resp.error.message);
			    step = Math.round(step / 2);
			    return getEventsLooper(idx, eventsDB, refreshDB, tries+1);
			}
			else {
			    console.log("all fresh out!");
			    console.dir(resp);
			    refreshDB.update({'latest':new Date()});
			    pullingFB.status = false;
			    return;
			}
		    }
		    if (idx == 20) {
			console.log("breaking prematurely");
			pullingFB.status = false;
			return;
		    }
		    console.log("preparing event data to update");
		    _.each(resp, function(el) {
			// eventsDB.child(el.eid).update(el); //very slow way
			el.selfEvent = false;
			data[el.eid] = el;
		    });
		    console.log("running big update");
		    eventsDB.update(data);
		    console.log("done with big update");
		    if (step < 100) {
			step += 10;
		    }
		    
		    return getEventsLooper(idx+1, eventsDB, refreshDB, 0);
		    

		}
	    );
	}

	var getEventsInner = function(userId, forceRefresh) {
	    console.log("running getevents inner with forcerefresh " + forceRefresh);
	    var eventsUrl = "https://creaturefeature.firebaseIO.com/events/"+userId;
	    var refreshUrl = "https://creaturefeature.firebaseIO.com/refresh/"+userId;
	    var eventsDB = new Firebase(eventsUrl);
	    var refreshDB = new Firebase(refreshUrl);

	    if (forceRefresh) {
		console.log ("forcing refresh");
		return getEventsLooper(0, eventsDB, refreshDB, 0);
	    }

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
		getEventsLooper(0, eventsDB, refreshDB, 0);
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
	   