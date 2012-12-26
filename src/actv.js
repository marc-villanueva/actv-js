window.ACTV = (function() {
  /*
  * actv - main library object which provides
  * the DSL to interact with the API
  *
  * Example usage:
  *
  * To set a different API endpoint than the default:
  *   actv.configuration().host('http://server.com');
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
    }
  }

  /*
  * Configuration
  * 
  *
  */
  function Configuration() {
    this._host = null;    
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
      return $.get(url);
    },
    post: function(url, data) {
      return $.post(url, data);
    }
  }

 /*
  * BaseSearch - base class for
  * the different types of searches
  *
  */
  function BaseSearch() {
    this._options = {};
    this._options['exclude_children'] = true;
  }
  BaseSearch.prototype = {
    keywords: function(value) {
      return this._attr('keywords', value);
    },
    sort: function(sort) {
      return this._attr('sort', sort);
    },
    currentPage: function(currentPage) {
      return this._attr('currentPage', currentPage);
    },
    perPage: function(perPage) {
      return this._attr('perPage', perPage);
    },
    search: function() {
      var obj = {};
      $.extend(obj, this._options);

      if( this._options['from'] || this._options['to']) {
        obj.startDate = this._options['from'] + '..' + this._options['to'];
        delete obj.from;
        delete obj.to;
      }
      console.log($.param(obj));
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
  * ActivitiesSearch - provides searching
  * capabilites for activites in the Active directory
  *
  * 
  */
  function ActivitiesSearch(block) {
    this._options['category'] = 'event';

    if(typeof block == 'function')
      block.call(this);
  }
  ActivitiesSearch.prototype = new BaseSearch();
  ActivitiesSearch.prototype.near = function(location) {
    return this._attr('near', location);
  }
  ActivitiesSearch.prototype.radius = function(radius) {
    return this._attr('radius', radius);
  }
  ActivitiesSearch.prototype.from = function(value) {
    return this._attr('from', value);
  }
  ActivitiesSearch.prototype.to = function(value) {
    return this._attr('to', value);
  }

  
  /*
  * ArticlesSearch - provides searching
  * capabilites for articles in the Active directory
  *
  * 
  */
  function ArticlesSearch(block) {
    this._options['category'] = 'articles';

    if(typeof block == 'function') 
      block.call(this);
  }
  ArticlesSearch.prototype = new BaseSearch();



  return new actv();
})();