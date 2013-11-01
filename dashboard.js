$(function() {
$.each($("div[data-oxpoints]"), function(_, widgetEl) {
    widgetEl = $(widgetEl);
    var oxpoints = widgetEl.data('oxpoints');
    
    var query = "https://data.ox.ac.uk/sparql/?query=SELECT+%3Faccount+%3FresourceLabel+WHERE+%7B%0D%0A++%3Faccount+foaf%3AaccountServiceHomepage+%3Chttps%3A%2F%2Fnexus.ox.ac.uk%2F%3E+.%0D%0A++%3Fresource+foaf%3Aaccount+%3Faccount+.%0D%0A++%3Fresource+dc%3Atitle+%3FresourceLabel+.%0D%0A++%3Fresource+spatialrelations%3Awithin+%3Chttp%3A%2F%2Foxpoints.oucs.ox.ac.uk%2Fid%2F"+oxpoints+"%3E%0D%0A%7D&format=srj&common_prefixes=on";
    
    var availableRooms = [];
    var timeSeries = [];
    
    function processRoom(room) {
        var endpoint = "http://127.0.0.1:8080/availability?email=";
        
        $.ajax(endpoint+room.email, {
            dataType: "json",
            context: this,
            success: function(data) {
                var periods = data.busyPeriods.periods;
                var times = [];
                for (var i in periods) {
                    var period = periods[i];
                    // 2013-11-01T10:00:00GMT
                    var format = "YYYY-MM-DD'T'HH:mm:ssZ";
                    var fromMoment = moment(period.from, format);
                    var toMoment = moment(period.to, format);
                    times.push({starting_time: fromMoment.valueOf(), ending_time: toMoment.valueOf()})
                }
                
                var label = room.name;
                var avoid = "Meeting Room";     // if present, remove this string
                if (label.indexOf(avoid) !== -1) {
                    label = label.split(avoid)[0].trim();
                }
                
                timeSeries.push({times: times, label: label});
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
    
    $(document).ajaxStop(function() {
        $(this).unbind("ajaxStop"); //prevent running again when other calls finish
        
        var morning = moment().hour(8).minute(0).valueOf();
        var night = moment().hour(19).minute(0).valueOf();
        
        var chart = d3.timeline().width(1000).stack();
        var colorScale = d3.scale.ordinal().range(['#00000']);
        chart.colors(colorScale);
        chart.tickFormat({format: d3.time.format("%H"), tickTime: d3.time.hours, tickNumber: 1, tickSize: 2});
        chart.beginning(morning);
        chart.ending(night);
        chart.showToday();
        chart.showTodayFormat({marginTop: 25, marginBottom: 0, width: 3, color: "rgb(255, 0, 0)"});
        chart.hover(function (d, i, datum) {
            var element = $("#details");
            var name = datum.label;
            var start = moment(d.starting_time);
            var end = moment(d.ending_time);
            var format = "H:mm";
            var formatted_start = start.format(format);
            var formatted_end = end.format(format);
            element.html("<h2>"+name+"</h2><p>Busy from "+formatted_start+" to "+formatted_end+"</p>");
          })
          
        var svg = d3.select(widgetEl[0]).append("svg").datum(timeSeries).call(chart);
    });
});
});