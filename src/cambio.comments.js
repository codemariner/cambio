(function ($, cambio, cambioLightbox) {
    "use strict";

    cambio.postComments = {
        init: function () {
            var $lightbox = $(cambioLightbox);

            var _this = this;

            // actually need to wait until the fyre.conv.login is
            // available which will only happen after it loads
            _this.convLoad = $.Deferred();
            var convTimer = setInterval(function () {
                if (fyre.conv.login) {
                    _this.convLoad.resolve();
                    clearInterval(convTimer);
                }
            }, 300);

            $lightbox.on('cambio.lightbox.beforeClose', function () {
                // article is being closed so make sure we save the
                // livefyre comments widget and have it stop pulling the stream
                _this.$commentsEl = $('#post-comments .fyre');
                //if (_this.widget) {
                //    _this.widget.stop();
                //}
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
                setTimeout(function () {
                    cambio.postComments.load();
                }, 500);
            });
            $('#login').multiAuth({
                devId: 'ao10o7QIR1Y5IvQh',
                tabs: ['facebook', 'twitter', 'google'],
                getTokenCallback: function (json) {
                    var token = $.cookie('lft');
                    if (json.response && 
                        json.response.data && 
                        json.response.data.userData) {

                        if (typeof token === 'undefined' || token === null) {
                            _this._fyreLogin(json.response.data);
                        } else {
                            _this.convLoad.done(function () {
                                fyre.conv.login(token);
                                if (cambio.postComments.handlers) {
                                    cambio.postComments.handlers.success();
                                }
                            });
                        }
                    } else {
                        if ($.cookie('lft')) {
                            _this.convLoad.done(function () {
                                if (fyre.conv.logout) {
                                    fyre.conv.logout();
                                }
                            });
                        }
                    }
                }
            });
        },
        _fyreLogin: function (data) {
            var tokenFetch = $.Deferred();
            var _this = this;
            var userData = data.userData;
            var expires = data.token.expiresIn;
            tokenFetch.done(function (token) {
                $.cookie('lft', token);
                _this.convLoad.done(function () {
                    fyre.conv.login(token);
                    if (cambio.postComments.handlers) {
                        cambio.postComments.handlers.success();
                    }
                });
            });

            $.ajax({
                url: '/livefyre-auth-token',
                type: 'post',
                cache: false,
                data: {user_id: userData.attributes.loginId, display_name: userData.attributes.displayName, image_url: userData.attributes.pictureUrl, expires: expires},
                error: function () {
                    tokenFetch.reject();
                },
                success: function (data) {
                    tokenFetch.resolve(data.token);
                }
            });
        },
        _fyreOnLoad: function (widget) {
            cambio.postComments.widget = widget;
        },
        $commentsEl: null,
        load: function () {
            var _this = this;
            if ($('#post-comments').length === 0) {
                return;
            }
            if (fyre && fyre.conv) {
                var config = cambio.postComments.getConfig();
                if (cambio.postComments.widget) {
                    cambio.postComments.widget.changeCollection(config['config']);
                } else {
                    var authDelegate = new fyre.conv.RemoteAuthDelegate();
                    authDelegate.login = function (handlers) {
                        cambio.postComments.handlers = handlers;
                        $('#login').click();
                    };
                    authDelegate.logout = function (handlers) {
                        var lft = $.cookie('lft');
                        if (lft) {
                            $.removeCookie('lft');
                            $('#login').click();
                        }
                        handlers.success();
                    };
                    config['global']['authDelegate'] = authDelegate;
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
                    config: {collectionMeta: collectionMeta,
                             checksum: checksum,
                             siteId: siteId,
                             articleId: articleId + "",
                             el: 'post-comments'}
            };
        }
    };

}) (jQuery, cambio, cambioLightbox);
