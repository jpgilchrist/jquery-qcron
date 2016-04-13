/*!
 * jquery-cron
 * Version 0.0.0
 * 
 * Copyright (c) 2016 James P. Gilchrist
 *
 * MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 */

/* global jQuery:true */
/* global define:true */
/* jshint curly:false */
(function ($) {
    function setup () {
        $.widget("jpgilchrist.qcron", {
            options: {
                initial: "0 0/2 * 1/1 * ? *"
            },
            
            __periods: ["minute(s)", "hour(s)", "day(s)", "week(s)", "month(s)", "year(s)"],
            __weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            __months: ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            
            __tabsTemplate: "<div id='qcron-periods'>" +
                "<ul>" +
                "<li><a href='#qcron-minutes'>Minutes</a></li>" +
                "</ul>" +
                "<div id='qcron-minutes'>minutes</div></div>",
            
            _create: function (options) {
                $.extend(this.options, options);
                
                this._on(this.element, {
                
                });
            },
            
            _init: function () {
                this.$element = $(this.element);
                this.$element.empty();
                
                this.$qcronInputs = $(this.__tabsTemplate).tabs();
                this.$qcronPreview = $("<div class='qcron-preview'></div>");
                
                this.$element.append(this.$qcronInputs).append(this.$qcronPreview);
                
                this._renderInputs();
                this._renderPreview();
            },
            
            _renderInputs: function (expression) {
//                var self = this;
//                
//                if (!!expression)
//                    expression = this.options.initial;
//                
//                this.$period = $("<span>Every <input type='number' min='1'></input> <select></select></span>");
//                $.each(this.__periods, function (i, period) {
//                    $("select", self.$period)
//                        .append($("<option value='" + i + "'>" + period + "</option>"));
//                });
                                
                this.$qcronInputs.append(this.$period);
            },
            
            _renderPreview: function () {
                this.$qcronPreview.html("<span>preview</span>");
            }
        });
    }
    
    if (typeof define === 'function' && define.amd && define.amd.jQuery) {
        define(['jquery'], setup);
    } else {
        setup(jQuery);
    }
    
})(jQuery);