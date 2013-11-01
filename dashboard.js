$(function() {
    var query = "https://data.ox.ac.uk/sparql/?query=SELECT+%3Faccount+%3FresourceLabel+WHERE+%7B%0D%0A++%3Faccount+foaf%3AaccountServiceHomepage+%3Chttps%3A%2F%2Fnexus.ox.ac.uk%2F%3E+.%0D%0A++%3Fresource+foaf%3Aaccount+%3Faccount+.%0D%0A++%3Fresource+dc%3Atitle+%3FresourceLabel+.%0D%0A++%3Fresource+spatialrelations%3Awithin+%3Chttp%3A%2F%2Foxpoints.oucs.ox.ac.uk%2Fid%2F23233672%3E%0D%0A%7D&format=srj&common_prefixes=on";
    
    function processRooms() {
    $.each($("div[data-room-email]"), function(_, widgetEl) {
        widgetEl = $(widgetEl);
        var email = widgetEl.data('room-email');
        var endpoint = "http://127.0.0.1:8080/availability?email=";
        $.ajax(endpoint+email, {
            dataType: "json",
            success: function(data) {
                var periods = data.busyPeriods.periods;
                var html = "";
                var now = moment();
                if (periods.length > 0) {
                    html += "<ul>";
                    var busy = false;
                    for (var index in periods) {
                        var period = periods[index];
                        // 2013-11-01T10:00:00GMT
                        var format = "YYYY-MM-DD'T'HH:mm:ssZ";
                        var fromMoment = moment(period.from, format);
                        var toMoment = moment(period.to, format);
                        if (fromMoment.isAfter(now) && toMoment.isBefore(now)) {
                            html += "<li><strong>From: " + fromMoment.format("HH:mm") + " to " + toMoment.format("HH:mm") + "</strong></li>";
                            busy = true;
                        } else {
                            html += "<li>From: " + fromMoment.format("HH:mm") + " to " + toMoment.format("HH:mm") + "</li>";
                        }
                    }
                    html += "</ul>";
                    if (busy) {
                        html += '<div style="width: 40px; height: 40px; background-color: red;"></div>';
                    } else {
                        html += '<div style="width: 40px; height: 40px; background-color: green;"></div>';
                    }
                } else {
                    html = '<strong>No meetings!</strong><div style="width: 40px; height: 40px; background-color: green;"></div>';
                }
                widgetEl.html(html);
            }
        });
    });
    }
    
    $.ajax(query, {
        success: function(data) {
            var resources = data.results.bindings;
            var div = $("#rooms");
            for (var index in resources) {
                var resource = resources[index];
                var mailto = resource.account.value;
                var email = mailto.split(":")[1];
                var title = resource.resourceLabel.value;
                rooms += title + ", ";
                var room = $("<h2>"+title+"</h2><div data-room-email='" + email + "'></div>")
                div.append(room);
            }
            processRooms();
        }
    });
    
    
    
});