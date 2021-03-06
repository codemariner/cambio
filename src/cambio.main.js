(function ($) {

    $.cambio = {};

    $.cambio.setCookie = function (c_name, value, exdays, domainPath) {
        if (typeof(exdays) === 'undefined') {
            exdays = 365;
        }
        if (typeof(domainPath) === 'undefined') {
            domainPath = '';
        }
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value = escape(value) + ((exdays === null) ? "" : "; expires=" + exdate.toUTCString()) + domainPath;
        document.cookie = c_name + "=" + c_value;
    };
    
    $.cambio.getCookie = function (c_name) {
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
    };
    
    $.cambio.log = function (message) {
        if (console && typeof console.log === 'function') {
            console.log(message);
        }
    };

})(jQuery);
