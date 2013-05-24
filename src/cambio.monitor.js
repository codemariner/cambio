(function ($) {

    $.cambio.LoadMonitor = function (options) {
        this.condition = options.condition;
        this.callback = options.callback;
        this.interval = options.interval || 300;
        this.duration = options.duration || 10000;
        return this;
    };

    $.cambio.LoadMonitor.prototype = {
        interval: null,
        startTime: null,
        start: function () {
            this.startTime = new Date().getTime();

            var monitor = this;
            var handler = function () {
                $.cambio.log('checking');
                try {
                    var expr = monitor.condition();
                    if (expr) {
                        $.cambio.log('condition is true');
                        try {
                            monitor.callback();
                        } catch (f) {
                            $.cambio.log('LoadMonitor callback failure: ' + f);
                        } finally {
                            clearInterval(monitor.interval);
                            $.cambio.log('clearing interval');
                        }
                    }
                } catch (e) {
                    $.cambio.log(e);
                } finally {
                    monitor.checkInterval.call(monitor);
                }
            };

            monitor.interval = setInterval(handler, this.interval);
        },
        checkInterval: function () {
            var currentTime = new Date().getTime();
            if ((currentTime - this.startTime) > this.duration) {
                clearInterval(this.interval);
                $.cambio.log('clearing interval');
            }
        }
    };

})(jQuery);

