    //Code from js-bottom-knot-js
var findLauncher = function () {
    var regex = /\/photos\/[^\/]+/;
    var launcher;
    $('.articleText a').each(function () {
        var $this = $(this);
        var href = $(this).attr('href');
        if (href && href.length) {
            if (regex.test(href)) {
                if (!$this.parent('.post-gallery').length) {
                    launcher = $this;
                }
                return false;
            }
        }
    });
    return launcher;   
};

var cambioJsBottomKnot = function (options) {
    var galleryId = '';
    var opts = '';
    var optsWithNext = {};

    // see if the article specifies a next gallery/article link
    $.extend(optsWithNext, options);
    var $article = $('.articleCnt');
    if ($article.length) {
        var nextLink = $article.data('gallery-next');
        if (nextLink) {
            var nextCopy = $article.data('gallery-next-copy') ? $article.data('gallery-next-copy') : 'More Photos';
            optsWithNext.nextGallery = nextLink;
            optsWithNext.nextGalleryCopy = nextCopy;
        }
    }

    $('#knot').cambioEmbeddedGallery(optsWithNext);
    optsWithNext.shareTemplateId = options.shareTemplateId = 'share-bar-tmpl';

    var $launcher = findLauncher();
    if ($launcher) {
        $('#knot-gallery').cambioFullscreenGallery(optsWithNext, $launcher);
    }
    $launcher = $('#post-gallery a');
    if ($launcher.length) {
        galleryId = $launcher.parent('#post-gallery').data('gallery-id');
        opts = {};
        $.extend(opts, options);
        if (galleryId) {
            opts.galleryId = galleryId;
            opts.knot.galleryId = galleryId;
        }
        $('#knot-preview-gallery').cambioFullscreenGallery(opts, $launcher);
    }
    var $fsLauncher = $('.slideshowLauncher');
    if ($fsLauncher.length) {
        var dataId = $fsLauncher.first().data('data-id');
        if (dataId) {
            galleryId = $fsLauncher.data('gallery-id');
            opts = {};
            $.extend(opts, optsWithNext);
            if (galleryId) {
                opts.galleryId = galleryId;
                opts.knot.galleryId = galleryId;
            }
            $('#knot-slideshow-overlay').cambioFullscreenGallery(opts, $fsLauncher, '#' + dataId);
        }
    }
};
    
    //***********************************************




/*global cambio:false*/
(function ($, FB) {
    "use strict";

    // a place to store galleries that are being used on the same page
    cambio.fullscreenGalleries = [];

    $(cambioLightbox).on('cambio.lightbox.afterOpen', function () {
        // new article is being loaded, go ahead and reset these
        cambio.fullscreenGalleries = [];
    });

    var nextLinkCheck = function ($slideshow, context, options) {
        if (!options.nextGallery) {
            return;
        }
        if (context.activeSlide + 1 === context.slideCount) {
            if ($slideshow.find('.gallery-continue').length) {
                return;
            }
            var $rightArrow = $slideshow.find('.icon-angle-right');
            $rightArrow.parents('.aol-knot-slide-container,.aol-knot-fullscreen-slider').prepend([
                '<div class="gallery-continue" style="display:none;position:absolute;top:36%;right:4px;z-index:99999999">',
                '<div style="dislay:table-row">',
                '<div class="continue-left" style="display:table-cell;width:34px;height:73px;background: url(http://o.aolcdn.com/os/cambio/cambio3/images/garrow-left.png) no-repeat;"><div style="width:34px"></div></div>',
                '<a style="display:table-cell;height:73px;background: url(http://o.aolcdn.com/os/cambio/cambio3/images/garrow-bg.png) repeat;color:#333;font-size:1.2em;white-space:nowrap;line-height:70px;" href="',
                options.nextGallery,
                '">',
                options.nextGalleryCopy,
                '</a>',
                '<div class="continue-right" style="width:43px;height:73px;display:block;background: url(http://o.aolcdn.com/os/cambio/cambio3/images/garrow-right.png) no-repeat;display:table-cell"><div style="width:43px"></div></div>',
                '</div>',
                '<div class="icon-close" style="position:absolute;left:-5px;top:0;width:30px;height:33px;"></div>',
                '</div>'
            ].join(''));
            var $next = $slideshow.find('.gallery-continue');
            var width = $next.width();
            $next.width(0);
            $next.show();
            $next.animate({width: width + 'px'});
            $rightArrow.fadeOut();
            var $close = $next.find('.icon-close').on('click', function (evt) {
                evt.preventDefault();
                $next.animate({width: 0}, function () {
                    $next.hide();
                    $rightArrow.fadeIn();
                });
            });
        }
    };

    //***********************************************


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
                    path: 'a.photo-src[data-photo-src]'
                },
                caption: {
                    path: '.photo-text[html]'
                },
                'tweet_link': {
                    path: 'a.photo-src[data-tweet-link]'
                },
                type: {
                    path: '[data-type]'
                },
                player: {
                    path: 'a[data-embed]'
                }
            },
            noDims: true,
            refreshDivId: $('#ajaxAdDevil').length ? 'ajaxAdDevil' : 'adsDiv1',
            refreshCount: 1,
            after: '<div class="aol-knot-counter"></div>',
            onUiBuilt: (function (options) {
                return function (context) {
                    setCounter(context.context);
                    nextLinkCheck($embeddedKnot, context.context, options);
                    $embeddedKnot.on('slideChange', function (evt) {
                        setCounter(context.context);            
                        nextLinkCheck($embeddedKnot, context.context, options);
                    });
                };
            } (options))
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
                    path: 'a.photo-src[data-photo-src]'
                },
                caption: {
                    path: '.photo-text[html]'
                },
                'tweet_link': {
                    path: 'a.photo-src[data-tweet-link]'
                },
                type: {
                    path: '[data-type]'
                },
                player: {
                    path: 'a[data-embed]'
                },
                rightRailHtml: [
                    '<div class="aol-knot-fullscreen-exit">',
                    '</div>',
                    '<div class="aol-knot-fullscreen-right-share">',
                    '</div>'
                ].join('')
            },
            noDims: true,
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

        $fullScreenKnot.on('knotFullscreenUiBuilt', function () {
            cambio.fullscreenGalleries.push($fullScreenKnot);
        });

        // initialize knot
        var _settings = {"data": dataUrl};
        $.extend(_settings, settings);
        $fullScreenKnot.knot(_settings);

        $launchers.on('click', function (evt) {
            evt.preventDefault();
            var $this = $(this);
            var $knot = $fullScreenKnot.data('knot');
            var activeSlide = $this.data('active-slide') ? Number($this.data('active-slide')) : 0;
            if ($knot.isFullscreen) {
                $fullScreenKnot.knotFullscreen('showSlide', activeSlide + 1, 'left', function () {
                    // this will trigger the ad refresh
                    $fullScreenKnot.trigger('slideChange', [activeSlide + 1, 'left']);
                });
            } else {
                $knot.activeSlide = activeSlide;
                $fullScreenKnot.knotFullscreen('enterFullscreen');
            }
        });

        // add the sharing stuff only when we actually enter fullscreen
        // mode the first time
        $fullScreenKnot.on('enteredFullscreen', function (event) {
            $.each(cambio.fullscreenGalleries, function (index, value) {
                if (value[0] !== $fullScreenKnot[0]) {
                    if (value.data('knot').isFullscreen) {
                        value.knotFullscreen('exitFullscreen');
                    }
                }
            });
            cambio.moveShareBarToGallery(1);
            cambio.changePintrestButton($('#' + event.target.id).data().knot);
            var $scrollParent = getScrollParent();
            var top = $scrollParent[0].scrollTop;
            settings.lastScrollTop = $scrollParent[0].scrollTop;
            $scrollParent.animate({scrollTop: $fullScreenKnot.position().top}, 'slow');  
            $fullScreenKnot.data('knot')._track();
            var context = $fullScreenKnot.data('knotFullscreen').context;
            nextLinkCheck($fullScreenKnot, context, options);
        });

        $fullScreenKnot.on('exitedFullscreen', function () {
            var top = settings.lastScrollTop;
            settings.lastScrollTop = 0;
            // only do the scroll-back if the user was actually low enough
            // on the screen, no need to do this if they are already near
            // the top
            if (top > 340) {
                setTimeout(function () {
                    getScrollParent().animate({scrollTop: top}, 'slow');          
                }, 500);
            }
            //Put share bar back to article
            cambio.moveShareBarToGallery(0);
        });
        
        $fullScreenKnot.on('slideChange', function (event, index, dir) {
            window.setTimeout(function () { cambio.changePintrestButton($('#' + event.target.id).data().knot); }, 500);
            var context = $fullScreenKnot.data('knotFullscreen').context;
            nextLinkCheck($fullScreenKnot, context, options);
        });
        
//        $fullScreenKnot.on('transitionComplete', function (a, index) {
//            window.alert('transition complete' + index);    
//            console.log(index);
//        });

        function getScrollParent() {
            if (settings.scrollParent) {
                console.log('From settings' + $(settings.scrollParent).get(0));
                return settings.scrollParent;
            }
            if (typeof(cambio) !== 'undefined' && cambio.wallpaperAd === 1) {
                settings.scrollParent = $('html, body');
            } else {
                settings.scrollParent = $('#lbCnt');
            }
            return settings.scrollParent;
            
        }
        return $fullScreenKnot;
    };

})(jQuery, window.FB);
