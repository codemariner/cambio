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

var cambio = {
    wallpaperAd : window.wallpaperAd,
    overlayLoad : 0,
    scrollCheck : function () {
        var w = $(window).width();
        if (w > 980) {
            $('body').addClass('wallpaperAd');
            $('html').addClass('wallpaperAd');
        } else {
            $('body').removeClass('wallpaperAd');
            $('html').removeClass('wallpaperAd');
        }
    },

    //Inits menu
    menuInit : function () {
        //TV on hover
        $('#tvNavItem').hover(function () {
            if (cambio.wallpaperAd === 1 && $(window).scrollTop() < 140) {
                $(window).scrollTop(140);
            }
            $('#subNavTv').fadeIn(100);
        }, function () {
            $('#subNavTv').fadeOut(100);
        });
        //Spotlight on hover
        $('#spotlightNavItem').hover(function () {
            if (cambio.wallpaperAd === 1 && $(window).scrollTop() < 140) {
                $(window).scrollTop(140);
            }
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
        if (this.wallpaperAd === 1) {
            this.scrollCheck();
            var that = this;
            $(window).resize(function () {
                that.scrollCheck();
            });
        }
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
    }
};

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
        var topMarg = $('.header').height() + 'px';

        $('#lbBody').css('marginTop', topMarg);

        //Set min height for lightbox background (when there is no content in body - for permalink direct visit)
        $('#lbBackground').css('minHeight', $(window).height() + 'px');
        //Set margin for main content
        this.setMainMargin();
    },

    //Closes lightbox
    closeLightbox : function () {
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

                //Prop 12 to requested url
                if (window.s_265) {
                    s_265.prop12 = that.requestedUrl;
                    s_265.mmxcustom = that.requestedUrl;
                }
                //Run omniture request
                that.sendOmnitureRequest();

                //Parse facebook
                if (typeof (FB) !== 'undefined') {
                    FB.XFBML.parse($('#lbBody')[0]);
                }
                //Parse twitter
                if (typeof (twttr) !== 'undefined') {
                    twttr.widgets.load();
                }
                that.fixTwitterWidget();

                //****************************************************
                //AFTER ARTICLE GETS LOADED FOR SCOTT'S CODE
                if (that.type === 'article') {
                    if ($('#knot').length) {
                        that.slideFix = 0;
                        that.fixSlideshowImageSize();
                    }
                }
                //****************************************************

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
                console.log('Setting gallery image size');
                $('#knot .aol-knot-slide').css('width', $('#knot').width()).css('height', $('#knot').height());
                $('#knot .aol-knot-slides').css('width', $('#knot').width() * $('#knot .aol-knot-slide').length);
            } else {
                console.log('Set timeout for gallery fix');
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
        console.log('Setting next/prev link ' + this.nextPrevListClass);
        var prevLink = '';
        var nextLink = '';
        var prevTitle = '';
        var nextTitle = '';
        var nextId = '';
        var prevId = '';
        var found = 0;
        var that = this;
        console.log('CurrentUrl ' + that.currentUrl);
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
            console.log('Next link ' + nextLink + ' Prev link ' + prevLink);
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
        } else {
            console.log('Not found - dont replace link');
        }
    },

    //Resets box links (resets default permalink and fires js function that pulls data and displays in lightbox)
    resetBoxLink : function (elem) {
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
        console.log('Classes ' + c);
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
        console.log('Loading data for ' + this.type);

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
            console.log('Ajax article link date:' + date);
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
                        });

                    },
                    error : function (jqXHR, text, error) {
                        console.log('Category page load error: ' + jqXHR + ',' + text + ',' + error);
                    }
                });
            } else {
                //If wallpaper ad is set adjust position of next/prev article
                if (cambio.wallpaperAd === 1) {
                    window.setTimeout(function () {
                        $('.articleNext, .articlePrev').css('top', $('.relatedTags').position().top + 'px');
                    }, 2000);
                }
                $('.body:first').css('overflow', 'hidden');
                //Set exit button to go to home page or category
                $('#lbClose').unbind('click');
                $('#lbClose').click(function () {
                    window.location.href = '/' + catReal + '/';
                });
            }
        } else {
            console.log('Dont load category in background');
        }
    },

    //Sets margin for grid element (some content might be covered by header and footer)
    setMainMargin : function () {
        $('#main').css('marginTop', $('.header').height() + 3);
        $('#main').css('marginBottom', $('.footer').height());
        //console.log('set margin');
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
        console.log('Checking push down ad');
        if ($('.articleCnt').length) {
            if (this.pushCounter === 10) {
                return false;
            }
            if ($('#eyeDiv').length) {
                $('#eyeDiv').prependTo('.lbTopCnt div:first');
                return true;
            } else {
                this.pushCounter++;
                var that = this;
                window.setTimeout(function () {
                    that.checkAndMovePushDown();
                }, 1000);
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
        this.checkAndMovePushDown();
        this.checkAndMovePictelaAd();
        //On box click events

        $('body').on('click', '.boxLink', function (event) {
            if (typeof (cambio) !== 'undefined' && cambio.overlayLoad === 1 || ($(this).hasClass('boxTwitter') || $(this).hasClass('boxStatic'))) {
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

//Before displaying page
$(function () {
    cambio.init();
    if ($('.boxContainer').length === 1) {
        cambioGrid.firstLoadInit(window.ad300x250);
    }
    cambioLightbox.init();
});

/*
 * jQuery Nivo Slider v3.2
 * http://nivo.dev7studios.com
 *
 * Copyright 2012, Dev7studios
 * Free to use and abuse under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

(function($) {
    var NivoSlider = function(element, options){
        // Defaults are below
        var settings = $.extend({}, $.fn.nivoSlider.defaults, options);

        // Useful variables. Play carefully.
        var vars = {
            currentSlide: 0,
            currentImage: '',
            totalSlides: 0,
            running: false,
            paused: false,
            stop: false,
            controlNavEl: false
        };

        // Get this slider
        var slider = $(element);
        slider.data('nivo:vars', vars).addClass('nivoSlider');

        // Find our slider children
        var kids = slider.children();
        kids.each(function() {
            var child = $(this);
            var link = '';
            if(!child.is('img')){
                if(child.is('a')){
                    child.addClass('nivo-imageLink');
                    link = child;
                }
                child = child.find('img:first');
            }
            // Get img width & height
            var childWidth = (childWidth === 0) ? child.attr('width') : child.width(),
                childHeight = (childHeight === 0) ? child.attr('height') : child.height();

            if(link !== ''){
                link.css('display','none');
            }
            child.css('display','none');
            vars.totalSlides++;
        });
         
        // If randomStart
        if(settings.randomStart){
            settings.startSlide = Math.floor(Math.random() * vars.totalSlides);
        }
        
        // Set startSlide
        if(settings.startSlide > 0){
            if(settings.startSlide >= vars.totalSlides) { settings.startSlide = vars.totalSlides - 1; }
            vars.currentSlide = settings.startSlide;
        }
        
        // Get initial image
        if($(kids[vars.currentSlide]).is('img')){
            vars.currentImage = $(kids[vars.currentSlide]);
        } else {
            vars.currentImage = $(kids[vars.currentSlide]).find('img:first');
        }
        
        // Show initial link
        if($(kids[vars.currentSlide]).is('a')){
            $(kids[vars.currentSlide]).css('display','block');
        }
        
        // Set first background
        var sliderImg = $('<img/>').addClass('nivo-main-image');
        sliderImg.attr('src', vars.currentImage.attr('src')).show();
        slider.append(sliderImg);

        // Detect Window Resize
        $(window).resize(function() {
            slider.children('img').width(slider.width());
            sliderImg.attr('src', vars.currentImage.attr('src'));
            sliderImg.stop().height('auto');
            $('.nivo-slice').remove();
            $('.nivo-box').remove();
        });

        //Create caption
        slider.append($('<div class="nivo-caption"></div>'));
        
        // Process caption function
        var processCaption = function(settings){
            var nivoCaption = $('.nivo-caption', slider);
            if(vars.currentImage.attr('title') != '' && vars.currentImage.attr('title') != undefined){
                var title = vars.currentImage.attr('title');
                if(title.substr(0,1) == '#') title = $(title).html();   

		if(typeof settings.caption === 'function') {
		    try {
		        title = settings.caption(vars.currentImage);
		    } catch (e) { }
		}

                if(nivoCaption.css('display') == 'block'){
                    setTimeout(function(){
                        nivoCaption.html(title);
                    }, settings.animSpeed);
                } else {
                    nivoCaption.html(title);
                    nivoCaption.stop().fadeIn(settings.animSpeed);
                }
            } else {
                nivoCaption.stop().fadeOut(settings.animSpeed);
            }
        }
        
        //Process initial  caption
        processCaption(settings);
        
        // In the words of Super Mario "let's a go!"
        var timer = 0;
        if(!settings.manualAdvance && kids.length > 1){
            timer = setInterval(function(){ nivoRun(slider, kids, settings, false); }, settings.pauseTime);
        }
        
        // Add Direction nav
        if(settings.directionNav){
            slider.append('<div class="nivo-directionNav"><a class="nivo-prevNav">'+ settings.prevText +'</a><a class="nivo-nextNav">'+ settings.nextText +'</a></div>');
            
            $(slider).on('click', 'a.nivo-prevNav', function(){
                if(vars.running) { return false; }
                clearInterval(timer);
                timer = '';
                vars.currentSlide -= 2;
                nivoRun(slider, kids, settings, 'prev', true);
            });
            
            $(slider).on('click', 'a.nivo-nextNav', function(){
                if(vars.running) { return false; }
                clearInterval(timer);
                timer = '';
                nivoRun(slider, kids, settings, 'next', true);
            });
        }
        
        // Add Control nav
        if(settings.controlNav){
            vars.controlNavEl = $('<div class="nivo-controlNav"></div>');
            slider.after(vars.controlNavEl);
            for(var i = 0; i < kids.length; i++){
                if(settings.controlNavThumbs){
                    vars.controlNavEl.addClass('nivo-thumbs-enabled');
                    var child = kids.eq(i);
                    if(!child.is('img')){
                        child = child.find('img:first');
                    }
                    if(child.attr('data-thumb')) vars.controlNavEl.append('<a class="nivo-control" rel="'+ i +'"><img src="'+ child.attr('data-thumb') +'" alt="" /></a>');
                } else {
                    vars.controlNavEl.append('<a class="nivo-control" rel="'+ i +'">'+ (i + 1) +'</a>');
                }
            }

            //Set initial active link
            $('a:eq('+ vars.currentSlide +')', vars.controlNavEl).addClass('active');
            
            $('a', vars.controlNavEl).bind('click', function(){
                if(vars.running) return false;
                if($(this).hasClass('active')) return false;
                clearInterval(timer);
                timer = '';
                sliderImg.attr('src', vars.currentImage.attr('src'));
                vars.currentSlide = $(this).attr('rel') - 1;
                nivoRun(slider, kids, settings, 'control');
            });
        }
        
        //For pauseOnHover setting
        if(settings.pauseOnHover){
            slider.hover(function(){
                vars.paused = true;
                clearInterval(timer);
                timer = '';
            }, function(){
                vars.paused = false;
                // Restart the timer
                if(timer === '' && !settings.manualAdvance){
                    timer = setInterval(function(){ nivoRun(slider, kids, settings, false); }, settings.pauseTime);
                }
            });
        }
        
        // Event when Animation finishes
        slider.bind('nivo:animFinished', function(){
            sliderImg.attr('src', vars.currentImage.attr('src'));
            vars.running = false; 
            // Hide child links
            $(kids).each(function(){
                if($(this).is('a')){
                   $(this).css('display','none');
                }
            });
            // Show current link
            if($(kids[vars.currentSlide]).is('a')){
                $(kids[vars.currentSlide]).css('display','block');
            }
            // Restart the timer
            if(timer === '' && !vars.paused && !settings.manualAdvance){
                timer = setInterval(function(){ nivoRun(slider, kids, settings, false); }, settings.pauseTime);
            }
            // Trigger the afterChange callback
            settings.afterChange.call(this);
        }); 
        
        // Add slices for slice animations
        var createSlices = function(slider, settings, vars) {
        	if($(vars.currentImage).parent().is('a')) $(vars.currentImage).parent().css('display','block');
            $('img[src="'+ vars.currentImage.attr('src') +'"]', slider).not('.nivo-main-image,.nivo-control img').width(slider.width()).css('visibility', 'hidden').show();
            var sliceHeight = ($('img[src="'+ vars.currentImage.attr('src') +'"]', slider).not('.nivo-main-image,.nivo-control img').parent().is('a')) ? $('img[src="'+ vars.currentImage.attr('src') +'"]', slider).not('.nivo-main-image,.nivo-control img').parent().height() : $('img[src="'+ vars.currentImage.attr('src') +'"]', slider).not('.nivo-main-image,.nivo-control img').height();

            for(var i = 0; i < settings.slices; i++){
                var sliceWidth = Math.round(slider.width()/settings.slices);
                
                if(i === settings.slices-1){
                    slider.append(
                        $('<div class="nivo-slice" name="'+i+'"><img src="'+ vars.currentImage.attr('src') +'" style="position:absolute; width:'+ slider.width() +'px; height:auto; display:block !important; top:0; left:-'+ ((sliceWidth + (i * sliceWidth)) - sliceWidth) +'px;" /></div>').css({ 
                            left:(sliceWidth*i)+'px', 
                            width:(slider.width()-(sliceWidth*i))+'px',
                            height:sliceHeight+'px', 
                            opacity:'0',
                            overflow:'hidden'
                        })
                    );
                } else {
                    slider.append(
                        $('<div class="nivo-slice" name="'+i+'"><img src="'+ vars.currentImage.attr('src') +'" style="position:absolute; width:'+ slider.width() +'px; height:auto; display:block !important; top:0; left:-'+ ((sliceWidth + (i * sliceWidth)) - sliceWidth) +'px;" /></div>').css({ 
                            left:(sliceWidth*i)+'px', 
                            width:sliceWidth+'px',
                            height:sliceHeight+'px',
                            opacity:'0',
                            overflow:'hidden'
                        })
                    );
                }
            }
            
            $('.nivo-slice', slider).height(sliceHeight);
            sliderImg.stop().animate({
                height: $(vars.currentImage).height()
            }, settings.animSpeed);
        };
        
        // Add boxes for box animations
        var createBoxes = function(slider, settings, vars){
        	if($(vars.currentImage).parent().is('a')) $(vars.currentImage).parent().css('display','block');
            $('img[src="'+ vars.currentImage.attr('src') +'"]', slider).not('.nivo-main-image,.nivo-control img').width(slider.width()).css('visibility', 'hidden').show();
            var boxWidth = Math.round(slider.width()/settings.boxCols),
                boxHeight = Math.round($('img[src="'+ vars.currentImage.attr('src') +'"]', slider).not('.nivo-main-image,.nivo-control img').height() / settings.boxRows);
            
                        
            for(var rows = 0; rows < settings.boxRows; rows++){
                for(var cols = 0; cols < settings.boxCols; cols++){
                    if(cols === settings.boxCols-1){
                        slider.append(
                            $('<div class="nivo-box" name="'+ cols +'" rel="'+ rows +'"><img src="'+ vars.currentImage.attr('src') +'" style="position:absolute; width:'+ slider.width() +'px; height:auto; display:block; top:-'+ (boxHeight*rows) +'px; left:-'+ (boxWidth*cols) +'px;" /></div>').css({ 
                                opacity:0,
                                left:(boxWidth*cols)+'px', 
                                top:(boxHeight*rows)+'px',
                                width:(slider.width()-(boxWidth*cols))+'px'
                                
                            })
                        );
                        $('.nivo-box[name="'+ cols +'"]', slider).height($('.nivo-box[name="'+ cols +'"] img', slider).height()+'px');
                    } else {
                        slider.append(
                            $('<div class="nivo-box" name="'+ cols +'" rel="'+ rows +'"><img src="'+ vars.currentImage.attr('src') +'" style="position:absolute; width:'+ slider.width() +'px; height:auto; display:block; top:-'+ (boxHeight*rows) +'px; left:-'+ (boxWidth*cols) +'px;" /></div>').css({ 
                                opacity:0,
                                left:(boxWidth*cols)+'px', 
                                top:(boxHeight*rows)+'px',
                                width:boxWidth+'px'
                            })
                        );
                        $('.nivo-box[name="'+ cols +'"]', slider).height($('.nivo-box[name="'+ cols +'"] img', slider).height()+'px');
                    }
                }
            }
            
            sliderImg.stop().animate({
                height: $(vars.currentImage).height()
            }, settings.animSpeed);
        };

        // Private run method
        var nivoRun = function(slider, kids, settings, nudge, click){
            // Get our vars
            var vars = slider.data('nivo:vars');
            
            // Trigger the lastSlide callback
            if(vars && (vars.currentSlide === vars.totalSlides - 1)){ 
                settings.lastSlide.call(this);
            }
            
            // Stop
            if((!vars || vars.stop) && !nudge) { return false; }
            
            // Trigger the beforeChange callback
            settings.beforeChange.call(this, click);

            // Set current background before change
            if(!nudge){
                sliderImg.attr('src', vars.currentImage.attr('src'));
            } else {
                if(nudge === 'prev'){
                    sliderImg.attr('src', vars.currentImage.attr('src'));
                }
                if(nudge === 'next'){
                    sliderImg.attr('src', vars.currentImage.attr('src'));
                }
            }
            
            vars.currentSlide++;
            // Trigger the slideshowEnd callback
            if(vars.currentSlide === vars.totalSlides){ 
                vars.currentSlide = 0;
                settings.slideshowEnd.call(this);
            }
            if(vars.currentSlide < 0) { vars.currentSlide = (vars.totalSlides - 1); }
            // Set vars.currentImage
            if($(kids[vars.currentSlide]).is('img')){
                vars.currentImage = $(kids[vars.currentSlide]);
            } else {
                vars.currentImage = $(kids[vars.currentSlide]).find('img:first');
            }
            
            // Set active links
            if(settings.controlNav){
                $('a', vars.controlNavEl).removeClass('active');
                $('a:eq('+ vars.currentSlide +')', vars.controlNavEl).addClass('active');
            }
            
            // Process caption
            processCaption(settings);            
            
            // Remove any slices from last transition
            $('.nivo-slice', slider).remove();
            
            // Remove any boxes from last transition
            $('.nivo-box', slider).remove();
            
            var currentEffect = settings.effect,
                anims = '';
                
            // Generate random effect
            if(settings.effect === 'random'){
                anims = new Array('sliceDownRight','sliceDownLeft','sliceUpRight','sliceUpLeft','sliceUpDown','sliceUpDownLeft','fold','fade',
                'boxRandom','boxRain','boxRainReverse','boxRainGrow','boxRainGrowReverse');
                currentEffect = anims[Math.floor(Math.random()*(anims.length + 1))];
                if(currentEffect === undefined) { currentEffect = 'fade'; }
            }
            
            // Run random effect from specified set (eg: effect:'fold,fade')
            if(settings.effect.indexOf(',') !== -1){
                anims = settings.effect.split(',');
                currentEffect = anims[Math.floor(Math.random()*(anims.length))];
                if(currentEffect === undefined) { currentEffect = 'fade'; }
            }
            
            // Custom transition as defined by "data-transition" attribute
            if(vars.currentImage.attr('data-transition')){
                currentEffect = vars.currentImage.attr('data-transition');
            }
        
            // Run effects
            vars.running = true;
            var timeBuff = 0,
                i = 0,
                slices = '',
                firstSlice = '',
                totalBoxes = '',
                boxes = '';
            
            if(currentEffect === 'sliceDown' || currentEffect === 'sliceDownRight' || currentEffect === 'sliceDownLeft'){
                createSlices(slider, settings, vars);
                timeBuff = 0;
                i = 0;
                slices = $('.nivo-slice', slider);
                if(currentEffect === 'sliceDownLeft') { slices = $('.nivo-slice', slider)._reverse(); }
                
                slices.each(function(){
                    var slice = $(this);
                    slice.css({ 'top': '0px' });
                    if(i === settings.slices-1){
                        setTimeout(function(){
                            slice.animate({opacity:'1.0' }, settings.animSpeed, '', function(){ slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function(){
                            slice.animate({opacity:'1.0' }, settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 50;
                    i++;
                });
            } else if(currentEffect === 'sliceUp' || currentEffect === 'sliceUpRight' || currentEffect === 'sliceUpLeft'){
                createSlices(slider, settings, vars);
                timeBuff = 0;
                i = 0;
                slices = $('.nivo-slice', slider);
                if(currentEffect === 'sliceUpLeft') { slices = $('.nivo-slice', slider)._reverse(); }
                
                slices.each(function(){
                    var slice = $(this);
                    slice.css({ 'bottom': '0px' });
                    if(i === settings.slices-1){
                        setTimeout(function(){
                            slice.animate({opacity:'1.0' }, settings.animSpeed, '', function(){ slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function(){
                            slice.animate({opacity:'1.0' }, settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 50;
                    i++;
                });
            } else if(currentEffect === 'sliceUpDown' || currentEffect === 'sliceUpDownRight' || currentEffect === 'sliceUpDownLeft'){
                createSlices(slider, settings, vars);
                timeBuff = 0;
                i = 0;
                var v = 0;
                slices = $('.nivo-slice', slider);
                if(currentEffect === 'sliceUpDownLeft') { slices = $('.nivo-slice', slider)._reverse(); }
                
                slices.each(function(){
                    var slice = $(this);
                    if(i === 0){
                        slice.css('top','0px');
                        i++;
                    } else {
                        slice.css('bottom','0px');
                        i = 0;
                    }
                    
                    if(v === settings.slices-1){
                        setTimeout(function(){
                            slice.animate({opacity:'1.0' }, settings.animSpeed, '', function(){ slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function(){
                            slice.animate({opacity:'1.0' }, settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 50;
                    v++;
                });
            } else if(currentEffect === 'fold'){
                createSlices(slider, settings, vars);
                timeBuff = 0;
                i = 0;
                
                $('.nivo-slice', slider).each(function(){
                    var slice = $(this);
                    var origWidth = slice.width();
                    slice.css({ top:'0px', width:'0px' });
                    if(i === settings.slices-1){
                        setTimeout(function(){
                            slice.animate({ width:origWidth, opacity:'1.0' }, settings.animSpeed, '', function(){ slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function(){
                            slice.animate({ width:origWidth, opacity:'1.0' }, settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 50;
                    i++;
                });
            } else if(currentEffect === 'fade'){
                createSlices(slider, settings, vars);
                
                firstSlice = $('.nivo-slice:first', slider);
                firstSlice.css({
                    'width': slider.width() + 'px'
                });
    
                firstSlice.animate({ opacity:'1.0' }, (settings.animSpeed*2), '', function(){ slider.trigger('nivo:animFinished'); });
            } else if(currentEffect === 'slideInRight'){
                createSlices(slider, settings, vars);
                
                firstSlice = $('.nivo-slice:first', slider);
                firstSlice.css({
                    'width': '0px',
                    'opacity': '1'
                });

                firstSlice.animate({ width: slider.width() + 'px' }, (settings.animSpeed*2), '', function(){ slider.trigger('nivo:animFinished'); });
            } else if(currentEffect === 'slideInLeft'){
                createSlices(slider, settings, vars);
                
                firstSlice = $('.nivo-slice:first', slider);
                firstSlice.css({
                    'width': '0px',
                    'opacity': '1',
                    'left': '',
                    'right': '0px'
                });

                firstSlice.animate({ width: slider.width() + 'px' }, (settings.animSpeed*2), '', function(){ 
                    // Reset positioning
                    firstSlice.css({
                        'left': '0px',
                        'right': ''
                    });
                    slider.trigger('nivo:animFinished'); 
                });
            } else if(currentEffect === 'boxRandom'){
                createBoxes(slider, settings, vars);
                
                totalBoxes = settings.boxCols * settings.boxRows;
                i = 0;
                timeBuff = 0;

                boxes = shuffle($('.nivo-box', slider));
                boxes.each(function(){
                    var box = $(this);
                    if(i === totalBoxes-1){
                        setTimeout(function(){
                            box.animate({ opacity:'1' }, settings.animSpeed, '', function(){ slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function(){
                            box.animate({ opacity:'1' }, settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 20;
                    i++;
                });
            } else if(currentEffect === 'boxRain' || currentEffect === 'boxRainReverse' || currentEffect === 'boxRainGrow' || currentEffect === 'boxRainGrowReverse'){
                createBoxes(slider, settings, vars);
                
                totalBoxes = settings.boxCols * settings.boxRows;
                i = 0;
                timeBuff = 0;
                
                // Split boxes into 2D array
                var rowIndex = 0;
                var colIndex = 0;
                var box2Darr = [];
                box2Darr[rowIndex] = [];
                boxes = $('.nivo-box', slider);
                if(currentEffect === 'boxRainReverse' || currentEffect === 'boxRainGrowReverse'){
                    boxes = $('.nivo-box', slider)._reverse();
                }
                boxes.each(function(){
                    box2Darr[rowIndex][colIndex] = $(this);
                    colIndex++;
                    if(colIndex === settings.boxCols){
                        rowIndex++;
                        colIndex = 0;
                        box2Darr[rowIndex] = [];
                    }
                });
                
                // Run animation
                for(var cols = 0; cols < (settings.boxCols * 2); cols++){
                    var prevCol = cols;
                    for(var rows = 0; rows < settings.boxRows; rows++){
                        if(prevCol >= 0 && prevCol < settings.boxCols){
                            /* Due to some weird JS bug with loop vars 
                            being used in setTimeout, this is wrapped
                            with an anonymous function call */
                            (function(row, col, time, i, totalBoxes) {
                                var box = $(box2Darr[row][col]);
                                var w = box.width();
                                var h = box.height();
                                if(currentEffect === 'boxRainGrow' || currentEffect === 'boxRainGrowReverse'){
                                    box.width(0).height(0);
                                }
                                if(i === totalBoxes-1){
                                    setTimeout(function(){
                                        box.animate({ opacity:'1', width:w, height:h }, settings.animSpeed/1.3, '', function(){ slider.trigger('nivo:animFinished'); });
                                    }, (100 + time));
                                } else {
                                    setTimeout(function(){
                                        box.animate({ opacity:'1', width:w, height:h }, settings.animSpeed/1.3);
                                    }, (100 + time));
                                }
                            })(rows, prevCol, timeBuff, i, totalBoxes);
                            i++;
                        }
                        prevCol--;
                    }
                    timeBuff += 100;
                }
            }           
        };
        
        // Shuffle an array
        var shuffle = function(arr){
            for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i, 10), x = arr[--i], arr[i] = arr[j], arr[j] = x);
            return arr;
        };
        
        // For debugging
        var trace = function(msg){
            if(this.console && typeof console.log !== 'undefined') { console.log(msg); }
        };
        
        // Start / Stop
        this.stop = function(){
            if(!$(element).data('nivo:vars').stop){
                $(element).data('nivo:vars').stop = true;
                trace('Stop Slider');
            }
        };
        
        this.start = function(){
            if($(element).data('nivo:vars').stop){
                $(element).data('nivo:vars').stop = false;
                trace('Start Slider');
            }
        };
        
        // Trigger the afterLoad callback
        settings.afterLoad.call(this);
        
        return this;
    };
        
    $.fn.nivoSlider = function(options) {
        return this.each(function(key, value){
            var element = $(this);
            // Return early if this element already has a plugin instance
            if (element.data('nivoslider')) { return element.data('nivoslider'); }
            // Pass options to plugin constructor
            var nivoslider = new NivoSlider(this, options);
            // Store plugin object in this element's data
            element.data('nivoslider', nivoslider);
        });
    };
    
    //Default settings
    $.fn.nivoSlider.defaults = {
        effect: 'random',
        slices: 15,
        boxCols: 8,
        boxRows: 4,
        animSpeed: 500,
        pauseTime: 3000,
        startSlide: 0,
        directionNav: true,
        controlNav: true,
        controlNavThumbs: false,
        pauseOnHover: true,
        manualAdvance: false,
        prevText: 'Prev',
        nextText: 'Next',
        randomStart: false,
        beforeChange: function(){},
        afterChange: function(){},
        slideshowEnd: function(){},
        lastSlide: function(){},
        afterLoad: function(){}
    };

    $.fn._reverse = [].reverse;
    
})(jQuery);

(function ($) {

    $.cambio = {};

    $.cambio.log = function (message) {
        if (console && typeof console.log === 'function') {
            console.log(message);
        }
    };

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
            if (window.bN_cfg && window.bN) {
                // use init here just in case bN_cfg may have been changed
                // this will still make the beacon call
                window.bN.init(window.bN_cfg);
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

(function ($) {

    $.cambio.LoadMonitor = function (options) {
        this.condition = options.condition;
        this.callback = options.callback;
        this.interval = options.interval || 300;
        this.duration = options.duration || 10000;
        return this;
    };

    $.cambio.LoadMonitor.prototype = {
        interval: null,
        startTime: null,
        start: function () {
            this.startTime = new Date().getTime();

            var monitor = this;
            var handler = function () {
                $.cambio.log('checking');
                try {
                    var expr = monitor.condition();
                    if (expr) {
                        $.cambio.log('condition is true');
                        try {
                            monitor.callback();
                        } catch (f) {
                            $.cambio.log('LoadMonitor callback failure: ' + f);
                        } finally {
                            clearInterval(monitor.interval);
                            $.cambio.log('clearing interval');
                        }
                    }
                } catch (e) {
                    $.cambio.log(e);
                } finally {
                    monitor.checkInterval.call(monitor);
                }
            };

            monitor.interval = setInterval(handler, this.interval);
        },
        checkInterval: function () {
            var currentTime = new Date().getTime();
            if ((currentTime - this.startTime) > this.duration) {
                clearInterval(this.interval);
                $.cambio.log('clearing interval');
            }
        }
    };

})(jQuery);


/*global cambio:false*/
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
                }
            },
            noDims: true,
            refreshDivId: $('#ajaxAdDevil').length ? 'ajaxAdDevil' : 'adsDiv1',
            refreshCount: 1,
            after: '<div class="aol-knot-counter"></div>',
            onUiBuilt: function (context) {
                setCounter(context.context);
                $embeddedKnot.on('slideChange', function (evt) {
                    setCounter(context.context);            
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
                $fullScreenKnot.knotFullscreen('showSlide', activeSlide);
            } else {
                $knot.activeSlide = activeSlide;
                $fullScreenKnot.knotFullscreen('enterFullscreen');
            }
        });

        // add the sharing stuff only when we actually enter fullscreen
        // mode the first time
        $fullScreenKnot.on('enteredFullscreen', function () {
            if (typeof(cambio) !== 'undefined' && cambio.wallpaperAd === 1) {
                $('html body').animate({scrollTop: $fullScreenKnot.position().top}, 'slow');  
            } else {
                $fullScreenKnot.scrollParent().animate({scrollTop: $fullScreenKnot.position().top}, 'slow');
            }
            $fullScreenKnot.data('knot')._track();
        });

        return $fullScreenKnot;
    };

})(jQuery, window.FB);
