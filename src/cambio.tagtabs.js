var switchTagFilter = function (tagFilter) {
    console.log("I should switch to " + tagFilter);
};

$(function () {
    $('#tag-tabs ul li a').on('click', function (e) {
        e.preventDefault();
        var $this = $(this);
        var $parent = $this.parent('li');
        if ($parent.hasClass('active')) {
            return;
        }
        var tagFilter = $this.data('tag-filter');
        switchTagFilter(tagFilter);

        $parent.siblings('li.active').removeClass('active');
        $parent.addClass('active');
    });
});
