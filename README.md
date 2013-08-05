# actvJS

actvJS is a javascript client for the Active.com [V2 Search API](http://a3pi.active.com/v2/search) and the [V1 Results API](http://results.active.com/api/v1).

The API is still in beta so there may be changes that break the javascript client.

[Active.com](http://www.active.com) is the leader in activity and participation management.  They help organizers get participants,
manage events, and build communities.

## Requirements

[jQuery](http://jquery.com/)

## Installation

    <script type="text/javascript" src="jquery.js"></script>
    <script type="text/javascript" src="actv.js"></script>

## Usage

Search for events near you:

    var activities = ACTV.activities(function() {
      this.query('cycling');
      this.near('San Diego, CA');
      this.from('2012-12-01');
      this.to(new Date(Date.parse('01/31/2013')));
    });

    activities.search().done(function(data) {
      console.log(data.results);
    })

Search for popular events near you:

    var popular = ACTV.popular(activities);
    popular.search().done(function(data) {
      console.log(data.results);
    })

Search by asset Guid:

    var assets = ACTV.assets(function() {
      this.findByIds('ec187ae9-5f84-4883-8316-b6d24e5e0597');
    });

    assets.search().done(function(data) {
      console.log(data);
    })

Search for multiple assets by their asset Guid:

    var assets = ACTV.assets(function() {
      this.findByIds(['c055f67d-8727-4691-bc2e-8b439f3731c1','a3a8621f-8291-4d3f-b526-31debc548a33']);
    });

    assets.search().done(function(data) {
      console.log(data);
    })

Search for an event on the results.active.com:

    var results = ACTV.results().search(function() {
      this.query('10k');
    })

    results.search().done(function(data) {
      console.log(data);
    })

Get the event info from the results.active.com API:

    ACTV.results().event(344).done(function(data) {
      console.log(data);
    })


## To Do

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Added some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
