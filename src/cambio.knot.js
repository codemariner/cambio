(function ($, FB) {
    "use strict";

    $.fn.cambioEmbeddedGallery = function (options) {
        var $embeddedKnot = $(this);

        function setCounter(context) {
            if (context) { 
                $('.aol-knot-counter').html('Photo ' + (context.activeSlide + 1) + ' of ' + context.slideCount);
            }
        }
    
        var settings = {
            data: '.photo-gallery',
            wrapperHeight: '600',
            contentMap: {
                'media-id': {
                    path: '[data-media-id]'
                },
                entryArray: {
                    path: 'li.photo'
                },
                'photo_src': {
                    path: 'a[data-photo-src]'
                },
                caption: {
                    path: 'a[html]'
                },
                type: {
                    path: '[data-type]'
                }
            },
            refreshDivId: $('#ajaxAdDevil').length ? 'ajaxAdDevil' : 'adsDiv1',
            refreshCount: 1,
            after: '<div class="aol-knot-counter"></div>',
            onUiBuilt: function (context) {
                setCounter(context);
                $embeddedKnot.on('slideChange', function (evt) {
                    setCounter(context);            
                });
            }
        };
        if (options && options.knot) {
            settings = $.extend(settings, options.knot);
        }
 
        $embeddedKnot.knot(settings);

        return $embeddedKnot;
    };


    /**
     * launchers: collection of things that will launch the gallery when
     *            clicked as well as contain an href to the data
     * options:
     *   rrMN - Right rails magic number, required.
     *   galleryId - galleryId, used to id the ad div.  Defaults to 2.
     *   adRefreshCount - how many slides to trigger new page serve (for
     *      ad and omniture). Default 1.
     *   title - slideshow title
     *   knot - options to pass on to knot
     *
     */
    $.fn.cambioFullscreenGallery = function (options, $launchers, path) {
        var $fullScreenKnot = $(this);
    
        options = $.extend({galleryId: 1, adRefreshCount: 2}, options);

        var shareHtml = function () {
            if (options.shareTemplateId) {
                var text = $('#' + options.shareTemplateId).text();
                text = text.replace(/sscript/g, 'script');
                return text;
            }
            return '';
        };

        // find the first href that matches a known url pattern
        // and return it
        var getDataSetting = function () {
            if (path) {
                return path;
            }
            var href;
            $launchers.each(function () {
                var $this = $(this);
                href = $this.attr('href');
        
                //["http://cambio3.sandbox.cambio.com/2013/04/17/test-gallery-article/?v=1&x=y#!slide=5663254",
                // 1 - "http:", 
                // 2 - "http", 
                // 3 -"//cambio3.sandbox.cambio.com", 
                // 4 -"cambio3.sandbox.cambio.com", 
                // 5 -"/2013/04/17/test-gallery-article/", 
                // 6 -"?v=1&x=y", 
                // 7 -"v=1&x=y", 
                // 8 -"#!slide=5663254", 
                // 9 -"!slide=5663254"]
                //var regex = new RegExp('/photos/');
        
                if (href) {
                    var regex = new RegExp('^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?');
                    var matches = regex.exec(href);
        
                    // if the path is for photos, then go ahead and convert into
                    // the ajax-photo request
                    if (matches[5]) {
                        var photoRegx = new RegExp('^/photos/');
                        var slideshowRegex = new RegExp('^/slideshow/');
                        if (photoRegx.test(matches[5])) {
                            matches[5] = matches[5].replace(photoRegx, '/ajax-photos/');
        
                            // assuming we need to go to the current site, so drop
                            // the protocol and host
                            href = [matches[5], matches[6], matches[8]].join('');
                            return false;
                        } else if (slideshowRegex.test(matches[5])) {
                            matches[5] = matches[5].replace(slideshowRegex, '/ajax-slideshow/');
        
                            // assuming we need to go to the current site, so drop
                            // the protocol and host
                            href = [matches[5], matches[6], matches[8]].join('');
                            return false;
                        } else {
                            // there's no expected photos link, so nothing to do
                            return;
                        }
                    }
                }
            });
            return href;
        };

        // we figure out where to get the data based on the launcher, 
        // if there isn't one, then there's no point in going on
        if (!$launchers || !$launchers.length) {
            return;
        }

    
        // where we'll get our data from
        var dataUrl = getDataSetting();
        if (typeof dataUrl === 'undefined' || dataUrl.length <= 0) {
            // if this isn't found then we dont' know where to get data
            return;
        }

        // settings for knot
        var settings = {
            slideshowTitle: options.title,
            fullscreenOnly: true,
            fullscreen: true,
            wrapperHeight: '600',
            contentMap: {
                'media-id': {
                    path: '[data-media-id]'
                },
                entryArray: {
                    path: 'li.photo'
                },
                'photo_src': {
                    path: 'a[data-photo-src]'
                },
                caption: {
                    path: 'a[html]'
                },
                type: {
                    path: '[data-type]'
                },
                rightRailHtml: [
                    '<div class="aol-knot-fullscreen-exit">',
                    '</div>',
                    '<div class="aol-knot-fullscreen-right-share">',
                    '</div>'
                ].join('')
            },
            fullscreenAdMN: options.rrMN,
            fullscreenAdHeight: "RR",
            fullscreenAdWidth: "RR",
            isInternational: 0,
            refreshCount: options.adRefreshCount,
            fullscreenRefreshDivId: ['knotFullscreenAd-' + options.galleryId],
            dataType: 'html'
        };
 

        // extend any knot specific options
        if (options && options.knot) {
            settings = $.extend(settings, options.knot);
        }


        // initialize knot
        var _settings = {"data": dataUrl};
        $.extend(_settings, settings);
        $fullScreenKnot.knot(_settings);

        $launchers.on('click', function (evt) {
            evt.preventDefault();
            var $this = $(this);
            var $knot = $fullScreenKnot.data('knot');
            var activeSlide = $this.data('active-slide') ? Number($this.data('active-slide')) : 0;
            if ($knot.isFullscreen && activeSlide) {
                $fullScreenKnot.knotFullscreen('showSlide', activeSlide);
            } else {
                $knot.activeSlide = activeSlide;
                $fullScreenKnot.knotFullscreen('enterFullscreen');
            }
        });

        // add the sharing stuff only when we actually enter fullscreen
        // mode the first time
        $fullScreenKnot.on('enteredFullscreen', function () {
            if (!$fullScreenKnot.data('shared')) {
                $('.aol-knot-fullscreen-right-share').html(shareHtml());
                if (FB) {
                    FB.XFBML.parse(); 
                }
                if (window.twttr) {
                    window.twttr.widgets.load();
                    //$.getScript("http://platform.twitter.com/widgets.js");
                }
                $fullScreenKnot.data('shared', true);
            }
            $fullScreenKnot.scrollParent().animate({scrollTop: $fullScreenKnot.position().top}, 'slow');
            $fullScreenKnot.data('knot')._track();
        });

        return $fullScreenKnot;
    };

})(jQuery, window.FB);
