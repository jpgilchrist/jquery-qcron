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
(function ($) {
    function setup () {
        $.widget("jpgilchrist.qcron", {
           options: {
               
           },
            
            _create: function (options) {
                $.extend(this.options, options);
                
                this._on(this.element, {
                
                });
            },
            
            _init: function () {
                $(this.element).html("<span>Hello World!</span>");
            }
        });
    }
    
    if (typeof define === 'function' && define.amd && define.amd.jQuery) {
        define(['jquery'], setup);
    } else {
        setup(jQuery);
    }
    
})(jQuery);