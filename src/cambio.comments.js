(function ($, cambio) {
    "use strict";

    cambio.postComments = {
        init: function (config) {
            var defaultOpts = {
                el: 'post-comments',
                signed: false
            };
            $.extend(defaultOpts, config);
            this.opts = defaultOpts;
        },
        fyreOnLoad: function (widget) {
            cambio.debug('');
            cambio.postComments.widget = widget;
        },
        changeCollection: null,
        load: function (articleId, opts) {
            if ($('#post-comments').length === 0) {
                return;
            }
            var defaultOpts = {collectionMeta: { articleId: articleId, url: fyre.conv.load.makeCollectionUrl()}};
            $.extend(defaultOpts, this.opts);
            var _opts = $.extend(defaultOpts, opts);
            window._opts = _opts;
            if (fyre && fyre.conv) {
                if (this.widget) {
                    this.widget.changeCollection(_opts);
                } else {
                    fyre.conv.load({}, [_opts], this.fyreOnLoad);
                }
            }
        }
    };

}) (jQuery, cambio);




