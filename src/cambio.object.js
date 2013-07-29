// IE9 fix
if (!window.console) {
    var console = {
        log : function () {
        },
        warn : function () {
        },
        error : function () {
        },
        time : function () {
        },
        info : function () {  
        },
        timeEnd : function () {
        }
    };
}

//Function to fix scroll in mobile devices
function touchScroll(selector) {
    if (typeof (isTouchDevice) === 'function' && isTouchDevice()) {
        var scrollStartPosY = 0;
        var scrollStartPosX = 0;
        $('body').delegate(selector, 'touchstart', function (e) {
            scrollStartPosY = this.scrollTop + e.originalEvent.touches[0].pageY;
            scrollStartPosX = this.scrollLeft + e.originalEvent.touches[0].pageX;
        });
        $('body').delegate(selector, 'touchmove', function (e) {
            if ((this.scrollTop < this.scrollHeight - this.offsetHeight && this.scrollTop + e.originalEvent.touches[0].pageY < scrollStartPosY - 5) || (this.scrollTop !== 0 && this.scrollTop + e.originalEvent.touches[0].pageY > scrollStartPosY + 5)) {
                e.preventDefault();
            }
            if ((this.scrollLeft < this.scrollWidth - this.offsetWidth && this.scrollLeft + e.originalEvent.touches[0].pageX < scrollStartPosX - 5) || (this.scrollLeft !== 0 && this.scrollLeft + e.originalEvent.touches[0].pageX > scrollStartPosX + 5)) {
                e.preventDefault();
            }
            this.scrollTop = scrollStartPosY - e.originalEvent.touches[0].pageY;
            this.scrollLeft = scrollStartPosX - e.originalEvent.touches[0].pageX;
        });
    }
}

//Functions to hide show description box for video players
function play5min(elem) {
    $('#' + elem.flashObjectId).parents('.boxContent').children().find('.text, .textBackground').slideUp();
}

function pause5min(elem) {
    $('#' + elem.flashObjectId).parents('.boxContent').children().find('.text, .textBackground').slideDown();
}

var gridVideoPlayer = null;
function set5min(elem) {
    gridVideoPlayer = elem.player;
}

var cambio = {
    wallpaperAd : window.wallpaperAd,
    overlayLoad : 0,
    tagAdCounter : 0,

    //Inits menu
    menuInit : function () {
        //TV on hover
        $('#tvNavItem').hover(function () {
            $('#subNavTv').fadeIn(100);
        }, function () {
            $('#subNavTv').fadeOut(100);
        });
        //Spotlight on hover
        $('#spotlightNavItem').hover(function () {
            $('#subNavSpotlight').fadeIn(100);
        }, function () {
            $('#subNavSpotlight').fadeOut(100);
        });

        //Footer more/less
        $('.footer .footerSwitchButton').click(function () {
            if ($(this).hasClass('open')) {
                $(this).find('.more_text').html('More');
                $(this).removeClass('open');
                $('.footer .footerMore').slideUp();
            } else {
                $(this).addClass('open');
                $(this).find('.more_text').html('Less');
                $('.footer .footerMore').slideDown();
            }
        });
    },

    init : function () {
        this.menuInit();
        //Set global variables for overlay load
        //var cambioOverlayLoad=0;
        //Check if we can replace url in browser bar
        if (typeof (window.history.pushState) === 'function') {
            this.overlayLoad = 1;
        }
        //If wallpaper ad is set don't load in overlay
        if (this.wallpaperAd === 1) {
            this.overlayLoad = 0;
        }
        this.fixTagPageAd();
    },
    
    //Fixes size of rr ad for trag pages (photo and celebs) 
    fixTagPageAd : function () {
        if ($('.tag.ad').length) {
            if (this.tagAdCounter < 10) {
                var ad = $('.tag.ad').first();
                var marginTop = parseInt($('.tag:first').css('marginTop'), 10);
                var singleH = $('.tag:first').height() + marginTop;
                var adH = $(ad).height() + marginTop;
                var num = Math.ceil(adH / singleH);
                if (num > 1) {
                    $(ad).height(num * singleH - marginTop);
                }
                this.tagAdCounter++;
                var that = this;
                window.setTimeout(function () {
                    that.fixTagPageAd();
                }, 500);
            }
        }
    },
    
    //Changes pintrest share button for galleries 
    changePintrestButton : function (knotObj) {
        if (knotObj.entries[knotObj.activeSlide].type === 'photo' || knotObj.entries[knotObj.activeSlide].type === 'image') {
            var url = encodeURIComponent(window.location.href);
            var desc = $(knotObj.entries[knotObj.activeSlide].caption).text();
            var image = knotObj.entries[knotObj.activeSlide].photo_src;
            image = encodeURIComponent(image);
            desc = encodeURIComponent(desc);
            $('.socialshare li.galleryPinButton').remove();
            $('.socialshare li.articlePinButton').remove();
            $('.socialshare').prepend('<li class="galleryPinButton pinit"><a data-pin-config="above" href="//pinterest.com/pin/create/button/?url=' + url + '&media=' + image + '&description=' + desc + '" data-pin-do="buttonPin"><img src="//assets.pinterest.com/images/pidgets/pin_it_button.png" /></a></li>');      
            $.getScript(('https:' === document.location.protocol ? 'https:' : 'http:') + '//assets.pinterest.com/js/pinit.js');    
        }
    },
    
    //moves article share bar to gallery container
    moveShareBarToGallery : function (where) {
        if ($('.aol-knot-fullscreen-right-share').length) {
            if (where === 1) {
                //Move from article to gallery
                $('.aol-knot-fullscreen-right-share').html($('.articleShareBarContainer').html());   
                $('.articleShareBarContainer').empty();
                $('.redditButton').hide();
            } else {
                //Move from gallery to article
                $('.articleShareBarContainer').html($('.aol-knot-fullscreen-right-share').html());
                $('.aol-knot-fullscreen-right-share').empty();
                //Switch pin button back to article image if set
                $('.socialshare li.galleryPinButton').remove();
                if (typeof(window.pintrest_image) !== 'undefined') {  
                    $('.socialshare li.articlePinButton').remove();
                    $('.socialshare').prepend('<li class="articlePinButton pinit"><a data-pin-config="above" href="//pinterest.com/pin/create/button/?url=' + window.pintrest_url + '&media=' + window.pintrest_image + '&description=' + window.pintrest_title + '" data-pin-do="buttonPin"><img src="//assets.pinterest.com/images/pidgets/pin_it_button.png" /></a></li>');      
                    $.getScript(('https:' === document.location.protocol ? 'https:' : 'http:') + '//assets.pinterest.com/js/pinit.js');      
                }
                $('.redditButton').show();
            }
        }
    },
    
    //Shre bar render code
    renderShareBar : function () {
        var that = this;
        //Facebook
        if (typeof(FB) !== 'undefined') {
            FB.XFBML.parse($('#lbBody')[0]);

        } else {
            $.getScript("http://connect.facebook.net/en_US/all.js#xfbml=1", function () {
                FB.XFBML.parse($('#lbBody')[0]);
            });
        }
        //Twitter
        if (typeof(twttr) !== 'undefined') {
            twttr.widgets.load();
            console.log('Parsing twitter');
        } else {
            $.getScript('http://platform.twitter.com/widgets.js');
            console.log('Parsing twitter after load js');
        }
        //Google
        var gObj = {
            "annotation" : "bubble",
            "size" : "tall",
            "href" : that.blogUrl + that.currentUrl
        };
        if (typeof(gapi) !== 'undefined') {
            console.log('Parsing google');
            $('.gPlusShare').each(function () {
                gapi.plusone.render($(this).get(0), gObj);
            });
        } else {
            window.___gcfg = {
                lang : 'en-US',
                parsetags : 'explicit'
            };
            $.getScript('https://apis.google.com/js/plusone.js', function () {
                $('.gPlusShare').each(function () {
                    gapi.plusone.render($(this).get(0), gObj);
                });
            });

        }
        //Stumble
        if (typeof(STMBLPN) !== 'undefined') {
            STMBLPN.processWidgets();
        } else {
            $.getScript(('https:' === document.location.protocol ? 'https:' : 'http:') + '//platform.stumbleupon.com/1/widgets.js');
        }
        //Pintrest TODO   
        $.getScript(('https:' === document.location.protocol ? 'https:' : 'http:') + '//assets.pinterest.com/js/pinit.js');
        
        //Redit
        var redditUrl = '';
        if (document.location.protocol === 'https:') {
            redditUrl = 'https://redditstatic.s3.amazonaws.com';
        } else {
            redditUrl = 'http://www.reddit.com/static';
        }
        var originalWriteFunction = document.write;
        document.write = function (str) {
            $('.redditButton').html(str);
        };
        $.getScript(('https:' === document.location.protocol ? 'https:' : 'http:') + '//www.reddit.com/static/button/button2.js', function () {
            document.write = originalWriteFunction;
        });
    },
    
    //Fixes related tags (hides one that not fit to one line)
    fixRelatedTags : function () {
        if ($('div.relatedTags a').length) {
            var i = 0;
            var limit = $('div.relatedTags a').length;
            var topTag = $('div.relatedTags a:first');
            if ($(topTag).position().top !== $('div.relatedTags a:last').position().top) {
                //Add more button
                $('div.relatedTags a').last().after('<span class="relatedTagMoreButton">more...</span>');
                for (i = 0; i < limit; i++) {
                    if ($(topTag).position().top !== $('div.relatedTags .relatedTagMoreButton').position().top) {
                        $('div.relatedTags a:visible').last().addClass('relatedTagMore').hide();
                    } else {
                        break;
                    }
                }
                //Add click event to more button
                $('.relatedTagMoreButton').click(function () {
                    if ($('.relatedTagMore').last().css('display') === 'none') {
                        $('.relatedTagMore').slideDown();
                        $(this).hide();
                    }
                });
            }
        }
    }
    

};

/**
 * events:
 *   cambio.lightbox.afterArticleLoad
 *   cambio.lightbox.afterOpen
 *   cambio.lightbox.beforeClose
 */
var cambioLightbox = {
    blogUrl : 'http://' + document.domain,
    baseTitle : 'Cambio',
    baseUrl : this.blogUrl,
    omniPref : 'cam',
    parentPageUrl : window.location.href, //Will reset last url to that value on lightbox close, when cat page loaded in background it will be set to cat page url on close
    lastUrl : this.window.location.href, //will be use as a refferal page in omniture request
    pageTitle : document.title,
    omniMain : function () {
    }, //this will be populated with omniture code that sets all properties for particular main page (home,category page omni call)
    pushCounter : 0,
    pictelaCounter : 0,
    //Opens lightbox
    openLightbox : function () {
        $('#lbBackground').fadeIn('fast', function () {
            $('#lbCnt').fadeIn('fast');
        });
        $('body').css('overflow', 'hidden');
        $(this).trigger('cambio.lightbox.afterOpen');
    },

    //Sends omniture request to count page view
    sendOmnitureRequest : function () {
        if (window.s_265) {
            window.s_265.t();
        }
        if (window.bN_cfg && window.bN) {
            //window.bN.view();
            bN.init(bN_cfg);
        }
    },

    //Sets/adjust style of lightbox (make sure it's not covered by fixed menus)
    makeUpLightbox : function () {
        if (cambio.wallpaperAd === 0) {
            var topMarg = $('.header').height() + 'px';
            $('#lbBody').css('marginTop', topMarg);
            //Set min height for lightbox background (when there is no content in body - for permalink direct visit)
            $('#lbBackground').css('minHeight', $(window).height() + 'px');
            //Set margin for main content
            this.setMainMargin();
        }
    },

    //Closes lightbox
    closeLightbox : function () {
        $(this).trigger('cambio.lightbox.beforeClose');
        $('#lbCnt').fadeOut('fast', function () {
            $('#lbContent').html('');
            $('#lbBackground').fadeOut('fast');
        });
        $('body').css('overflow', 'auto');
        //Remove gallery class from html and body elements to enable scroll
        $('body, html').removeClass('knot-fullscreen');
        document.title = this.baseTitle;
        window.history.pushState(2, document.title, this.baseUrl);
        //Back to main page omni setup
        this.omniMain();
    },

    //Function to place 5 min script after content has been loaded and animation ended
    replace5minScripts : function () {
        if (this.scriptReplaced === 0 && this.loadedData === 1 && this.animationEnd === 1) {
            var i = 0;
            for (i = 0; i < this.scriptArray.length; i++) {
                var newScript = document.createElement('script');
                newScript.type = 'text/javascript';
                if (this.scriptArray[i].type === 'src') {
                    newScript.src = this.scriptArray[i].script;
                } else {
                    newScript.innerHTML = this.scriptArray[i].script;
                }
                this.scriptArray[i].parent.appendChild(newScript);
            }
        }
    },

    parseOmniScript : function (s) {
        var tmp = s.split('var s_account');
        //s=data.replace('function runOmni() {','runOmni=function (){alert(1);s_265.prop14="'+that.lastUrl+'";');
        var n = tmp[0].replace('var bN_cfg = {', 'window.bN_cfg = {').replace('function runOmni() {', 's_265.url="' + this.blogUrl + this.currentUrl + '"; s_265.prop14="' + this.lastUrl + '";').replace('s_265.t();', '');
        var last = n.lastIndexOf('}');
        return n.substr(0, last);

    },

    //Sets omniture code for twitter and  static box
    setOmniCodeForOther : function () {
        if (window.s_265) {
            //window.s_265.prop1=this.omniPref+' : '+this.type;
            //window.s_265.prop2=this.omniPref+' : '+this.id;
            window.s_265.prop1 = this.omniPref + ' : quick_read';
            //if(this.type==='twitter')
            window.s_265.prop2 = this.omniPref + ' : ' + this.type;
            window.s_265.prop14 = this.baseUrl;
            window.s_265.url = this.baseurl + '?' + this.type + '=' + this.id;
            window.s_265.pageName = this.omniPref + ' : ' + this.pageTitle + ' - ' + this.type;
        }
        if (window.bN_cfg) {
            window.bN_cfg.p.dL_dpt = 'article';
            window.bN_cfg.p.dL_sDpt = 'information';
            window.bN_cfg.p.dL_cms_ID = 'bsd:0';
        }
    },

    //Makes ajax request and includes result into particular HTML element
    makeAjaxRequest : function (url) {
        //console.log('Ajax request'+url);
        this.animationEnd = 0;
        this.scriptReplaced = 0;
        this.scriptArray = [];
        this.loadedData = 0;
        var that = this;
        var loadHTML = '<div class="loadingMsg"><img src="http://o.aolcdn.com/os/cambio/cambio3/images/loading1" /><br />Loading data</div>';

        switch (this.nextPrev) {
        case 'prev':
            $('#lbContent .permalink-ad, #lbContent .side-ad, #lbContent .ad88x31').remove();
            $('#lbCnt').css('overflow', 'visible');
            $('#lbCnt').hide("slide", {
                direction : "left"
            }, 600, function () {
                if (that.loadedData === 0) {
                    $('#lbContent').html(loadHTML);
                }
                $('#lbCnt').show("slide", {
                    direction : "right"
                }, 600, function () {
                    $('#lbCnt').css('overflow', 'auto');
                    that.animationEnd = 1;
                    that.replace5minScripts();
                    that.fixTwitterWidget();
                });
            });

            break;
        case 'next':
            $('#lbContent .permalink-ad, #lbContent .side-ad, #lbContent .ad88x31').remove();
            $('#lbCnt').css('overflow', 'visible');
            $('#lbCnt').hide("slide", {
                direction : "right"
            }, 600, function () {
                if (that.loadedData === 0) {
                    $('#lbContent').html(loadHTML);
                }
                $('#lbCnt').show("slide", {
                    direction : "left"
                }, 600, function () {
                    $('#lbCnt').css('overflow', 'auto');
                    that.animationEnd = 1;
                    that.replace5minScripts();
                    that.fixTwitterWidget();
                });
            });
            break;
        case '':
            $('#lbCnt').animate({
                scrollTop : 0
            }, 200);
            $('#lbCnt').fadeOut(400, function () {

                $('#lbCnt').fadeIn(400, function () {
                    if (that.loadedData === 0) {
                        $('#lbContent').html(loadHTML);
                    }
                    that.animationEnd = 1;
                    that.replace5minScripts();
                    that.fixTwitterWidget();
                });

            });
            break;
        }
        that.requestedUrl = that.blogUrl + url;
        $.ajax({
            url : that.requestedUrl,
            dataType : 'html',
            cache : 'false',
            method : 'post',
            async : 'true',
            success : function (data) {
                //Set flag telling that data is loaded
                that.loadedData = 1;
                that.pushCounter = 0;
                that.pictelaCounter = 0;
                var i = 0;

                //Need to replace scripts and add it when content is ready othervise videoplayer doesn't work
                var tmpDiv = document.createElement('div');
                tmpDiv.innerHTML = data;

                if (that.type === 'article' || that.type === 'info') {
                    //console.log('Found scripts in ajax:'+$(tmpDiv).find('.afterAjax').length);
                    var srcType = '';
                    var src = '';
                    $(tmpDiv).find('.afterAjax').each(function () {
                        //console.log('Script '+$(this).attr('src'));
                        if ($(this).attr('src') === undefined) {
                            srcType = 'inline';
                            src = $(this).html();
                        } else {
                            srcType = 'src';
                            src = $(this).attr('src');
                        }
                        that.scriptArray.push({
                            script : src,
                            parent : $(this).parent().get(0),
                            type : srcType
                        });
                        $(this).remove();
                    });
                    //Omniture request
                    var omniScript = $(tmpDiv).find('script:last').html();
                    $(tmpDiv).find('script:last').html(that.parseOmniScript(omniScript));
                    that.lastUrl = that.baseUrl + that.currentUrl;
                }
                //Add data to lightbox container
                //console.log($(tmpDiv).html());
                $('#lbContent').html('');
                $('#lbContent').append(tmpDiv);
                //For info and article pages set url and title
                if (that.type === 'twitter' || that.type === 'static') {
                    that.pageTitle = $('#lbContent').find('.lbLeft h2:first').html();
                    that.setOmniCodeForOther();
                }
                if (that.type === 'article' || that.type === 'info') {
                    that.pageTitle = $('#lbContent').find('.lbTop h1:first').html();
                }
                document.title = 'Cambio - ' + that.pageTitle;
                window.history.pushState(2, document.title, that.currentUrl);
                //console.log('replacing link '+that.currentUrl);

                //5 min palyer script replace
                if (that.animationEnd === 1) {
                    that.replace5minScripts();
                }
                //Set class for particular content
                $('#lbContent').attr('class', that.type);
                $('#lbBody').attr('class', that.type);

                //Prop 12 to requested url
                if (window.s_265) {
                    s_265.prop12 = that.requestedUrl;
                    s_265.mmxcustom = that.requestedUrl;
                }
                //Run omniture request
                that.sendOmnitureRequest();
                //Run share bar parse
                if (typeof(cambio) !== 'undefined') {
                    cambio.renderShareBar();
                }
                
                that.fixTwitterWidget();
                
                //Fix top related tags (add more button)
                cambio.fixRelatedTags();

                //****************************************************
                //AFTER ARTICLE GETS LOADED FOR SCOTT'S CODE
                if (that.type === 'article') {
                    if ($('#knot').length) {
                        that.slideFix = 0;
                        that.fixSlideshowImageSize();
                        //change pintrest code for gallery page
                        window.setTimeout(function () {cambio.changePintrestButton($('#knot').data('knot')); }, 500);
                        $('#knot').bind('slideChange', function (event, index) {
                            window.setTimeout(function () {cambio.changePintrestButton($('#knot').data('knot')); }, 500);
                        });
                    }
                }
                //****************************************************
                $(that).trigger('cambio.lightbox.articleLoaded');

                //Set next/prev links
                that.setNextPrevLink();
                //Check/adjust style of lightbox
                that.makeUpLightbox();
                //Check for push down ad
                that.checkAndMovePushDown();
                //Fix for pixela ad
                that.checkAndMovePictelaAd();
            },
            error : function (e, text, error) {
                console.log('Lightbox content load error: ' + e + ',' + text + ',' + error);
                console.log(e.responseText);
                //alert('Lightbox content load error: '+e+','+text+','+error);
                that.closeLightbox();
            }
        });
    },

    //fixes tweet widget embeded in post body
    fixTwitterWidget : function () {
        if ($('blockquote.twitter-tweet').length) {
            $('blockquote.twitter-tweet').removeAttr('data-twttr-rendered'); 
            if (typeof(twttr) !== 'undefined') {
                twttr.widgets.load();
            }
        }
    },

    //fixes size of images in slideshow
    fixSlideshowImageSize : function () {
        this.slideFix++;
        if (this.slideFix < 10) {
            if ($('#knot').length && $('#knot .aol-knot-slide').length) {
                $('#knot .aol-knot-slide').css('width', $('#knot').width()).css('height', $('#knot').height());
                $('#knot .aol-knot-slides').css('width', $('#knot').width() * $('#knot .aol-knot-slide').length);
            } else {
                var that = this;
                window.setTimeout(function () {
                    that.fixSlideshowImageSize();
                }, 500);
            }
        }
    },

    //Sets next previous links (go throught particular list of articles and find particular links)
    setNextPrevLink : function () {
        if (this.nextPrevListClass === '') {
            return false;
        }
        var prevLink = '';
        var nextLink = '';
        var prevTitle = '';
        var nextTitle = '';
        var nextId = '';
        var prevId = '';
        var found = 0;
        var that = this;
        $('.' + this.nextPrevListClass + ' a.boxLink:not(.boxTwitter, .boxStatic)').each(function () {
            //console.log($(this).attr('href'));
            if (found !== 2) {
                if ($(this).attr('href').replace('http://www.cambio.com', '').replace(that.blogUrl, '') === that.currentUrl) {
                    found = 1;
                } else {
                    if (found === 0) {
                        nextLink = $(this).attr('href');
                        nextTitle = $(this).attr('title');
                        nextId = $(this).attr('id') + 'n';
                    }
                    if (found === 1) {
                        prevLink = $(this).attr('href');
                        prevTitle = $(this).attr('title');
                        prevId = $(this).attr('id') + 'p';
                        found = 2;
                    }
                }
            }
        });
        if (found !== 0) {
            if (prevLink !== '') {
                $('.articlePrev').attr('href', prevLink);
                $('.articlePrev').attr('id', prevId);
                $('.articlePrev').html('');
                $('.articlePrev').attr('title', prevTitle);
                $('.articlePrev').addClass('nextPrevParentClass_' + this.nextPrevListClass);
                $('.articlePrev').show();
            } else {
                $('.articlePrev').hide();
            }
            if (nextLink !== '') {
                $('.articleNext').attr('href', nextLink);
                $('.articleNext').attr('id', nextId);
                $('.articleNext').html('');
                $('.articleNext').attr('title', nextTitle);
                $('.articleNext').addClass('nextPrevParentClass_' + this.nextPrevListClass);
                $('.articleNext').show();
            } else {
                $('.articleNext').hide();
            }
        }
    },

    //Resets box links (resets default permalink and fires js function that pulls data and displays in lightbox)
    resetBoxLink : function (elem) {
        //Stop playing video
        if (gridVideoPlayer !== null) {
            gridVideoPlayer.pause();
        }
        //Check if it is article prev/next link
        this.elem = elem;
        //Check link type (if next or previous slide animation will be applied)
        this.nextPrev = '';
        if ($(this.elem).hasClass('articleNext')) {
            this.nextPrev = 'next';
        }
        if ($(this.elem).hasClass('articlePrev')) {
            this.nextPrev = 'prev';
        }
        //Get URL of article that should be loaded
        this.currentUrl = $(this.elem).attr('href').replace(this.blogUrl, '').replace('http://www.cambio.com', '');
        //Ger parent class oif list post through which next prev button should be taken
        var c = $(this.elem).attr('class');
        var tmpc = c.split(' ');
        this.nextPrevListClass = '';
        for (var i = 0; i < tmpc.length; i++) {
            if (tmpc[i].indexOf('nextPrevParentClass_') === 0) {
                this.nextPrevListClass = tmpc[i].replace('nextPrevParentClass_', '');
            }
        }
        //Get type of content to load
        var elemId = $(this.elem).attr('id');
        var tmp = elemId.split('_');
        this.type = tmp[1];
        this.id = tmp[2];
        this.openLightbox();
        var html = '<div class="lbContent">Display ' + this.type + ' for ' + this.id + ' in AJAX<br />';
        switch (this.type) {
        case 'tag':
            break;
        case 'twitter':
            //ajax call
            this.makeAjaxRequest('/twitter/' + this.id + '/');
            break;
        case 'static':
            var relatedTag = tmp[3];
            this.makeAjaxRequest('/staticoverlay/' + this.id + '/' + relatedTag + '/');
            break;
        case 'info':
        case 'article':
            //Prepare url to request article data
            tmp = this.currentUrl.split('/');
            var l = tmp.length;
            var slug = tmp.pop();
            if (slug === '') {
                slug = tmp.pop();
            }
            var day = tmp.pop();
            var month = tmp.pop();
            var year = tmp.pop();

            var date = year + '/' + month + '/' + day;
            var reGoodDate = /^[0-9]{4}[/][0-9]{2}[/][0-9]{2}$/;
            if (reGoodDate.test(date) === false) {
                //alert('An old permalink format - dont run ajax call just display page: '+this.currentUrl);
                window.location.href = this.currentUrl;
                return false;
            }
            if (this.type === 'article') {
                this.makeAjaxRequest('/ajax/' + date + '/' + slug + '/');
            } else {
                this.makeAjaxRequest('/ajaxinfo/' + date + '/' + slug + '/');
            }
            //this.makeAjaxRequest('/articleoverlay/'+date+'/'+slug+'/?treatViewAs=permalink');
            break;
            //case 'info':
            //    this.makeAjaxRequest('/infooverlay/'+this.id+'/');
            //break;
        }
    },

    //For direct loaded permalinks loads category page in backgrouns + sets call to display ads/omniture code on lightbox close
    checkAndGetCategoryPage : function () {
        console.log('Checking if permalink loaded');
        //Check if article on the page
        if ($('.hiddenCatCnt').length > 0) {
            var cat = $('.hiddenCatCnt:last .catSlug').html();
            var catReal = '';
            //For news slug is different
            if (cat === 'latest-news') {
                catReal = 'news';
            } else {
                catReal = cat;
            }
            var catName = $('.hiddenCatCnt:last .catName').html();
            //Render share bar
            cambio.renderShareBar();
            //Only if overlay load (AJAX load is set)
            if (typeof (cambio) !== 'undefined' && cambio.overlayLoad === 1) {
                console.log('Run script that will load category ( ' + cat + ' )page in background');
                this.requestedUrl = this.blogUrl + '/ajax/category/' + cat + '/';
                var that = this;
                $.ajax({
                    url : that.requestedUrl,
                    dataType : 'html',
                    cache : false,
                    method : 'post',
                    success : function (data) {
                        //Get script responsible for ads (it will be run on lightbox close)
                        console.log('CATEGORY CODE INSERTING');
                        var tmpDiv = document.createElement('div');
                        tmpDiv.innerHTML = data;
                        that.catAdTop = $(tmpDiv).find('#ajaxAd728x90Cat script').html();
                        $(tmpDiv).find('#ajaxAd728x90Cat script').remove();
                        that.catAdSide = $(tmpDiv).find('#side_adAjaxCat script').html();
                        $(tmpDiv).find('#side_adAjaxCat script').remove();

                        if ($(tmpDiv).find('script:last').length) {
                            //Get script and remove request send
                            var omniCode = that.parseOmniScript($(tmpDiv).find('script:last').html());
                            $(tmpDiv).find('script:last').remove();
                            that.omniMain = new Function('console.log("Back to main omni setup;");delete s_265.prop18;delete s_265.prop19;' + omniCode);
                        }

                        $('#main').html($(tmpDiv).html());
                        $('#main .section-head h1').html(catName);
                        $('body').css('overflow', 'hidden');
                        that.setMainMargin();
                        that.baseUrl = that.blogUrl + '/' + catReal + '/';
                        that.baseTitle = 'Cambio ' + catName;
                        // On close run ads
                        $('#lbClose').click(function () {
                            //Set ad scripts saved before
                            if ($('#ajaxAd728x90Cat').length) {
                                var topScript = document.createElement('script');
                                topScript.type = 'text/javascript';
                                topScript.innerHTML = that.catAdTop;
                                $('#ajaxAd728x90Cat').get(0).appendChild(topScript);
                            }

                            if ($('#side_adAjaxCat').length) {
                                var sideScript = document.createElement('script');
                                sideScript.type = 'text/javascript';
                                sideScript.innerHTML = that.catAdSide;
                                $('#side_adAjaxCat').get(0).appendChild(sideScript);
                            }

                            that.omniMain();
                            //******COMMENTED BECAUSE WE CANNOT MAKE PAGE VIEW WHEN YOU CLOSING SOMETHING ... ***************
                            //Send omni request
                            //Prop 12 to requested url
                            //if(window.s_265){
                            //    s_265.prop12=that.requestedUrl;
                            //    s_265.mmxcustom=that.requestedUrl;
                            //}
                            //that.sendOmnitureRequest();
                            $('#lbClose').unbind('click');
                            $('#lbClose').click(function () {
                                that.closeLightbox();
                            });
                            //Fix side ad
                            if (typeof (cambio) !== 'undefined') {
                                cambio.fixTagPageAd();
                            }
                        });

                    },
                    error : function (jqXHR, text, error) {
                        console.log('Category page load error: ' + jqXHR + ',' + text + ',' + error);
                    }
                });
            } else {
                //If wallpaper ad is set adjust position of next/prev article
                if (cambio.wallpaperAd === 1) { 
                    $('.lbTopCnt').append($('.articleNext, .articlePrev'));
                    $('.lbTopCnt').css('position', 'relative');
                    $('.articleNext, .articlePrev').css('bottom', '0px').css('top', 'auto').css('left', 'auto').css('right', 'auto');
                    $('.articleNext').css('left', '0px');
                    $('.articlePrev').css('right', '0px'); 
                }
                $('.body:first').css('overflow', 'hidden');
                //Set exit button to go to home page or category
                $('#lbClose').unbind('click');
                $('#lbClose').click(function () {
                    window.location.href = '/' + catReal + '/';
                });
            }
        }
    },

    //Sets margin for grid element (some content might be covered by header and footer)
    setMainMargin : function () {
        if (cambio.wallpaperAd === 0) {
            $('#main').css('marginTop', $('.header').height() + 3);
            $('#main').css('marginBottom', $('.footer').height());
        }
    },

    checkAndMovePictelaAd : function () {
        if ($('.articleCnt').length) {
            if (this.pictelaCounter === 10) {
                return false;
            } else {
                var that = this;
                $('.lbRightCnt .side-ad div').each(function () {
                    if ($(this).attr('id') && $(this).attr('id').indexOf('ptelawatcher') === 0) {
                        var id = $(this).attr('id').replace('ptelawatcher', '');
                        if ($('#ptelaswfholder' + id).length > 0) {
                            $('.lbRightCnt .side-ad div:first').prepend($('#ptelaswfholder' + id));
                            $('#ptelaswfholder' + id).attr('style', 'position:relative');
                            $('#ptelawatcher' + id).css('display', 'none');
                            $(this).css('height', '0px');
                            $('.lbRightCnt .side-ad iframe').css('height', '0px');
                            return false;
                        }
                    }
                });
                that.pictelaCounter++;
                window.setTimeout(function () {
                    that.checkAndMovePictelaAd();
                }, 300);
            }
        }
    },

    checkAndMovePushDown : function () {
        if (cambio.wallpaperAd === 0 && $('.articleCnt').length) {
            if (this.pushCounter === 10) {
                return false;
            }
            if ($('#eyeDiv').length) {
                $('#eyeDiv').prependTo($('.lbTopCnt div:first'));
                return true;
            } else {
                var that = this;
                that.pushCounter++;  
                window.setTimeout(function () {
                    that.checkAndMovePushDown();
                }, 300);
            }
        }
    },

    //Init lightbox and links that should be displyed in lightbox function
    init : function () {
        
        //Save base url of the page
        this.baseUrl = window.location.href;
        var that = this;
        //Lightbox close button
        $('#lbClose').click(function () {
            that.closeLightbox();
        });

        this.checkAndMovePictelaAd();
        //On box click events
        
        $('body').on('click', '.boxLink', function (event) {
            if (typeof (cambio) !== 'undefined' && cambio.overlayLoad === 1 || ($(this).hasClass('boxTwitter') || $(this).hasClass('boxStatic'))) {  
                if (typeof(window.wallpaperArticles) === 'array' && window.wallpaperArticles.length > 0) {
                    window.alert('Do not replace link ' + $(this).attr('href'));
                    
                }
                event.preventDefault();
                that.resetBoxLink(this);
                if ($(this).hasClass('boxTwitter') || $(this).hasClass('boxStatic')) {
                    if (cambio.overlayLoad !== 1) {
                        $('#lbCnt').css('position', 'fixed');
                    }
                    if (cambio.wallpaperAd === 1) {
                        $('#lbCnt').css('top', '120px');
                    }
                }
            }
            
        });
        //Render share bar for tag page
        if ($('#tag-profile-footer-share').length) {
            cambio.renderShareBar();
        }

        touchScroll('#lbCnt');
        //On resize check if lightbox properly displayed
        that.makeUpLightbox();
        $(window).resize(function () {
            that.makeUpLightbox();
        });
        this.checkAndGetCategoryPage();
        this.setMainMargin();
        //Get omniture code for main page
        if (typeof (runOmni) === 'function') {
            var omniCode = runOmni.toString().replace('function runOmni() {', '').replace('s_265.t();', '').replace('}', '');
            this.comScore = window.bN_cfg;
            this.omniMain = new Function('delete s_265.prop18;delete s_265.prop19; window.bN_cfg=this.comScore; ' + omniCode);
        }
        //For direct load of info page add code that will redirect to home page on closing lightbox
        if ($('#lbContent .infoPage').length === 1) {
            $('#lbClose').unbind('click');
            $('#lbClose').click(function () {
                window.location.href = '/';
            });
        }
        
        //change pintrest code for gallery page
        if ($('#knot').length) {
            $('#knot').bind('knotReady', function (event, knotObj) {
                window.setTimeout(function () {cambio.changePintrestButton(knotObj); }, 500);
                $('#knot').bind('slideChange', function (event, index) {
                    window.setTimeout(function () {cambio.changePintrestButton($('#knot').data('knot')); }, 500);
                });
            });
        }
        //Fix top related tags (add more button)
        cambio.fixRelatedTags();
    }
};

//Main grid object and all functions related to grid and menu
var cambioGrid = {
    blogUrl : 'http://' + document.domain,
    //Flag that is set when whait for next load data (infinity scroll)
    loadingMore : 0,
    //Next page number for endless scroll
    nextLoadPage : 1,
    //Side ad interval counter
    sideAdCounter : 0,

    //Function that checks for height of side ad if it's more than 300 resizes it's container and rearange boxes
    checkResizeSideAd : function () {
        if (this.sideAdCounter === 10) {
            return false;
        }
        if ($('.gridSideAd .side-ad').height() > 320) {
            $('.gridSideAd').height($('.gridSideAd .side-ad').height());
            $('.boxContainer').masonry('reload');
            return true;
        } else {
            this.sideAdCounter++;
            var that = this;
            window.setTimeout(function () {
                that.checkResizeSideAd();
            }, 1000);
        }

    },

    //Run of page scroll check if reached bottom and load more content
    scrollCheck : function () {
        var scroll = $('html').scrollTop() + $('body').scrollTop();
        var h = $('body').height();
        var w = $(window).height();
        if (scroll + w >= h && this.loadingMore === 0) {
            this.loadingMore = 1;
            //console.log('Making request to get more post for infinite scroll - posts to exclude : '+this.articlesToSkip+'page to load :'+this.nextLoadPage)
            var that = this;
            //Display loading message
            $('.gridScrollShim').append('<div class="loadingMsg"><img src="http://o.aolcdn.com/os/cambio/cambio3/images/loading1" /><br />Loading data</div>');
            //Make ajax request to get more posts
            that.requestedUrl = this.blogUrl + '/scrollhomepage/' + this.articlesToSkip + '/' + this.nextLoadPage + '/';
            //console.log(that.requestedUrl);
            $.ajax({
                url : that.requestedUrl,
                dataType : 'html',
                cache : false,
                method : 'post',
                success : function (data) {
                    //console.log(data);
                    var $content = $(data);
                    $('.boxContainer').append($content).masonry('appended', $content, true);
                    that.loadingMore = 0;
                    that.nextLoadPage += 1;
                    $('.gridScrollShim .loadingMsg').remove();
                    //Set prop12 to request url
                    if (window.s_265) {
                        s_265.prop12 = that.requestedUrl;
                        s_265.mmxcustom = that.requestedUrl;
                    }
                    //makes omniture request
                    cambioLightbox.sendOmnitureRequest();
                },
                error : function (jqXHR, text, error) {
                    console.log('Grid load more error: ' + jqXHR + ',' + text + ',' + error);
                    console.log(jqXHR);
                    $('.loadingMsg').remove();
                }
            });
        }
    },

    //Gets articles from first load (they will be skiped when getting next post load)
    getArticlesId : function () {
        var tmp = [];
        var ids = [];
        $('.box .boxLink').each(function () {
            var id = $(this).attr('id');
            if (id.indexOf('box_article') === 0) {
                tmp = id.split('_');
                ids.push(tmp[2]);
            }
        });
        this.articlesToSkip = ids.join(',');
    },

    //Run on page resize (check width and change grid width if necesary)
    widthCheck : function () {
        var width = $(window).width();
        var lastGridWidth = this.gridWidth;
        if (this.gridWidth !== 1280 && width > 1240) {
            console.log('To 1280');
            this.resizeBoxes(1280);
        } else {
            if (this.gridWidth !== 980 && width < 1224 && width > 980) {
                console.log('To 980');
                this.resizeBoxes(980);
            } else if (this.gridWidth !== 768 && width < 980) {
                console.log('To 768');
                this.resizeBoxes(768);
            }
        }
    },

    //resizes boxes to fit particular grid width
    resizeBoxes : function (width) {
        var last = this.gridWidth;
        this.gridWidth = width;
        if (width === 1280 && cambio.wallpaperAd === 0) {
            $('body').removeClass('width768');
            $('body').removeClass('width980');
            this.columnWidth = 153;
            $('.boxContainer .box:first').width(4 * this.columnWidth);
            $('.boxContainer').masonry('option', {
                columnWidth : this.columnWidth
            });
            $('.boxContainer').masonry('reload');
            this.resizeVideos();
        }
        if (width === 980 || (width === 1200 && cambio.wallpaperAd === 1)) {
            this.columnWidth = 163;
            $('body').removeClass('width768');
            $('body').addClass('width980');
            $('.boxContainer .box:first').width(4 * this.columnWidth);
            $('.boxContainer').masonry('option', {
                columnWidth : this.columnWidth
            });
            $('.boxContainer').masonry('reload');
            //Resize video box
            this.resizeVideos();
        }
        if (width === 768) {
            $('body').removeClass('width980');
            $('body').addClass('width768');
            this.columnWidth = 153;
            $('.boxContainer .box:first').width(3 * this.columnWidth);
            $('.boxContainer').masonry('option', {
                columnWidth : this.columnWidth
            });
            $('.boxContainer').masonry('reload');
            this.resizeVideos();
        }
        //cambioLightbox.setMainMargin();
    },

    //Resizes video when grid width changes
    resizeVideos : function () {
        $('.box video, .box object').each(function () {
            var w = $(this).parents('.boxContent').width();
            var h = $(this).parents('.boxContent').height();
            $(this).css('width', w + 'px');
            $(this).css('height', h + 'px');
            $(this).parent().css('width', w + 'px');
            $(this).parent().css('height', h + 'px');
        });
    },

    //Init all what need to be init
    firstLoadInit : function (adMN) {
        var w = $(window).width();
        if (w >= 1240 && cambio.wallpaperAd === 0) {
            this.gridWidth = 1280;
            this.columnWidth = 153;
        } else {
            if (w >= 980 || (cambio.wallpaperAd === 1 && w >= 980)) {
                this.gridWidth = 980;
                this.columnWidth = 163;
                $('body').addClass('width980');
            } else {
                this.gridWidth = 768;
                this.columnWidth = 153;
                $('body').addClass('width768');
            }
        }
        this.adMN = adMN;
        this.getArticlesId();
        var that = this;
        //Masonry
        $('.boxContainer').masonry({
            // options
            itemSelector : '.box',
            columnWidth : that.columnWidth,
            isResizable : false,
            isAnimated : true,
            cornerStampSelector : '.gridSideAd',
            animationOptions : {
                duration : 400
            }
        });
        //cambioLightbox.setMainMargin();
        this.resizeBoxes(this.gridWidth);
        var timer = window.setTimeout(function () {
            that.resizeVideos();
        }, 1000);
        //window.onorientationchange=function (){that.orientationChange();};
        //$(window).resize(function (){that.orientationChange();});
        window.onorientationchange = function () {
            that.widthCheck();
        };
        $(window).resize(function () {
            that.widthCheck();
        });
        $(window).scroll(function () {
            that.scrollCheck();
        });
        this.fixTwitterBox();
        //Check side ad size and adjust ad container if necessary (for side ads higher than 250)
        this.checkResizeSideAd();
    },

    fixTwitterBox : function () {
        $('.twitterBody').each(function () {
            var h = $(this).height();
            var maxH = $(this).parent().height() - $(this).position().top;
            if (h > maxH && $(this).find('li').length === 2) {
                $(this).find('li:last').remove();
            }
        });
    }
};

var Wallpaper = {
    adCheck: function () {
        $("#VwP103199Div2 > div").each(function () {
            var $this = $(this);
            var top = parseInt($this.css('top'), 10);
            var width = $this.width();
            $this.css('top', top + 1);
            $this.css('width', width + 1);
        });
    }
};


//Before displaying page
$(function () {
    cambio.init();
    if ($('.boxContainer').length === 1) {
        cambioGrid.firstLoadInit(window.ad300x250);
    }
    cambioLightbox.init();
    if (window.wallpaperAd === 1) {
        setTimeout(Wallpaper.adCheck, 2000);
    }
});
