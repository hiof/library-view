(function(Hiof, undefined) {

    renderData = function(data) {



        var templateSource = Hiof.Templates['library/index'];


        var markup = templateSource(data);
        $('.library-portal').html(markup);
        //var scrollDestEl = "#content";
        //Hiof.scrollToElement(scrollDestEl);

    };

    getData = function() {
        var options = {};
        // Setup the query
        var settings = $.extend({
            // These are the defaults.
            id: 17328,
            server: 'www2'
        }, options);


        var contentType = "application/x-www-form-urlencoded; charset=utf-8";

        if (window.XDomainRequest) { //for IE8,IE9
            contentType = "text/plain";
        }
        $.ajax({
            url: 'http://hiof.no/api/v1/libraryservices/',
            method: 'GET',
            async: true,
            dataType: 'json',
            data: settings,
            contentType: contentType,
            success: function(data) {

                console.log(data);
                renderData(data);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert("You can not send Cross Domain AJAX requests: " + errorThrown);
            }

        });
    };

    // on document load
    $(function() {
        if ($('.library-portal').length) {
            getData();
        }
    });

})(window.Hiof = window.Hiof || {});
