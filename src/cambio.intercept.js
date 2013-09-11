var cambioIntercept = {
    postponePostNum : 5,
    postNum : 3,
    animationSpeed : 1000,
    delay : 3000,
    cookieExpire : 365,
    
    checkAndDisplayIntercept : function () {
        //Check if cookie set
        if (typeof(this.active) !== 'undefined' && this.active === '1') {
            var cookie = $.cambio.getCookie('cambioIntercept');
            //for user who already liked/followed 
             //If not set it
            if (cookie === null) {
                $.cambio.setCookie('cambioIntercept', 101 - this.postNum, this.cookieExpire, ';domain=.cambio.com;path=/');
            } else {
                cookie = parseInt(cookie, 10);
            }
            if (cookie === 200) {
                return true;
            }
            //Display message if reached 100
            if (cookie + 1 >= 100) {
                this.displayIntercept();
            } else {
                $.cambio.setCookie('cambioIntercept', cookie + 1, this.cookieExpire, ';domain=.cambio.com;path=/'); 
            }
        }
    },
    
    //When user click remain me later reset counter
    postponeIntercept : function () {
        $.cambio.setCookie('cambioIntercept', 100 - this.postponePostNum, this.cookieExpire, ';domain=.cambio.com;path=/');
        this.recordUserAction(4);
        this.removeIntercept();
    },
    
    //when user already liked cambio
    alreadyLikeIntercept : function () {
        $.cambio.setCookie('cambioIntercept', 200, this.cookieExpire, ';domain=.cambio.com;path=/');
        this.recordUserAction(3);
        this.removeIntercept();
    },
    
    //When user click like 
    likeIntercept : function () {
        //Have to use class name instead of this because this doesn't work with tw and fb button callbacs
        $.cambio.setCookie('cambioIntercept', 200, this.cookieExpire, ';domain=.cambio.com;path=/');
        //Send request to count user action
        cambioIntercept.recordUserAction(1);
        cambioIntercept.removeIntercept();
        
        FB.Event.unsubscribe('edge.create',  cambioIntercept.likeIntercept);
    },
    
    //When user click follow
    followIntercept : function () {
        //Have to use class name instead of this because this doesn't work with tw and fb button callbacs
        $.cambio.setCookie('cambioIntercept', 200, this.cookieExpire, ';domain=.cambio.com;path=/');
        //Send request to count user action
        cambioIntercept.recordUserAction(2);
        cambioIntercept.removeIntercept();    
    },
    
    capitaliseFirstLetters : function (str) {
        var words = str.split(' ');
        var html = '';
        $.each(words, function () {
            var first_letter = this.substring(0, 1);
            html += first_letter.toUpperCase() + this.substring(1) + ' ';
        });
        return html;
    },
    
    getFirstTag : function () {
        var tag = 'Cambio';
        if ($('.relatedTags a:first').length) {
            tag = this.capitaliseFirstLetters($('.relatedTags a:first').html());
        }
        return tag;
    },
    
    displayIntercept : function () {        
        var that = this;
        $.ajax({
            url : '/intercept/',
            type : 'GET',
            success : function (code) { 
                $('body').eq(0).append(code);
                $('#cambioIntercept').css('left', $(window).width() / 2 - $('#cambioIntercept').width()  + 80 + 'px');
                that.addShare();
                if ($('#cambioIntercept .firstTag').length) {
                    $('#cambioIntercept .firstTag').html(that.getFirstTag());
                }
                //add code to buttons
                $('#interceptAlready').click(function (event) {
                    event.preventDefault();
                    that.alreadyLikeIntercept();
                });
                $('#interceptNo').click(function (event) {
                    event.preventDefault();
                    that.postponeIntercept();
                });
                $('#cambioIntercept').fadeIn(that.animationSpeen);
            }
        });
    },
    
    addShare : function () {
        //Facebook
        if (typeof(FB) !== 'undefined') {
            FB.XFBML.parse($('.videoShare')[0]);
            FB.Event.subscribe('edge.create', cambioIntercept.likeIntercept); 
            FB.Event.subscribe('edge.create', function (href, widget) {        
                $('.fb_edge_comment_widget.fb_iframe_widget').remove(); 
            });
        } else {
            $.getScript("http://connect.facebook.net/en_US/all.js#xfbml=1", function () {
                FB.XFBML.parse($('.videoShare')[0]);
                FB.Event.subscribe('edge.create',  cambioIntercept.likeIntercept);
            });
        }
        var that = this;
        //Twitter
        if (typeof(twttr) !== 'undefined') {
            twttr.widgets.load();
            twttr.events.bind('follow', that.followIntercept);
        } else {
            $.getScript('http://platform.twitter.com/widgets.js', function () {
                twttr.events.bind('follow', that.followIntercept);
            });
        }
    },
    
    removeIntercept : function () {
        $('#cambioIntercept').fadeOut(this.animationSpeed, function () {
            $(this).remove();    
        });
    },
    
    recordUserAction : function (action) {
        //Send request to extension server
        //1 - like, 2 - follow, 3 - already like, 4 - no thanks
        
        $.ajax({
            dataType : 'jsonp',
            crossDomain : true,
            url : 'http://extension.cambio.com/intercept/intercept.php?action=' + action,
            type : 'GET'
        });
        
    }
};

$(function () {
    if ($('#lbBody .relatedTags').length) {
        cambioIntercept.checkAndDisplayIntercept();
    }
    $(cambioLightbox).on('cambio.lightbox.articleLoaded', function () {
        cambioIntercept.checkAndDisplayIntercept();
    });    
});
