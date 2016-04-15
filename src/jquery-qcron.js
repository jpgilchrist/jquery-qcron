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
                initial: "0 0/4 * 1/1 * ? *",
                minute: true,
                hour: true,
                day: true,
                week: true,
                month: true,
                year: true,
                preview: true
            },
            
            __periods: {
                1: {
                    display: "minute",
                    value: 1
                },
                2: {
                    display: "hour",
                    value: 2
                },
                3: {
                    display: "day",
                    value: 3
                },
                4: {
                    display: "week",
                    value: 4
                },
                5: {
                    display: "month",
                    value: 5
                }, 
                6: {
                    display: "year",
                    value: 6
                }
            },
            
            __weekdays: {
                1: {
                    display: "Sunday",
                    value: "SUN"
                }, 
                2: {
                    display: "Monday",
                    value: "MON"
                }, 
                3 : {
                    display: "Tuesday",
                    value: "TUE"
                }, 
                4: {
                    display: "Wednesday",
                    value: "WED"
                }, 
                5: {
                    display: "Thursday",
                    value: "THU"
                }, 
                6: {
                    display: "Friday",
                    value: "FRI"
                }, 
                7: {
                    display: "Saturday",
                    value: "SAT"
                }
            },
            __weeks: {
                1: {
                    display: "First",
                    value: 1
                },
                2: {
                    display: "Second",
                    value: 2
                },
                3: {
                    display: "Third",
                    value: 3
                },
                4: {
                    display: "Fourth",
                    value: 4
                }
            },
            __months: {
                1: {
                    display: "January",
                    value: "JAN",
                    days: 31
                },
                2: {
                    display: "February",
                    value: "FEB",
                    days: 29
                },
                3: {
                    display: "March",
                    value: "MAR",
                    days: 31
                },
                4: {
                    display: "April",
                    value: "APR",
                    days: 30
                },
                5: {
                    display: "May",
                    value: "MAY",
                    days: 31
                },
                6: {
                    display: "June",
                    value: "JUN",
                    days: 30
                },
                7: {
                    display: "July",
                    value: "JUL",
                    days: 31
                },
                8: {
                    display: "August",
                    value: "AUG",
                    days: 31
                },
                9: {
                    display: "September",
                    value: "SEP",
                    days: 30
                },
                10: {
                    display: "October",
                    value: "OCT",
                    days: 31
                },
                11: {
                    display: "November",
                    value: "NOV",
                    days: 30
                },
                12: {
                    display: "December",
                    value: "DEC",
                    days: 31
                }
            },
            
            __controlsTemplate: "<div class='qcron-controls'><ul></ul></div>",
            __previewTemplate: "<div class='qcron-preview'></div>",
            
            _create: function (options) {
                $.extend(this.options, options);
                
                this._on(this.element, {
                    "qcron:expression": function () {
                        console.log('expression', this.expression);
                        this._renderPreview();
                    },
                    "change input, select": function () {
                    }
                });
            },
            
            _init: function () {
                this.$element = $(this.element);
                this.$element.empty();
                
                this.$qcronControls = $(this.__controlsTemplate);
                this.$element.append(this.$qcronControls);
                
                if (this.options.preview) {
                    this.$qcronPreview = $(this.__previewTemplate);
                    this.$element.append(this.$qcronPreview);
                }
                
                this._renderInputs();
            },
            
            _renderInputs: function () {
                if (this.options.minute)
                    this._renderMinutesTab();
                if (this.options.hour)
                    this._renderHourlyTab();
                if (this.options.day)
                    this._renderDailyTab();
                if (this.options.week)
                    this._renderWeeklyTab();
                if (this.options.month)
                    this._renderMonthlyTab();
                if (this.options.year)
                    this._renderYearlyTab();

                var self = this;
                this.$qcronControls.tabs({
                    activate: function () {
                        
                    }
                });
            },
            
            _renderPreview: function () {
                var expression = !!this.expression ? this.expression : this.options.initial;
                this.$qcronPreview.html("<span>" + expression + "</span>");
            },
            
            __minutesTabItemTemplate: "<li><a href='#qcron-minutes-tab'>Minutes</a></li>",
            __minutesTabBodyTemplate: "<div id='qcron-minutes-tab'></div>",
            _renderMinutesTab: function () {
                this.$qcronControls.find("ul").append($(this.__minutesTabItemTemplate));
                var $minutesTab = $(this.__minutesTabBodyTemplate).qcronMinutesTab();
                this.$qcronControls.append($minutesTab);
            },

            __hourlyTabItemTemplate: "<li><a href='#qcron-hourly-tab'>Hourly</a></li>",
            __hourlyTabBodyTemplate: "<div id='qcron-hourly-tab'></div>",
            _renderHourlyTab: function () {
                this.$qcronControls.find("ul").append($(this.__hourlyTabItemTemplate));
                var $hourlyTab = $(this.__hourlyTabBodyTemplate).qcronHourlyTab();
                this.$qcronControls.append($hourlyTab);
            },

            __dailyTabItemTemplate: "<li><a href='#qcron-daily-tab'>Daily</a></li>",
            __dailyTabBodyTemplate: "<div id='qcron-daily-tab'></div>",
            _renderDailyTab: function () {
                this.$qcronControls.find("ul").append($(this.__dailyTabItemTemplate));
                var $dailyTab = $(this.__dailyTabBodyTemplate).qcronDailyTab();
                this.$qcronControls.append($dailyTab);
            },

            __weeklyTabItemTemplate: "<li><a href='#qcron-weekly-tab'>Weekly</a></li>",
            __weeklyTabBodyTemplate: "<div id='qcron-weekly-tab'></div>",
            _renderWeeklyTab: function () {
                this.$qcronControls.find("ul").append($(this.__weeklyTabItemTemplate));
                var $weeklyTab = $(this.__weeklyTabBodyTemplate).qcronWeeklyTab();
                this.$qcronControls.append($weeklyTab);
            },

            __monthlyTabItemTemplate: "<li><a href='#qcron-monthly-tab'>Monthly</a></li>",
            __monthlyTabBodyTemplate: "<div id='qcron-monthly-tab'></div>",
            _renderMonthlyTab: function () {
                this.$qcronControls.find("ul").append($(this.__monthlyTabItemTemplate));
                var $monthlyTab = $(this.__monthlyTabBodyTemplate).qcronMonthlyTab();
                this.$qcronControls.append($monthlyTab);
            },

            __yearlyTabItemTemplate: "<li><a href='#qcron-yearly-tab'>Yearly</a></li>",
            __yearlyTabBodyTemplate: "<div id='qcron-yearly-tab'></div>",
            _renderYearlyTab: function () {
                this.$qcronControls.find("ul").append($(this.__yearlyTabItemTemplate));
                var $yearlyTab = $(this.__yearlyTabBodyTemplate).qcronYearlyTab();
                this.$qcronControls.append($yearlyTab);
            },
            
            /*
             *
             * Helper Utility Functions
             * 
             */
            __twodigitformat: function (num) {
                return ("0" + num).slice(-2);
            },
            
            __expression: function (seconds, minutes, hours, dom, month, dow, year) {
                seconds = (""+seconds).trim();
                minutes = (""+minutes).trim();
                hours = (""+hours).trim();
                dom = (""+dom).trim();
                month = (""+month).trim();
                dow = (""+dow).trim();
                year = !!year ? (""+year).trim() : year;
                                
                if (!!year)
                    return (seconds + " " + minutes + " " + hours + " " + dom + " " + month + " " + dow + " " + year).trim();
                return (seconds + " " + minutes + " " + hours + " " + dom + " " + month + " " + dow).trim();
            }
        });
        
        
        $.widget("jpgilchrist.qcronMinutesTab", {
            options: {
                changed: function (value) {
                    console.log(value);
                }
            },
            _create: function (options) {
                $.extend(this.options, options);
                
                this.$element = $(this.element);
                
                if (!!this.options.expression)
                    this.build(null, this.options.expression);
                
                this._on({
                   "change": this.build 
                });
            },
            _init: function () {
                this.$minuteSelect = $("<select class='qcron-minute-select'></select>");
                this.$minuteStartSelect = $("<select class='qcron-minutestart-select'></select>");
                
                for (var i = 0; i < 60; i++) {
                    if (i > 0)
                        this.$minuteSelect.append("<option value='" + i + "'>" + i + "</option>");
                    this.$minuteStartSelect.append("<option value='" + i + "'>" + i + "</option>");
                }
                
                this.$element.append("<span>Every</span>");
                this.$element.append(this.$minuteSelect);
                this.$element.append("<span>minute(s) starting at</span>");
                this.$element.append(this.$minuteStartSelect);
                this.$element.append("minute(s) past the hour.");
                
                this.build();
            },
            
            build: function (event, value) {
                if (!!value)
                    this.expression = value;
                else
                    this.expression = "0 " + this.$minuteStartSelect.val() + "/" + this.$minuteSelect.val() + " * * * ? *";
                
                if (!!this.options.changed)
                    this.options.changed.call(this, this.expression);
            }
        });
        
        $.widget("jpgilchrist.qcronHourlyTab", {
            options: {
                changed: function (value) {
                    console.log(value);
                }
            },
            _create: function (options) {
                $.extend(this.options, options);  
                
                this.$element = $(this.element);

                if (!!this.options.expression)
                    this.build(null, this.options.expression);

                this._on({
                    "change": this.build 
                });
            },
            _init: function () {
                this.$hourSelect = $("<select class='qcron-hour-select'></select>");
                this.$hourStartSelect = $("<select class='qcron-hourstart-select'></select>");
                this.$minuteStartSelect = $("<select class='qcron-minutestart-select'></select>");

                for (var i = 0; i < 60; i++) {
                    if (i > 0 && i < 24)
                        this.$hourSelect.append("<option value='" + i + "'>" + i + "</option>");
                    if (i < 24)
                        this.$hourStartSelect.append("<option value='" + i + "'>" + twodigitformat(i) + "</option>");
                    this.$minuteStartSelect.append("<option value='" + i + "'>" + twodigitformat(i) + "</option>");
                }

                this.$element.append("<span>Every</span>");
                this.$element.append(this.$hourSelect);
                this.$element.append("<span>hour(s) starting at</span>");
                this.$element.append(this.$hourStartSelect);
                this.$element.append("<span>:</span>");
                this.$element.append(this.$minuteStartSelect);
                
                this.build();
            },
            build: function (event, value) {
                if (!!value)
                    this.expression = value;
                else
                    this.expression = "0 " + this.$minuteStartSelect.val() + " " + this.$hourStartSelect.val() + "/" + this.$hourSelect.val() + " * * ? *";

                if (!!this.options.changed)
                    this.options.changed.call(this, this.expression);
            }
            
        });
        
        $.widget("jpgilchrist.qcronDailyTab", {
            options: {
                changed: function (value) {
                    console.log(value);
                }
            },
            _create: function (options) {
                $.extend(this.options, options);  
                
                this.$element = $(this.element);

                if (!!this.options.expression)
                    this.build(null, this.options.expression);

                this._on({
                    "change": this.build 
                });
            },
            _init: function () {
                $(this.element).html("<span>Hello Days!</span>");
            },
            build: function (event, value) {
                if (!!value)
                    this.expression = value;
                else
                    this.expression = "0 " + this.$minuteStartSelect.val() + "/" + this.$minuteSelect.val() + " * * * ? *";

                if (!!this.options.changed)
                    this.options.changed.call(this, this.expression);
            }
        });
        
        $.widget("jpgilchrist.qcronWeeklyTab", {
            options: {
                changed: function (value) {
                    console.log(value);
                }
            },
            _create: function (options) {
                $.extend(this.options, options);  
                
                this.$element = $(this.element);

                if (!!this.options.expression)
                    this.build(null, this.options.expression);

                this._on({
                    "change": this.build 
                });
            },
            _init: function () {
                $(this.element).html("<span>Hello Weeks!</span>");
            },
            build: function (event, value) {
                if (!!value)
                    this.expression = value;
                else
                    this.expression = "0 " + this.$minuteStartSelect.val() + "/" + this.$minuteSelect.val() + " * * * ? *";

                if (!!this.options.changed)
                    this.options.changed.call(this, this.expression);
            }
        });
        
        $.widget("jpgilchrist.qcronMonthlyTab", {
            options: {
                changed: function (value) {
                    console.log(value);
                }
            },
            _create: function (options) {
                $.extend(this.options, options);  
                
                this.$element = $(this.element);

                if (!!this.options.expression)
                    this.build(null, this.options.expression);

                this._on({
                    "change": this.build 
                });
            },
            _init: function () {
                $(this.element).html("<span>Hello Months!</span>");
            },
            build: function (event, value) {
                if (!!value)
                    this.expression = value;
                else
                    this.expression = "0 " + this.$minuteStartSelect.val() + "/" + this.$minuteSelect.val() + " * * * ? *";

                if (!!this.options.changed)
                    this.options.changed.call(this, this.expression);
            }
        });
        
        $.widget("jpgilchrist.qcronYearlyTab", {
            options: {
                changed: function (value) {
                    console.log(value);
                }
            },
            _create: function (options) {
                $.extend(this.options, options);  
                
                this.$element = $(this.element);

                if (!!this.options.expression)
                    this.build(null, this.options.expression);

                this._on({
                    "change": this.build 
                });
            },
            _init: function () {
                $(this.element).html("<span>Hello Years!</span>");
            },
            build: function (event, value) {
                if (!!value)
                    this.expression = value;
                else
                    this.expression = "0 " + this.$minuteStartSelect.val() + "/" + this.$minuteSelect.val() + " * * * ? *";

                if (!!this.options.changed)
                    this.options.changed.call(this, this.expression);
            }
        });
                    
        function twodigitformat (num) {
            return ("0" + num).slice(-2);
        }
    }
    
    if (typeof define === 'function' && define.amd && define.amd.jQuery) {
        define(['jquery'], setup);
    } else {
        setup(jQuery);
    }
    
})(jQuery);