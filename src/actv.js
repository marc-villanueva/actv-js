window.ACTV = (function() {
  /*
  *  Helper functions
  */
  function createObject(parent) {
    function TempClass() {}
    TempClass.prototype = parent;
    var child = new TempClass();
    return child;
  }

  function inherit(child, parent) { 
    var newSubPrototype = createObject(parent.prototype); 
    newSubPrototype.constructor = child; 
    child.prototype = newSubPrototype;
  };

  /*
  * actv - main library object which provides
  * the DSL to interact with the API
  *
  * Example usage:
  *
  * To set a different API endpoint than the default:
  *   actv.configuration().host('http://server.com');
  *
  * To set a differnt endpoint for Results:
  *   actv.configuration().resultsHost('http://server.com');
  */
  function actv() {
    this._config = new Configuration();
  }

  actv.prototype = {
    configuration: function() {
      return this._config;
    },
    activities: function(block) {
      return new ActivitiesSearch(block);
    }, 
    articles: function(block) {
      return new ArticlesSearch(block);
    }, 
    popular: function(search) {
      return new PopularSearch(search);
    },
    results: function() {
      return new Results();
    }
  }

  /*
  * Results - main DSL to interact with the 
  * results.active.com v1 api.
  */
  function Results() {}

  Results.prototype = {
    search: function(block) {
      return new ResultsSearch(block);
    },
    event: function(eventId) {
      return ACTV.configuration().client().get(ACTV.configuration().resultsHost() + '/api/v1/events/' + eventId + '?callback=?');
    },
    subEvents: function(eventId) {
      return ACTV.configuration().client().get(ACTV.configuration().resultsHost() + '/api/v1/events/' + eventId + '/sub_events?callback=?');
    },
    subEvent: function(eventId, subEventId) {
      return ACTV.configuration().client().get(ACTV.configuration().resultsHost() + '/api/v1/events/' + eventId + '/sub_events/' + subEventId + '?callback=?');
    },
    participants: function(eventId, subEventId) {
      return ACTV.configuration().client().get(ACTV.configuration().resultsHost() + '/api/v1/events/' + eventId + '/sub_events/' + subEventId + '/participants?callback=?');
    },
    participant: function(eventId, subEventId, participantId) {
      return ACTV.configuration().client().get(ACTV.configuration().resultsHost() + '/api/v1/events/' + eventId + '/sub_events/' + subEventId + '/participants/' + participantId + '?callback=?');
    }
  }

  /*
  * Configuration
  * 
  *
  */
  function Configuration() {
    this._host = null;    
    this._resultsHost = null;
    this._client = null;
  }

  Configuration.prototype = {
    host: function(value) {
      if(typeof value == 'undefined') {
        this._host = this._host ? this._host : 'http://a3pi.active.com';
        return this._host;
      } else {
        if(value[value.length - 1] == '/') {
          value = value.substr(0, value.length - 1);
        }
        this._host = value;
      }
    }, 
    resultsHost: function(value) {
      if(typeof value == 'undefined') {
        this._resultsHost = this._resultsHost ? this._resultsHost : 'http://results.active.com';
        return this._resultsHost;
      } else {
        if(value[value.length - 1] == '/') {
          value = value.substr(0, value.length - 1);
        }
        this._resultsHost = value;
      }
    },
    client: function(value) {
      if(typeof value == 'undefined') {
        this._client = this._client ? this._client : new jQueryClient();
        return this._client;
      } else
        this._client = value;
    }
  }

  /*
  * jQueryClient - client class
  * for AJAX interactions with the API
  *
  */
  function jQueryClient() {
  }
  jQueryClient.prototype = {
    get: function(url) {
      return $.getJSON(url);
    },
    post: function(url, data) {
      return $.post(url, data);
    }
  }


 /*
  * BaseSearch - base class for
  * the different types of  searches
  *
  */
  function BaseSearch() {
    this._options = {};
    
    this._options['endpoint'] = '/v2/search';
    this._callbackParameter = 'cb';
  }

  BaseSearch.prototype = {
    endpoint: function(value) {
      return this._attr('endpoint', value);
    },
    url: function() {
      return ACTV.configuration().host() + this.endpoint() + '?' + this.toParams();
    },
    query: function(value) {
      return this._attr('query', value);
    },
    sort: function(sort) {
      return this._attr('sort', sort);
    },
    currentPage: function(currentPage) {
      return this._attr('current_page', currentPage);
    },
    perPage: function(perPage) {
      return this._attr('per_page', perPage);
    },
    search: function() {
      return ACTV.configuration().client().get(this.url() + '&' + this._callbackParameter + '=?');
    },
    toParams: function() {
      var obj = {};
      $.extend(obj, this._options);
     
      delete obj.endpoint;

      if( this._options['from'] || this._options['to']) {
        obj.start_date = this._options['from'] + '..' + this._options['to'];
        delete obj.from;
        delete obj.to;
      }
      return $.param(obj);
    },
    _attr: function(property, value) {
      if(value) {
        this._options[property] = value;
      } else {
        return this._options[property];
      }
    }
  }

  /* 
  * ResultsSearch - provides
  * searching capabilities against
  * the results.active.com AP
  */
  function ResultsSearch(block) {
    this._options = {};
    this._options['endpoint'] = '/api/v1/search';
    this._callbackParameter = 'callback';

    if(typeof block == 'function')
      block.call(this);
  }
  inherit(ResultsSearch, BaseSearch);

  ResultsSearch.prototype.url = function() {
      return ACTV.configuration().resultsHost() + this.endpoint() + '?' + this.toParams();
  }
  ResultsSearch.prototype.sort = function(sort) {
      return this._attr('sorting', sort);
  }
  ResultsSearch.prototype.currentPage = function(currentPage) {
      return this._attr('page', sort); 
  }

  /*
  * ActivitiesSearch - provides searching
  * capabilites for activites in the Active directory
  *
  * 
  */
  function ActivitiesSearch(block) {
	  BaseSearch.call(this);
    this._options['category'] = 'event';
    this._options['exclude_children'] = true;

    if(typeof block == 'function')
      block.call(this);
  }
  inherit(ActivitiesSearch, BaseSearch);
  
  ActivitiesSearch.prototype.near = function(location) {
    return this._attr('near', location);
  }
  ActivitiesSearch.prototype.radius = function(radius) {
    return this._attr('radius', radius);
  }
  ActivitiesSearch.prototype.from = function(value) {
    var d;
  
    if(typeof value == 'string') {
      d = new Date(Date.parse(value));
    } else if(typeof value == 'object') {
      d = value;
    }
    
    if(d) {
      value = d.getUTCFullYear() + "-" + (d.getUTCMonth() + 1) + "-" + d.getUTCDate();
    }

    return this._attr('from', value);
  }
  ActivitiesSearch.prototype.to = function(value) {
    var d;
  
    if(typeof value == 'string') {
      d = new Date(Date.parse(value));
    } else if(typeof value == 'object') {
      d = value;
    }
    
    if(d) {
      value = d.getUTCFullYear() + "-" + (d.getUTCMonth() + 1) + "-" + d.getUTCDate();
    }

    return this._attr('to', value);
  }

  /*
  * ArticlesSearch - provides searching
  * capabilites for articles in the Active directory
  *
  * 
  */
  function ArticlesSearch(block) {
	BaseSearch.call(this);
    this._options['category'] = 'articles';
    this._options['exclude_children'] = true;

    if(typeof block == 'function') 
      block.call(this);
  }
  inherit(ArticlesSearch, BaseSearch);
  
  /*
  * PopularSearch - provides search
  * capabilities to the popular api
  * endpoint
  *
  * Example usage:
  *
  * var activities = ACTV.activities(function() {
  *   this.query('cycling');
  *   this.near('San Diego, CA');
  *   this.from('2012-12-01');
  *   this.to(new Date(Date.parse('01/31/2013')));
  * });
  *
  * var popularActivities = ACTV.popular(activities);
  * popularActivities.search().done(function(data) {
  *   console.log(data.results);
  * }); 
  */
  function PopularSearch(search) {
    this._search = search;
    
    this._endpoint = '/v2/events/popular';
    
    if(search instanceof ArticlesSearch) {
      this._endpoint = '/v2/articles/popular';
    }
  }

  PopularSearch.prototype = {
    endpoint: function() {
      return this._endpoint;
    },
    url: function() {
      return ACTV.configuration().host() + this.endpoint() + '?' + this._search.toParams();
    },
    search: function() {
      return ACTV.configuration().client().get(this.url() + '&cb=?');
    }
  }

  var ACTV = new actv();
  return ACTV;
})();