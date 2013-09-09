var switchTagBody = function (selector) {
    $('.tag-tab-body').hide();
    $(selector).show();
};

$(function () {
    $('#tag-tabs ul li a').on('click', function (e) {
        e.preventDefault();
        var $this = $(this);
        var $parent = $this.parent('li');
        if ($parent.hasClass('active')) {
            return;
        }
        var selector = $this.data('tag-body-selector');
        switchTagBody(selector);

        if ($this.data('comments')) {
            $('#social-comments-disabled').attr('id', 'post-comments');

            if (cambio.postComments.$commentsEl) {
                $('#post-comments').appendTo(this.$commentsEl);
            }
            setTimeout(function () {
                cambio.postComments.load();
            }, 500);

            var $el = $('#post-comments .fyre');
            if ($el.length) {
                cambio.postComments.$commentsEl = $el;
            }
            // just in case the comment stream was stopped, ask it to resume
            if (cambio.postComments.widget) {
                cambio.postComments.widget.resume();
            }
        }
        else {
            cambio.postComments.$commentsEl = $('#post-comments .fyre');
            if (cambio.postComments.widget) {
                cambio.postComments.widget.stop();
            }
            $('#post-comments').attr('id', 'social-comments-disabled');
        }

        $parent.siblings('li.active').removeClass('active');
        $parent.addClass('active');
    });
});
