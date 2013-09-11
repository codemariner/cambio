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
    fbAppSecret : '21b6858f55e4f92245ab3087854488a5',
    
    //Initialize object and display it
    init : function () {
        //Check if faceoff elements on the page
        console.log('Faceoff init');
        //Check if hash set
        if (window.location.hash) {
            console.log(window.location.hash);
            this.currentPage = parseInt(window.location.hash.replace('#', ''), 10);
            console.log(this.currentPage);
        } 
        var that = this;
        if (this.getSlides()) {
            this.getVotes();
            this.getUserVotes();
            $(this).on('cambio.faceoff.gotVotes', function () {
                that.createPages();
                that.displayCurrentPage();
            });
            this.initButtons();
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
            console.log('Data');
            console.log(this.slides);
            return true;
        } else {
            return false;
        }
    },
    
    //Gets votes from external database
    getVotes : function () {
        var that = this;
        console.log('Requesting data');
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
                        console.log('Result into slides');
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
            console.log('Cookie');
            console.log(cookie);  
            this.userVotes = JSON.parse(cookie);
            console.log(this.userVotes);
        }
    },    
    
    //Saves vote into user cookie
    voteToCookie : function (imageNum) {
        this.userVotes[imageNum] = 1;
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
        $('.faceOffPage:visible').fadeOut(this.animationSpeed, function () {
            that.displayCurrentPage();
        });
        
    },
    
    //Displays page pointed by internal data
    displayCurrentPage : function () {
        if ($('#faceOffPage_' + this.currentPage).length) {
            $('#faceOffPage_' + this.currentPage).fadeIn(this.animationSpeed); 
        } else {
            var h = '<li><div class="faceOffPage" id="faceOffPage_' + this.currentPage + '">';
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
            h += '</div></li>';
            $('#faceOff_' + this.galleryId + ' .faceOffPages').append(h);
            //If user didn't vote
            if (voted === 0) {
                //Add vote buttons
                for (i = 0; i < this.pages[this.currentPage].length; i++) {
                    slide = this.pages[this.currentPage][i];
                    $('#faceOffSlide_' + this.slides[slide].index + ' .faceOffSlideDetails').prepend('<a href="#" id="voteButton_' + this.slides[slide].index + '" class="voteButton">Vote!</a>');
                }
                //Add actions to button
                var that = this;
                $('#faceOffPage_' + this.currentPage + ' .voteButton').click(function (event) {
                    event.preventDefault();
                    that.vote($(this).attr('id').replace('voteButton_', ''));
                });    
            } else {
                //Display votes
                this.displayVotes(votedForImage, 0);
            }
        }
        //Update page counter
        $('#faceOff_' + this.galleryId + ' .faceOffCounter .num').html(this.currentPage + 1);
        //Update URL (add hash)
        window.location.hash = '#' + this.currentPage;
        console.log('Equalize box');
        this.equalizeImageBoxes();
    },
    
    //Displays votes on current page after vote
    displayVotes : function (imageNum) { 
        $('#faceOffPage_' + this.currentPage + ' .voteButton').remove();
        $('#faceOffPage_' + this.currentPage + ' #faceOffSlide_' + imageNum + ' .faceOffSlideDetails').prepend('<div class="voted">VOTED!</div>'); 
        var i = 0;
        var slide = 0;
        var votes = 0;
        var vWord = '';
        for (i = 0; i < this.pages[this.currentPage].length; i++) {
            slide = this.pages[this.currentPage][i];
            votes = this.slides[slide].votes;
            vWord = 'votes';
            if (votes === 1) {
                vWord = 'vote';
            }
            $('#faceOffPage_' + this.currentPage + ' #faceOffSlide_' + slide + ' .faceOffSlideDetails').append('<div class="votes">' + votes + ' ' + vWord + '</div>'); 
        }
        this.equalizeImageBoxes();
    },
    
    //Sets the same height for imageBoxes on current page
    equalizeImageBoxes : function () {
        console.log('Equalizing image boxes');
        $('#faceOffPage_' + this.currentPage + ' .faceOffSlideDetails').css('height', 'inherit');
        var height = 0;
        $('#faceOffPage_' + this.currentPage + ' .faceOffSlideDetails').each(function () {
            if ($(this).height() > height) {
                height = $(this).height();
            }
        });
        console.log(height);
        $('#faceOffPage_' + this.currentPage + ' .faceOffSlideDetails').css('height', height + 'px');
    },
    
    //All action related to vote
    vote : function (imageNum) {      
        this.slides[imageNum].votes += 1;
        //Send data to database
        this.sendVote(imageNum);
        //Record action in user cookie
        this.voteToCookie(imageNum);
        //Send data to user's facebook wall
        this.publishToFBWall(imageNum);
        //Display vote result numbers
        this.displayVotes(imageNum, 1);
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
    
    //TODO send to user facebook wall
    publishToFBWall : function (imageNum) {
        var message = 'I just voted for ' + this.slides[imageNum].title + '! ' + this.fbMessage;
        window.alert('Send request to facebook - ' + message);
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
