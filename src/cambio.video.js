function videoPlayerStart(obj) {
    $('.videoCnt .videoLoadingMessage').remove();
    var title = obj.title;
    var currentUrl = window.location.protocol + '//' + window.location.host + '/videos/' + cambioVideo.currentType + '/' + cambioVideo.currentCategory + '/' + cambioVideo.currentPlay + '/';
    //Add change title
    $(".videoTitle").html(title);
    //Change url
    document.title = 'Cambio video - ' + title;
    if (typeof(window.history.pushState) !== 'undefined') {
        window.history.pushState(2, title, currentUrl);
    }
    //Change share buttons
    cambioVideo.changeShareBar(currentUrl, title);
    cambioVideo.sendOmniture(currentUrl, title);
}

function videoPlayerTimeChange(e) {
    if (e.isPlayComplete) {
        if (typeof(cambioVideo) !== 'undefined') {
            cambioVideo.playNextVideo();
        }
    }
}

var cambioVideo = {
    currentPlay : null,
    currentCategory : 'Cambio__on__AOL',
    currentPage : 1,
    currentType : 'studio',
    carouselAnimation : 0,
    playFirstAsNext : 0,
    omniPref : 'cam',
    sendOmni : 0,

    //Sends omniture request
    sendOmniture : function (url, title) {    
        if (this.sendOmni === 1) {
            console.log('Sending omniture request');
            if (window.s_265) {
                window.s_265.prop1 = this.omniPref + ' : quick_read';
                //if(this.type==='twitter')
                window.s_265.prop2 = this.omniPref + ' : video';
                window.s_265.prop14 = url;
                window.s_265.url = url;
                window.s_265.pageName = this.omniPref + ' : Video - ' + title;
                window.s_265.t();
            }
            if (window.bN_cfg) {
                window.bN_cfg.p.dL_dpt = 'video';
                window.bN_cfg.p.dL_sDpt = 'video';
                window.bN_cfg.p.dL_cms_ID = 'bsd:0';
                bN.init(bN_cfg);
            }  
            this.sendOmni = 0;
        }
    },
    

    //Inits video object and all functionalities
    init : function () {
        //Count pixels foir single carousel move
        var itemWidth = 150;
        if ($('.videoItem').length) {
            itemWidth = $('.videoItem').eq(0).width();
        }
        this.carouselMove = Math.floor($('.videoCarouselCnt').width() / itemWidth) * itemWidth;
        var tmp = window.location.pathname.split('/');
        //Set current video properties if passed in URL
        if (tmp.length >= 5) {
            this.currentType = tmp[2];
            this.currentCategory = tmp[3];
            this.currentPlay = tmp[4];
            //Check if played video on the list
            if (!$('.videoList #' + this.currentPlay).length) {
                //Video not on the first page set next video to first on the page
                $('#' + this.getNextVideoId()).append('<div class="nextVideoBG">Up next</div>');
                this.playFirstAsNext = 1;
            } else {
                this.checkAndMoveCarousel();
            }
        }
        //Init categories
        this.initCategories();
        //Init list of videos
        this.initList(1);
        if (this.currentPlay === null) {
            this.playNextVideo();
        } else {
            this.playVideo(this.currentPlay);
        }
        
        //Action to prev next button
        var that = this;
        $('#nextVideo').click(function (event) {
            event.preventDefault();
            that.playNextVideo();
            that.sendOmni = 1;
        });
        $('#prevVideo').click(function (event) {
            event.preventDefault();
            that.playPreviousVideo();
            that.sendOmni = 1;
        });
        
        //Add event to carousel left
        $('.buttonLeft').click(function (event) {
            event.preventDefault();
            if (that.carouselAnimation === 0) {
                var num = $('.videoList').position().left + that.carouselMove;
                if (num <= 0) {
                    that.carouselAnimation = 1;
                    $('.videoList').animate({left : num + 'px'}, function () {
                        that.carouselAnimation = 0;
                    });
                }  
            }
        });
        
        //Add event to carousel right
        $('.buttonRight').click(function (event) {
            event.preventDefault();  
            if (that.carouselAnimation === 0) {
                that.carouselAnimation = 1;
                //Check if scroll or end of list and needs to load next portion
                var lastPos = $('.videoPageItem').position().left;
                var carouselPos = $('.videoList').position().left * (-1) + that.carouselMove;
                if (carouselPos >= lastPos) {
                    //End of carousel need to load data   
                    that.loadVideos(that.currentCategory, that.currentPage + 1, that.currentType); 
                } else {
                    //Move carousel
                    var num = $('.videoList').position().left - that.carouselMove;
                    $('.videoList').animate({left : num + 'px'}, function () {
                        //Check if end of carousel and load next data
                        carouselPos = $('.videoList').position().left * (-1) + that.carouselMove;
                        if (carouselPos >= lastPos) {
                            that.loadVideos(that.currentCategory, that.currentPage + 1, that.currentType);
                        } else {
                            that.carouselAnimation = 0;
                        }
                    });
                }
            }
             
        });
    },


    //Inits list of videos
    initList : function (page) {
        var selector = '.videoList #videosPage' + page + ' .videoItem a';
        var that = this;
        //Add click event to video thumbnail
        $(selector).click(function (event) {
            event.preventDefault();
            if ($(this).hasClass('active')) {
                return false;
            }
            that.sendOmni = 1;
            that.playVideo($(this).attr('id'));
            
        });
        //Remove old see more buttons if exists
        $('.videoList .seeMoreVideos').not('#videosPage' + page + ' .seeMoreVideos').remove();
        
    },


    //Inits caterory list
    initCategories : function () {
        //Set active category
        $('#' + this.currentType + '_' + this.currentCategory).addClass('active');
        $('#' + this.currentType + '_' + this.currentCategory).parents(':hidden').show().addClass('opened');
        var that = this;
        //Init category click action
        $('.videoMenuCnt a').click(function (event) {
            event.preventDefault();
            //For category parent item
            if ($(this).hasClass('categoryParent')) {
                if ($(this).next().hasClass('opened')) {
                    $(this).next().removeClass('opened').slideUp('slow');   
                } else {
                    //Close every opened category lists
                    $('.videoMenuCnt .opened').removeClass('opened').slideUp('slow');
                    $(this).next().addClass('opened').slideDown('slow');
                }
            } else {
                //For category selector
                if (!$(this).hasClass('active')) {
                    $('.videoMenuCnt a.active').removeClass('active');
                    var tmp = $(this).attr('id');
                    var type = tmp.split('_', 1)[0];
                    var value = tmp.replace(type + '_', '');
                    that.loadVideos(value, 1, type);
                    $(this).addClass('active');
                    that.sendOmni = 1;
                }
            }
        });
    },


    //Loads videos to video list
    loadVideos : function (value, page, type) {
        console.log('Loading videos  ' + type + ' ' + value + ' ' + page + 'url ' + '/videocategory/' + type + '/' + value + '/' + page);
        //Reset carousel position
        if (page === 1) {
            $('.videoList').css('left', '0px').html('');
        }
        //Add loading message
        $('.videoListCnt').append('<div class="categoryLoadingMsg"><span>Loading videos</span></div>');
        var that = this;
        $.ajax({
            url : '/videocategory/' + type + '/' + value + '/' + page + '/',
            type : 'GET',
            success : function (html) {
                that.currentCategory = value;
                that.currentPage = page;
                that.currentType = type;
                if (page === 1) {
                    //For first page loads video and play first from the list
                    $('.videoList').html(html);
                    that.currentPlay = null;
                    that.playNextVideo();
                } else {
                    //Remove last carousel end element
                    $('.videoList .videoPageItem').remove();
                    $('.videoList').append(html);
                }
                //Remove loading message
                $('.videoListCnt .categoryLoadingMsg').remove();
                that.initList(page);
                that.carouselAnimation = 0;
            }
        });
    },


    //Check if next/prev video button should be hidden and display next video, current play video
    checkPrevNext : function () {
        if (this.getNextVideoId() === null) {
            $('#nextVideo').hide();
        } else {
            $('#nextVideo').show();
        }
        if (this.getPrevVideoId() === null) {
            $('#prevVideo').hide();
        } else {
            $('#prevVideo').show();
        }
        
        //Add background to next and current video thumbnail
        $('.currentVideoBG, .nextVideoBG').remove();
        $('#' + this.currentPlay).append('<div class="currentVideoBG"><div class="currentPlayText">Now playing</div><div class="currentPlayArrow"></div></div>');
        if (this.getNextVideoId() !== null) {
            $('#' + this.getNextVideoId()).append('<div class="nextVideoBG">Up next</div>');     
        }
    },


    //Gets next video Id
    getNextVideoId : function () {
        var nextId = null;
        if (this.playFirstAsNext === 1) {
            return $('.videoList .videoItem a').first().attr('id');
        }
        if (this.currentPlay === null) {
            nextId = $('.videoList .videoItem a').first().attr('id');
        } else {
            var found = 0;
            var that = this;
            $('.videoList .videoItem a').each(function (index) {
                if (found === 1) {
                    nextId = $(this).attr('id');
                    return false;
                } else {
                    if ($(this).attr('id') === that.currentPlay) {
                        found = 1;
                    }
                }
            });
        }
        return nextId;
    },

    //Gets previous video Id
    getPrevVideoId : function () {
        var prevId = null;
        if (this.currentPlay === null) {
            prevId = $('.videoList .videoItem a').first().attr('id');
        } else {
            var tmp = null;
            prevId = null;
            var that = this;
            $('.videoList .videoItem a').each(function () {
                if ($(this).attr('id') === that.currentPlay) {
                    prevId = tmp;
                } else {
                    tmp = $(this).attr('id');
                }
            });
        }
        return prevId;
    },


    //Plays next video (get id from the list)
    playNextVideo : function () {
        //Get next video id
        var id = this.getNextVideoId();
        if (this.playFirstAsNext === 1) {
            this.playFirstAsNext = 0;
        }
        this.playVideo(id);
    },


    //Plays previous video (get id from the list)
    playPreviousVideo : function () {
        var id = this.getPrevVideoId();
        this.playVideo(id);
    },


    //Plays particular video
    playVideo : function (id) {
        if (id !== null) {
            var videoWidth = $('.playerCnt').width();
            var videoHeight = $('.playerCnt').height();
            $('.playerCnt, .videoTitle').html('');
            var src = 'http://pshared.5min.com/Scripts/PlayerSeed.js?sid=577&width=' + videoWidth + '&height=' + videoHeight + '&playList=' + id + '&shuffle=0&searchMode=0&autoStart=true&colorPallet=#33ccff&vcdBgColor=#000&hasCompanion=false&relatedMode=0&playerActions=16&onTimeUpdate=videoPlayerTimeChange&onVideoDataLoaded=videoPlayerStart&defer=defer';
            var script = document.createElement('script');
            script.setAttribute('type', 'text/javascript');
            script.setAttribute('src', src);
            $('.playerCnt').get(0).appendChild(script);
            $('.videoList .videoItem a').removeClass('active');
            $('#' + id).addClass('active');
            this.currentPlay = id;
            this.checkPrevNext();    
            this.checkAndMoveCarousel();
        }
    },

    
    //Changes share bar
    changeShareBar : function (url, title) {
        $('.videoShare').html('<ul><li><a data-url="' + url + '" data-text="' + title.replace(/"/g, "&quot;") + '" href="https://twitter.com/share" class="twitter-share-button" data-lang="en">Tweet</a></li><li><fb:like layout="button_count" href="' + url + '" ref="top_left"></fb:like></li></ul>');
        //Facebook
        if (typeof(FB) !== 'undefined') {
            FB.XFBML.parse($('.videoShare')[0]);
        } else {
            $.getScript("http://connect.facebook.net/en_US/all.js#xfbml=1", function () {
                FB.XFBML.parse($('.videoShare')[0]);
            });
        }
        //Twitter
        if (typeof(twttr) !== 'undefined') {
            twttr.widgets.load();
        } else {
            $.getScript('http://platform.twitter.com/widgets.js');
        }
    },
    
    //Checks if current played video is visible in carousel
    checkAndMoveCarousel : function () {
        if ($('.videoList #' + this.currentPlay).length) {
            //Video on the first page - check and move carousel if necesary
            var currentLeftPos = $('.videoList #' + this.currentPlay).position().left + 100;
            if (currentLeftPos > this.carouselMove) {
                var carouselPos = Math.floor(currentLeftPos / this.carouselMove) * this.carouselMove * -1;
                if (carouselPos !==  $('.videoList').position().left) {
                    this.carouselAnimation = 1;
                    var that = this;
                    $('.videoList').animate({left : carouselPos + 'px'}, function () {
                        that.carouselAnimation = 0;
                    });
                }
            }
        }    
    }
};


$(function () {
    if ($('.videoMainCnt').length) {
        cambioVideo.init();
    }
}); 