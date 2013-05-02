(function ($, window) {

    //  $.cambio.mm.trackAjax('http://foo/bar', {prop1: 'foo', prop2: 'bar'});

    /**
     * Cambio specific tracking.
     *
     * When using trackAjax, the original properties from s_265 will be
     * stored as data on $.cambio.mm as 's_265'. You can revert to those
     * properties with $.cambio.mm.revert().  Alternatively, you can do
     * this automatically for a call with $.cambio.mm.trackAjaxAndRevert().
     *
     */
    $.cambio.mm = {

        // For in-page ajax omniture calls, properties from omnitureConfig
        // will be set directly on s_265.
        //
        trackAjax: function (url, omnitureConfig) {
            var self = $.cambio.mm;

            // make sure we capture the very original omniture
            // configuration in case we needs it
            self._cloneOriginal();

            if (window.s_265) {
                // copy in any provided properties
                if (omnitureConfig) {
                    $.extend(window.s_265, omnitureConfig);
                }

                // now set the stuff for the ajax url
                window.s_265.prop12 = url;
                window.s_265.mmxcustom = url;
    
                window.s_265.t();
            }
            // beacon call
            if (window.bN_cfg) {
                window.bN.view();
            }
        },

        // makes tracking calls for ajax request and subsequently
        // reverts the omniture config to it's original settings
        trackAjaxAndRevert: function (url, omnitureConfig) {
            var self = $.cambio.mm;
            self.trackAjax(url, omnitureConfig);
            self.revert();
        },

        // revert s_265 to it's original configuration
        revert: function () {
            var self = $.cambio.mm;
            var orig = self.data('s_265');
            var s_265 = window.s_265;
            if (s_265 && orig) {
                // set original props
                for (var key in orig) {
                    s_265[key] = orig[key];
                }
                // remove new props
                for (key in s_265) {
                    if (!(key in orig)) {
                        var type = typeof s_265[key];
                        // only unset properties that seem to be
                        // configuration values
                        if (type === 'string' || type === 'number') {
                            s_265[key] = undefined;
                        }
                    }
                }
            }
        },

        // convenience accessor for data stored in $.cambio.mm.
        data: function (name, value) {
            return $.data.apply($, [$.cambio.mm, name, value]);
        },

        // this will capture the original omniture configuration once
        _cloneOriginal: function () {
            var self = $.cambio.mm;
            if (window.s_265) {
                var data = self.data('s_265');
                if (typeof data === 'undefined') {
                    data = {};
                    for (var key in window.s_265) {
                        var value = window.s_265[key];
                        // TODO: not actually sure if we should skip objects, 
                        // or even if this whole clone thing is kosher,
                        // but we're trying to copy off all of the
                        // configuration values.  Consider using specific
                        // properties like prop1, prop2, etc.
                        var type = typeof value;
                        if (type === 'string' || type === 'number') {
                            data[key] = window.s_265[key];
                        }
                    }
                    self.data('s_265', data);
                }
            }
        }
    };

})(jQuery, window);
