var cambioIntercept = {
    postponePostNum : 5,
    postNum : 3,
    animationSpeed : 1000,
    delay : 3000,
    cookieExpire : 365,
    
    setCookie : function (c_name, value, exdays) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value = escape(value) + ((exdays === null) ? "" : "; expires=" + exdate.toUTCString()) + ';domain=.cambio.com;path=/';
        document.cookie = c_name + "=" + c_value;
    },
    
    getCookie : function (c_name) {
        var c_value = document.cookie;
        var c_start = c_value.indexOf(" " + c_name + "=");
        if (c_start === -1) {
            c_start = c_value.indexOf(c_name + "=");
        }
        if (c_start === -1) {
            c_value = null;
        } else {
            c_start = c_value.indexOf("=", c_start) + 1;
            var c_end = c_value.indexOf(";", c_start);
            if (c_end === -1) {
                c_end = c_value.length;
            }
            c_value = unescape(c_value.substring(c_start, c_end));
        }
        return c_value;    
    },
    
    checkAndDisplayIntercept : function () {
        //Check if cookie set
        var cookie = this.getCookie('cambioIntercept');
        //for user who already liked/followed 
         //If not set it
        if (cookie === null) {
            this.setCookie('cambioIntercept', 101 - this.postNum, this.cookieExpire);
            return true;
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
            this.setCookie('cambioIntercept', cookie + 1, this.cookieExpire); 
        }
        
        
    },
    
    //When user click remain me later reset counter
    postponeIntercept : function () {
        this.setCookie('cambioIntercept', 100 - this.postponePostNum, this.cookieExpire);
        this.recordUserAction(3);
        this.removeIntercept();
    },
    
    //when user already liked cambio
    alreadyLikeIntercept : function () {
        this.setCookie('cambioIntercept', 200, this.cookieExpire);
        this.recordUserAction(2);
        this.removeIntercept();
    },
    
    //When user click like 
    likeIntercept : function () {
        //Have to use class name instead of this because this doesn't work with tw and fb button callbacs
        cambioIntercept.setCookie('cambioIntercept', 200, this.cookieExpire);
        //Send request to count user action
        cambioIntercept.recordUserAction(1);
        cambioIntercept.removeIntercept();
        
        FB.Event.unsubscribe('edge.create',  cambioIntercept.likeIntercept);
    },
    getFirstTag : function () {
        return 'First Tag';
        
    },
    
    displayIntercept : function () {
        var code = '<div id="cambioIntercept"><h2>Like of Follow us to stay up to date on the latest happenings with <span>' + this.getFirstTag() + '</span></h2>';
        code += '<div class="likeButtons"></div>';
        code += '<div class="buttons"><ul><li><a id="interceptAlready" href="#">I already like or follow Cambio</a></li><li><a id="interceptNo" href="#">No thanks</a></li></ul></div></div>';
        $('body').eq(0).append(code);
        this.addShare();
        var that = this;
        //add code to buttons
        $('#interceptAlready').click(function (event) {
            event.preventDefault();
            that.alreadyLikeIntercept();
        });
        $('#interceptNo').click(function (event) {
            event.preventDefault();
            that.postponeIntercept();
        });
        $('#cambioIntercept').fadeIn(this.animationSpeen);
        
    },
    
    addShare : function () {
        $('#cambioIntercept .likeButtons').html('<ul><li><fb:like layout="box_count" href="https://www.facebook.com/cambioconnect" ref="intercept"></fb:like></li><li><a href="https://twitter.com/cambio" class="twitter-follow-button twitter-count-vertical" data-show-count="true" data-count="vertical" data-size="large" data-show-screen-name="false" data-dnt="true"></a></li></ul>');
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
            twttr.events.bind('follow', that.likeIntercept);
        } else {
            $.getScript('http://platform.twitter.com/widgets.js', function () {
                twttr.events.bind('follow', that.likeIntercept);
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
        $.ajax({
            dataType : 'jsonp',
            crossDomain : true,
            url : 'http://industry.cpapi.aol.com/cambio/intercept/intercept.php?action=' + action,
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
