$(function() {
    $.each($("div[data-room-email]"), function(_, widgetEl) {
        widgetEl = $(widgetEl);
        var email = widgetEl.data('room-email');
        var endpoint = "http://127.0.0.1:8080/availability?email=";
        $.ajax(endpoint+email, {
            dataType: "json",
            success: function(data) {
                var periods = data.busyPeriods.periods;
                var html = "<ul>";
                for (var index in periods) {
                    var period = periods[index];
                    // 2013-11-01T10:00:00GMT
                    var format = "YYYY-MM-DD'T'HH:mm:ssZ";
                    var fromMoment = moment(period.from, format);
                    var toMoment = moment(period.to, format);
                    html += "<li>From: " + fromMoment.format("HH:mm") + " to " + toMoment.format("HH:mm") + "</li>";
                }
                html += "</ul>";
                widgetEl.html(html);
            }
        });
    });
});