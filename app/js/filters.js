'use strict';

/* Filters */

angular.module('3vent.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }]).filter('startFrom', function() {
    return function(input, start) {
	if (!input) {
	    return [];
	}
        start = +start; //parse to int
        return input.slice(start);
    }
});

