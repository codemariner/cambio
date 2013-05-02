(function ($) {

    $.cambio = {};

})(jQuery);

(function ($, window) {

    //  $.cambio.mm.trackAjax('http://foo/bar', {prop1: 'foo', prop2: 'bar'});

    /**
     * Cambio specific tracking.
     *
     * When using trackAjax, the original properties from s_265 will be
     * stored as data on $.cambio.mm as 's_265'. You can revert to those
     * properties with $.cambio.mm.revert().  Alternatively, you can do
     * this automatically for a call with $.cambio.mm.trackAjaxAndRevert().
     *
     */
    $.cambio.mm = {

        // For in-page ajax omniture calls, properties from omnitureConfig
        // will be set directly on s_265.
        //
        trackAjax: function (url, omnitureConfig) {
            var self = $.cambio.mm;

            // make sure we capture the very original omniture
            // configuration in case we needs it
            self._cloneOriginal();

            if (window.s_265) {
                // copy in any provided properties
                if (omnitureConfig) {
                    $.extend(window.s_265, omnitureConfig);
                }

                // now set the stuff for the ajax url
                window.s_265.prop12 = url;
                window.s_265.mmxcustom = url;
    
                window.s_265.t();
            }
            // beacon call
            if (window.bN_cfg) {
                window.bN.view();
            }
        },

        // makes tracking calls for ajax request and subsequently
        // reverts the omniture config to it's original settings
        trackAjaxAndRevert: function (url, omnitureConfig) {
            var self = $.cambio.mm;
            self.trackAjax(url, omnitureConfig);
            self.revert();
        },

        // revert s_265 to it's original configuration
        revert: function () {
            var self = $.cambio.mm;
            var orig = self.data('s_265');
            var s_265 = window.s_265;
            if (s_265 && orig) {
                // set original props
                for (var key in orig) {
                    s_265[key] = orig[key];
                }
                // remove new props
                for (key in s_265) {
                    if (!(key in orig)) {
                        var type = typeof s_265[key];
                        // only unset properties that seem to be
                        // configuration values
                        if (type === 'string' || type === 'number') {
                            s_265[key] = undefined;
                        }
                    }
                }
            }
        },

        // convenience accessor for data stored in $.cambio.mm.
        data: function (name, value) {
            return $.data.apply($, [$.cambio.mm, name, value]);
        },

        // this will capture the original omniture configuration once
        _cloneOriginal: function () {
            var self = $.cambio.mm;
            if (window.s_265) {
                var data = self.data('s_265');
                if (typeof data === 'undefined') {
                    data = {};
                    for (var key in window.s_265) {
                        var value = window.s_265[key];
                        // TODO: not actually sure if we should skip objects, 
                        // or even if this whole clone thing is kosher,
                        // but we're trying to copy off all of the
                        // configuration values.  Consider using specific
                        // properties like prop1, prop2, etc.
                        var type = typeof value;
                        if (type === 'string' || type === 'number') {
                            data[key] = window.s_265[key];
                        }
                    }
                    self.data('s_265', data);
                }
            }
        }
    };

})(jQuery, window);

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
