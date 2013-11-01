$(function() {
    var query = "https://data.ox.ac.uk/sparql/?query=SELECT+%3Faccount+%3FresourceLabel+WHERE+%7B%0D%0A++%3Faccount+foaf%3AaccountServiceHomepage+%3Chttps%3A%2F%2Fnexus.ox.ac.uk%2F%3E+.%0D%0A++%3Fresource+foaf%3Aaccount+%3Faccount+.%0D%0A++%3Fresource+dc%3Atitle+%3FresourceLabel+.%0D%0A++%3Fresource+spatialrelations%3Awithin+%3Chttp%3A%2F%2Foxpoints.oucs.ox.ac.uk%2Fid%2F23233672%3E%0D%0A%7D&format=srj&common_prefixes=on";
    
    var availableRooms = [];
    var rooms = [];
    
    function processRoom(room) {
        var endpoint = "http://127.0.0.1:8080/availability?email=";
        
        $.ajax(endpoint+room.email, {
            dataType: "json",
            context: this,
            success: function(data) {
                var periods = data.busyPeriods.periods;
                var now = moment();
                var busy = false;
                var ps = [];
                for (var i in periods) {
                    var period = periods[i];
                    // 2013-11-01T10:00:00GMT
                    var format = "YYYY-MM-DD'T'HH:mm:ssZ";
                    var fromMoment = moment(period.from, format);
                    var toMoment = moment(period.to, format);
                    var now = false;
                    if (fromMoment.isAfter(now) && toMoment.isBefore(now)) {
                        busy = true;
                        now = true;
                    }
                    ps.push({from: fromMoment, to: toMoment, now: now});
                }
                var r = {};
                r.name = room.name;
                r.email = room.email;
                r.busy = busy;
                r.periods = ps;
                rooms.push(r);
            }
        });
    }
    
    function processRooms() {
        for (var index in availableRooms) {
            var room = availableRooms[index];
            processRoom(room);
        }
    }
    
    $.ajax(query, {
        context: this,
        success: function(data) {
            var resources = data.results.bindings;
            var div = $("#rooms");
            for (var index in resources) {
                var resource = resources[index];
                var mailto = resource.account.value;
                var email = mailto.split(":")[1];
                var title = resource.resourceLabel.value;
                availableRooms.push({name: title, email: email});
            }
            processRooms();
        }
    });
    
    
    
});