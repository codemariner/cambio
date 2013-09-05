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

        $parent.siblings('li.active').removeClass('active');
        $parent.addClass('active');
    });
});
