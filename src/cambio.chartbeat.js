var cambioCB = {
    elem : null,
    positions : null,
    newData : [],
    oldData : [],
    animationSpeed : 1000,
    timeGap : 15000,
    timeout : null,
    elementsPrepared : 0,
    
    getOldData : function () {
        this.oldData = this.getHotData(this.elem);
    },
    
    getNewDataAndReplace : function () {
        if (this.elem !== null) {
            this.prepareElements();
            this.getOldData();
            var that = this;
            $.ajax({
                url : '/chartbeat/',
                type : 'GET',
                success : function (code) {
                    var tmp = document.createElement('DIV');
                    tmp.innerHTML = code;
                    that.newData = that.getHotData(tmp);  
                    if (that.newData && that.oldData) {
                        that.replaceHot();
                        that.timeout = window.setTimeout(function () {that.getNewDataAndReplace(); }, that.timeGap);
                    }
                }
            });
        }
    },
    
    removeElement : function (elemClass) {
        $(this.elem).find('.' + elemClass).slideUp(this.animationSpeed, function () {
            $(this).remove();
        });
    },
    
    replaceHot : function () {
        //Remove an old articles
        var i = 0;
        var j = 0;
        var isIn = 0;
        var that = this;
        for (i = 0; i < this.oldData.length; i++) {
            isIn = 0;
            for (j = 0; j < this.newData.length; j++) {
                if (this.oldData[i].id === this.newData[j].id) {
                    isIn = 1;
                    break;
                }
            }
            if (isIn === 0) {
                this.removeElement('hot_' + this.oldData[i].id);
            }
        }
        
        for (i = 0; i < this.newData.length; i++) {
            //Check if element on the list already
            if ($(this.elem).find('.hot_' + this.newData[i].id).length) {
                $(this.elem).find('.hot_' + this.newData[i].id + ' .number').html(i + 1);
                $(this.elem).find('.hot_' + this.newData[i].id).animate({'top' : that.positions[i] + 'px'}, this.animationSpeed);
            } else {
                //Place it 
                $(document.createElement('li')).html(this.newData[i].code).addClass('hot_' + this.newData[i].id).css('display', 'none').css('position', 'absolute').css('top', this.positions[i] + 'px').appendTo($(this.elem).find('ul'));
                $(this.elem).find('.hot_' + this.newData[i].id).slideDown(this.animationSpeed);
            }
        }
    },
    
    //Gets data from hot list
    getHotData : function (elem) {
        if ($(elem).find('li').length) {
            var data = [];
            $(elem).find('li').each(function (i) {
                data[i] = {
                    id : $(this).attr('class').replace('hot_', ''),
                    code : $(this).html()
                };
            });
            return data;
        } else {
            return false;
        }
    },
    
    prepareElements : function () {
        if (this.elementsPrepared === 0) {
            var i = 0;
            var elemList = [];
            this.positions = [];
            var that = this;
            $(this.elem).css('position', 'relative');
            $(this.elem).find('li').each(function (index) {
                elemList[index] = $(this);
                that.positions[index] = $(this).position().top;
                //$(this).css('top', that.positions[index] + 'px');
                //$(this).css('left', '0px');
               
            });
            
            for (i = 0; i < elemList.length; i++) {
                $(elemList[i]).css('top', this.positions[i] + 'px');
                $(elemList[i]).css('left', '0px'); 
                $(elemList[i]).css('position', 'absolute'); 
                   
            }
            this.positions.sort(function (a, b) {return a - b; });
            //If position 7 not set create it
            if (typeof(that.positions[6]) === 'undefined') {
                that.positions[6] = that.positions[5] +  that.positions[5] - that.positions[4];
            }
            this.elementsPrepared = 1;  
        } 
    },
    
    init : function () {
        this.elem = null;
        this.elementsPrepared = 0;
        if (this.timeout !== null) {
            window.clearTimeout(this.timeout);
            this.timeout = null;
        }
        if ($('#lbContent .whatsHotCB').length) {
            this.elem = $('#lbContent .whatsHotCB').eq(0); 
        } else {
            if ($('#secondary .whatsHotCB').length) {
                this.elem = $('#secondary .whatsHotCB').eq(0);
            }
        }
        if (this.elem !== null) {
            var that = this;
            this.timeout = window.setTimeout(function () {that.getNewDataAndReplace(); }, this.timeGap);
        }
    }
    
};
$(function () {
    cambioCB.init();    
    $(cambioLightbox).on('cambio.lightbox.articleLoadedAnimationEnded', function () {
        cambioCB.init();        
    });    
    $(cambioLightbox).on('cambio.lightbox.afterClose', function () {
        cambioCB.init();        
    });
});