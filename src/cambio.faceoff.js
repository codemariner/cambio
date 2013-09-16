var cambioFaceOff = {
    currentPage : 0,
    animationSpeed : 300,
    imagesPerPage : 2,
    galleryId : 0,
    fbMessage : '',
    slides : [],
    pages : [],
    userVotes : [],
    fbAppId : '1431201983771924',
    
    //Initialize object and display it
    init : function () {
        //Check if faceoff elements on the page
        if ($('.faceOff').length) {
            //Check if hash set
            if (window.location.hash) {
                this.currentPage = parseInt(window.location.hash.replace('#', ''), 10);
            } 
            var that = this;
            if (this.getSlides()) {
                this.createPages();
                this.createPageContainers();
                this.getVotes();
                this.getUserVotes();
                $(this).on('cambio.faceoff.gotVotes', function () { 
                    that.displayCurrentPage();
                });
                this.initButtons();
            }
        }
    },
    
    //Attach next and prev page buttons
    initButtons : function () {
        var that = this;
        $('.nextFaceOff').click(function (event) {
            event.preventDefault();
            that.displayNext();   
        });  
        $('.prevFaceOff').click(function (event) {
            event.preventDefault();
            that.displayPrev();
        });
    },
    
    //Gets faceoff object data from hidden html
    getSlides : function () {
        if ($('.faceOffData').length) {
            //Id
            this.galleryId = $('.faceOff').attr('id').replace('faceOff_', '');
            //FB message
            this.fbMessage = $('.faceOffData .facebookMessage').html();
            //Get data
            var that = this;
            $('.faceOffData li').each(function (i) {
                that.slides[i] = {
                    url : $(this).find('.url').html(),
                    title : $(this).find('.title').html(),
                    text : $(this).find('.text').html(),
                    credits : $(this).find('.credits').html(),
                    index : i,
                    votes : 0  
                };
            });
            return true;
        } else {
            return false;
        }
    },
    
    //Gets votes from external database
    getVotes : function () {
        var that = this;
        $.ajax({
            url : '/faceoffresults/?faceoff=' + that.galleryId,
            type : 'GET',
            dataType : 'json',
            success : function (res) {
                console.log('Request success ' + '/faceoffresults/?faceoff=' + that.galleryId);
                console.log(res);
                var i = 0;
                for (i; i < that.slides.length; i++) {
                    if (typeof(res[i]) !== 'undefined') {
                        that.slides[i].votes = parseInt(res[i], 10);
                    }
                }
                $(that).trigger('cambio.faceoff.gotVotes');
            },
            error : function () {
                $(that).trigger('cambio.faceoff.gotVotes');
            }
        });
    },

    //Get user votes (flags if user voted for particular slide)
    getUserVotes : function () {
        var i = 0;
        for (i = 0; i < this.slides.length; i++) {
            this.userVotes[i] = 0;
        }
        //get data from cookie
        var cookie = $.cambio.getCookie('faceoff');
        if (cookie !== null) {
            this.userVotes = JSON.parse(cookie);
        } else {
            this.displayInstructionBox();
        }
    },    
    
    createPageContainers : function () {
        var i = 0;
        for (i = 0; i < this.pages.length; i++) {
            $('.faceOffPages').append('<li><div class="faceOffPage" id="faceOffPage_' + i + '"></div></li>');
        }
        $('.faceOffPage').css('width', $('.faceOffCarouselCnt').width());
    },
    
    //Saves vote into user cookie
    votesToCookie : function () {
        $.cambio.setCookie('cambiofaceoff', JSON.stringify(this.userVotes), 365);
    },
        
    //Creates pages of slideshow data (creates pairs)
    createPages : function () {
        var i = 0;
        var slide = 0;
        var currentPage = 0;
        var tmp = [];
        for (i = 0; i <= this.slides.length; i++) {    
            if (slide >= this.imagesPerPage) {
                this.pages.push(tmp); 
                tmp = []; 
                slide = 0;       
            }
            tmp.push(i);
            slide++;
        }
    },
        
    //Displays next slide
    displayNext : function () {
        var tmp =  this.currentPage + 1;
        if (tmp < this.pages.length) {
            this.displayPage(tmp);
        } else {
            this.displayPage(0);
        }
    },
    
    //Displaye previous slide
    displayPrev : function () {
        var tmp = this.currentPage - 1;
        if (tmp >= 0) {
            this.displayPage(tmp);
        } else {
            this.displayPage(this.pages.length - 1);
        }
    },
    
    //Displays particular page
    displayPage : function (num) {
        //hide all pages
        this.currentPage = num;
        var that = this;
        that.displayCurrentPage(); 
    },
    
    //Displays page pointed by internal data
    displayCurrentPage : function () {
        if ($('#faceOffPage_' + this.currentPage + ' div').length) {
            this.animateToCurrentPage();
            //$('#faceOffPage_' + this.currentPage).fadeIn(this.animationSpeed); 
        } else {
            var h = '';
            var i = 0;
            var slide = 0;
            var voted = 0;
            var votedForImage = 0;
            for (i = 0; i < this.pages[this.currentPage].length; i++) {
                slide = this.pages[this.currentPage][i];
                if (i !== 0) {
                    h += '<div class="faceOffVS">VS</div>';
                }
                if (this.userVotes[slide] === 1) {
                    voted = 1;
                    votedForImage = slide;
                }
                h += '<div class="faceOffSlide" id="faceOffSlide_' + this.slides[slide].index + '"><img src="' + this.slides[slide].url + '" /><div class="faceOffSlideDetails"><div class="credits credits' + i + '">' + this.slides[slide].credits + '</div><h3>' + this.slides[slide].title + '</h3><div class="text">' + this.slides[slide].text + '</div></div></div>';
            }
            $('#faceOff_' + this.galleryId + ' #faceOffPage_' + this.currentPage).append(h);
            //Move it to
            //If user didn't vote
            if (voted === 0) {
                //Add vote buttons
                for (i = 0; i < this.pages[this.currentPage].length; i++) {
                    slide = this.pages[this.currentPage][i];
                    $('#faceOffSlide_' + this.slides[slide].index + ' .faceOffSlideDetails').prepend('<a href="#" id="voteButton_' + this.slides[slide].index + '" class="voteButton"></a>');
                }
                //Add actions to button
                var that = this;
                $('#faceOffPage_' + this.currentPage + ' .voteButton').click(function (event) {
                    event.preventDefault();
                    that.vote($(this).attr('id').replace('voteButton_', ''));
                });    
            } else {
                //Display votes
                this.displayVotes();
            }
        }
        this.animateToCurrentPage();
        //Update page counter
        $('#faceOff_' + this.galleryId + ' .faceOffCounter .num').html(this.currentPage + 1);
        //Update URL (add hash)
        window.location.hash = '#' + this.currentPage;
        this.equalizeImageBoxes();
    },
    
    displayInstructionBox : function () {
        console.log('Display instructions box');
        //request body
        var that = this;
        $.ajax({
            url : '/faceoffinstructions/',
            type : 'GET',
            success : function (code) { 
                $('body').eq(0).append(code);
                $('body').eq(0).append('<div class="cambioPopupBg" id="faceOffInstrBg"></div>');
                $('#faceOffInstr').css('left', $(window).width() / 2 - $('#faceOffInstr').width()  + 80 + 'px');
                //add code to buttons
                $('#faceOffInstrClose').click(function (event) {
                    event.preventDefault();
                    that.closeInstructionBox();
                });
                $('#faceOffInstr, #faceOffInstrBg').fadeIn(that.animationSpeed);
                //Add share buttons
                that.addShare();
            }
        });
    },
    
    addShare : function () {
        //Facebook
        var that = this;
        var code = '<div class="fb-like" data-href="' + window.location.href + '" data-send="false" data-layout="button_count" data-show-faces="false"></div>';
        $('#faceOffInstr li').eq(0).html(code);
        if (typeof(FB) !== 'undefined') {
            FB.XFBML.parse($('#faceOffInstr')[0]);
            FB.Event.subscribe('edge.create',  cambioFaceOff.closeInstructionBox);
        } else {
            $.getScript("http://connect.facebook.net/en_US/all.js#xfbml=1", function () {
                FB.XFBML.parse($('#faceOffInstr')[0]);
                FB.Event.subscribe('edge.create',  cambioFaceOff.closeInstructionBox);
            });
        }
        //Twitter
        code = '<a href="https://twitter.com/share" class="twitter-share-button" data-url="' + window.location.href + '" href="http://twitter.com/share" class="twitter-share-button" data-via="cambio" data-count="horizontal">Tweet</a>';
        $('#faceOffInstr li').eq(1).html(code);
        if (typeof(twttr) !== 'undefined') {
            twttr.widgets.load();
            twttr.events.bind('tweet', cambioFaceOff.closeInstructionBox);
        } else {
            $.getScript('http://platform.twitter.com/widgets.js', function () {
                twttr.events.bind('tweet', cambioFaceOff.closeInstructionBox);
            });
        } 
        //Google
        code = '<g:plus action="share" data-annotation="bubble"></g:plus>';
        $('#faceOffInstr li').eq(2).html(code);
        var gObj = {
            "href" : window.location.href,
            "callback" : cambioFaceOff.closeInstructionBox
        };
        if (typeof(gapi) !== 'undefined') {
            $('#faceOffInstr .gPlusShare').each(function () {
                gapi.plusone.render($(this).get(0), gObj);
            });
        } else {
            window.___gcfg = {
                lang : 'en-US',
                parsetags : 'explicit'
            };
            $.getScript('https://apis.google.com/js/plusone.js', function () {
                $('#faceOffInstr .gPlusShare').each(function () {
                    gapi.plusone.render($(this).get(0), gObj);
                });
            });
        }
    },
    
    closeInstructionBox : function (obj) {
        console.log('Closing instruction box');
        $('#faceOffInstr, #faceOffInstrBg').fadeOut(this.animationSpeed, function () {
            $('#faceOffInstr, #faceOffInstrBg').remove();
        });
        this.votesToCookie();
    },
    
    animateToCurrentPage : function () {
        var left = $('#faceOffPage_' + this.currentPage).position().left * -1;
        $('.faceOffPages').animate({left : left + 'px'});
    },
    
    //Displays votes on current page after vote
    displayVotes : function () { 
        $('#faceOffPage_' + this.currentPage + ' .voteButton').remove();
       
        var i = 0;
        var slide = 0;
        var votes = 0;
        var vWord = '', elemClass = '', bgClass = '';
        for (i = 0; i < this.pages[this.currentPage].length; i++) {
            slide = this.pages[this.currentPage][i];
            votes = this.slides[slide].votes;
            vWord = 'votes';
            if (votes === 1) {
                vWord = 'vote';
            }
            
            if (this.userVotes[slide] === 1) {
                elemClass = 'voted';   
                bgClass = '';     
            } else {
                elemClass = 'notVoted';
                bgClass = 'noVote';
            }
            $('#faceOffPage_' + this.currentPage + ' #faceOffSlide_' + slide + ' .faceOffSlideDetails').prepend('<div class="' + elemClass + '"></div>'); 
            $('#faceOffPage_' + this.currentPage + ' #faceOffSlide_' + slide + ' .faceOffSlideDetails').prepend('<div class="votes ' + bgClass + '"><div class="voteNum">' + votes + ' ' + vWord + '</div><div class="voteArrow"></div></div>'); 
        }
        this.equalizeImageBoxes();
    },
    
    //Sets the same height for imageBoxes on current page
    equalizeImageBoxes : function () {
        $('#faceOffPage_' + this.currentPage + ' .faceOffSlideDetails').css('height', 'inherit');
        var height = 0;
        $('#faceOffPage_' + this.currentPage + ' .faceOffSlideDetails').each(function () {
            if ($(this).height() > height) {
                height = $(this).height();
            }
        });
        $('#faceOffPage_' + this.currentPage + ' .faceOffSlideDetails').css('height', height + 'px');
        $('.faceOffCarouselCnt').css('height', $('#faceOffPage_' + this.currentPage + ' .faceOffSlide').height() + 15 + 'px');
    },
    
    //All action related to vote
    vote : function (imageNum) {      
        this.slides[imageNum].votes += 1;
        this.userVotes[imageNum] = 1;
        //Send data to database
        this.sendVote(imageNum);
        //Record votes in user cookie
        this.votesToCookie();
        //Send data to user's facebook wall
        this.publishToFBWall(imageNum);
        //Display vote result numbers
        this.displayVotes();
    },
       
    //sends vote to database
    sendVote : function (imageNum) {
        var that = this;
        $.ajax({
            dataType : 'jsonp',
            crossDomain : true,
            url : 'http://extension.cambio.com/faceoff/vote.php?faceoff=' + that.galleryId + '&image=' + imageNum,
            type : 'GET'
        });
    },
    
    //TODO send to user facebook wall for now suspended
    publishToFBWall : function (imageNum) {
        var message = 'I just voted for ' + this.slides[imageNum].title + '! ' + this.fbMessage;
        console.log('Send request to facebook - ' + message);
    }
    
};


$(function () {
    if ($('#lbBody .relatedTags').length) {
        cambioFaceOff.init();
    }
    $(cambioLightbox).on('cambio.lightbox.articleLoaded', function () {
        cambioFaceOff.init();
    });
});
