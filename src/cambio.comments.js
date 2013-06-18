(function ($, cambio, cambioLightbox) {
    "use strict";

    cambio.postComments = {
        init: function () {
            var $lightbox = $(cambioLightbox);

            var _this = this;

            $lightbox.on('cambio.lightbox.beforeClose', function () {
                // article is being closed so make sure we save the
                // livefyre comments widget and have it stop pulling the stream
                _this.$commentsEl = $('#post-comments .fyre');
                if (_this.widget) {
                    _this.widget.stop();
                }
            });

            $lightbox.on('cambio.lightbox.afterOpen', function () {
                // an 'open' has occurred but we don't know if an article
                // is already open or not. This open event is a trigger for
                // any article load.  If we find the livefyre
                // element, then it has already been loaded, so go ahead
                // and store a reference to it so we can add it to the incoming article
                var $el = $('#post-comments .fyre');
                if ($el.length) {
                    _this.$commentsEl = $el;
                }
                // just in case the comment stream was stopped, ask it to resume
                if (_this.widget) {
                    _this.widget.resume();
                }
            });
            $lightbox.on('cambio.lightbox.articleLoaded', function () {
                if (_this.$commentsEl) {
                    $('#post-comments').appendTo(this.$commentsEl);
                }
                _this.load();
            });
        },
        _fyreOnLoad: function (widget) {
            cambio.postComments.widget = widget;
        },
        $commentsEl: null,
        load: function () {
            if ($('#post-comments').length === 0) {
                return;
            }
            if (fyre && fyre.conv) {
                var config = cambio.postComments.getConfig();
                if (cambio.postComments.widget) {
                    cambio.postComments.widget.changeCollection(config['config']);
                } else {
                    fyre.conv.load(config['global'], [config['config']], cambio.postComments._fyreOnLoad);
                }
            }
        },
        getConfig: function () {
            var $el = $('#post-comments');
            var siteId = $el.data('site-id');
            var network = $el.data('network');
            var title = $el.data('title');
            var tags = $el.data('tags');
            var articleId = $el.data('article-id');
            var url = $el.data('post-url');
            var collectionMeta = $el.data('collectionmeta');
            var checksum = $el.data('checksum');
            return {global: {network: network},
                    config: {el: 'post-comments',
                         siteId: siteId,
                         network: network,
                         title: title,
                         tags: tags,
                         articleId: articleId,
                         checksum: checksum,
                         collectionMeta: collectionMeta,
                         signed: true}
            };
        }
    };

}) (jQuery, cambio, cambioLightbox);




