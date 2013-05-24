(function ($) {

    $.cambio = {};

    $.cambio.log = function (message) {
        if (console && typeof console.log === 'function') {
            console.log(message);
        }
    };

})(jQuery);
