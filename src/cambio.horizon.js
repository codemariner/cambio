(function ($, cambioLightbox) {
    "use strict";

    var $lightbox = $(cambioLightbox);

    $lightbox.on('cambio.lightbox.articleLoaded', function (e) {
        setTimeout(function () {
            if (typeof(window.Sailthru) !== 'undefined' && typeof(window.Sailthru.track) === 'function') {
                var $tags = $('meta[name="cambio:this-post-tags"]');
                var tags = '';
                if ($tags.length) {
                    tags = $tags.attr('content');
                }
                window.Sailthru.track({
                    domain: "horizon.cambio.com",
                    tags: tags
                });
            }
        }, 500);
    });
}) (jQuery, cambioLightbox);
