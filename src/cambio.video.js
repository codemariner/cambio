function set5min() {
    $('.videoCnt .videoLoadingMessage').remove();
}

function pause5min(elem) {
    console.log('video stopped now check if video has ended');
    console.log(elem);
    //cambioVideo.playNextVideo();
}

function progressChanged(elem) {
    console.log('Progres change');
}

var cambioVideo = {
    currentPlay : null,
    currentCategory : 'cambio',
    currentPage : 1,
    currentTag : '',

    init : function () {
        this.initCategories();
        this.initList(1);
        this.playNextVideo();
        $('.videoCategories li a').first().addClass('active');
        //Action to prev next button
        var that = this;
        $('#nextVideo').click(function (event) {
            event.preventDefault();
            that.playNextVideo();
        });
        $('#prevVideo').click(function (event) {
            event.preventDefault();
            that.playPreviousVideo();
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
            that.playVideo($(this).attr('id'), $(this).attr('title'));
        });
        //Add Hover over event to video thumbnail
        //$(selector).hover(function(){$(this).find('.thumbDesc').slideDown('fast');},function(){$(this).find('.thumbDesc').slideUp('fast');});

        //Remove old see more buttons if exists
        $('.videoList .seeMoreVideos').not('#videosPage' + page + ' .seeMoreVideos').remove();

        //Add event to See more button at the end of the list
        $('#videosPage' + page + ' .seeMoreVideos').click(function (event) {
            event.preventDefault();
            that.loadVideos(that.currentCategory, that.currentPage + 1, that.currentType);
        });
    },

    //Init caterories
    initCategories : function () {
        var that = this;
        $('.videoCategories a').click(function (event) {
            event.preventDefault();
            if (!$(this).hasClass('active')) {
                $('.videoCategories a.active').removeClass('active');
                var tmp = $(this).attr('id');
                var type = tmp.split('_', 1)[0];
                var value = tmp.replace(type + '_', '');
                value = value.replace(/__/g, ' ');
                that.loadVideos(value, 1, type);
                $(this).addClass('active');
            }
        });
    },

    loadVideos : function (value, page, type) {
        console.log('Loading videosy  ' + type + ' ' + value);
        var that = this;
        $.ajax({
            url : '5min.php',
            data : {
                ajax : 1,
                value : value,
                page : page,
                type : type
            },
            type : 'POST',
            success : function (html) {
                that.currentCategory = value;
                that.currentPage = page;
                that.currentType = type;
                if (page === 1) {
                    $('.videoList').html(html);
                    that.currentPlay = null;
                    that.playNextVideo();
                } else {
                    $('.videoList').append(html);
                }
                that.initList(page);

            }
        });
    },

    //check if next/prev video should be hidden
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
    },

    //gets next video Id
    getNextVideoId : function () {
        var nextId = null;
        if (this.currentPlay === null) {
            nextId = $('.videoList .videoItem a').first().attr('id');
        } else {
            var found = 0;
            var that = this;
            $('.videoList .videoItem a').each(function (index) {
                if (found === 1) {
                    console.log($(this).get(0));
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
        var title = $('#' + id).attr('title');
        this.playVideo(id, title);

    },

    //Plays previous video (get id from the list)
    playPreviousVideo : function () {
        var id = this.getPrevVideoId();
        var title = $('#' + id).attr('title');
        this.playVideo(id, title);
    },

    playVideo : function (id, title) {
        if (id !== null) {
            $('.playerCnt').html('');
            var src = 'http://pshared.5min.com/Scripts/PlayerSeed.js?sid=577&width=800&height=500&playList=' + id + '&shuffle=0&searchMode=0&autoStart=true&colorPallet=#33ccff&vcdBgColor=#000&hasCompanion=false&relatedMode=0&playerActions=16&onTimeChanged=progressChanged&onPause=pause5min&onReady=set5min&defer=defer';
            var script = document.createElement('script');
            script.setAttribute('type', 'text/javascript');
            script.setAttribute('src', src);
            if (typeof(title) !== 'undefined') {
                $('.playerCnt').html('<div class="videoLoadingMessage"><span>Please wait loading video</br>' + title + '</span></div>');
                $('.videoCnt .titleCnt').html('<h2>' + title + '</h2>');
            }
            $('.playerCnt').get(0).appendChild(script);
            $('.videoList .videoItem a').removeClass('active');
            $('#' + id).addClass('active');
            this.currentPlay = id;
            $("html, body").animate({
                scrollTop : 0
            }, "slow");
            this.checkPrevNext();
        }
    }
};

$(function () {
    if ($('.videoMainCnt').length) {
        cambioVideo.init();
    }
}); 