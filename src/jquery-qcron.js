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
            
            __controlsTemplate: "<div class='qcron-controls'></div>",
            __previewTemplate: "<div class='qcron-preview'></div>",
            
            _create: function (options) {
                $.extend(this.options, options);
                
                this._on(this.element, {
                    "qcron:expression": function () {
                        console.log('expression', this.expression);
                        this._renderPreview();
                    },
                    "change input, select": function () {
                        this._buildCronExpression();
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
                var self = this;
                
                this.$periodPrefix = $("<span>Every </span>").appendTo(this.$qcronControls);
                this.$period = $("<select class='qcron-period-select'></select>").appendTo(this.$qcronControls);
                this.$periodSuffix = $("<span></span>").appendTo(this.$qcronControls);
                
                $.each(this.__periods, function (key, period) {
                    if (!!self.options[period.display])
                        self.$period.append("<option value='" + key + "'>" + period.display + "</option>");
                });
                
                this.$dayOfWeek = $("<select class='qcron-dow-select' multiple></select>").appendTo(this.$qcronControls);
                this.$dayOfWeekSuffix = $("<span class='qcron-dow-suffix'></span>").appendTo(this.$qcronControls);
                
                $.each(this.__weekdays, function (key, weekday) {
                   self.$dayOfWeek.append("<option value='" + key + "'>" + weekday.display + "</option>"); 
                });
                
                this.$month = $("<select class='qcron-month-select'></select>").appendTo(this.$qcronControls);
                this.$monthSuffix = $("<span class='qcron-month-suffix'></span>").appendTo(this.$qcronControls);
                
                $.each(this.__months, function (key, month) {
                    self.$month.append("<option value='" + key + "'>" + month.display + "</option>"); 
                });
                
                this.$dayOfMonth = $("<select class='qcron-dom-select'></select>").appendTo(this.$qcronControls);
                this.$dayOfMonthSuffix = $("<span class='qcron-dom-suffix'></span>").appendTo(this.$qcronControls);
                
                this.$month.on('change', function () {
                    var dom = parseInt(self.$dayOfMonth.val()) || 1,
                        month = self.__months[$(this).val()];
                    
                    self.$dayOfMonth.empty();
                    for (var i = 1; i <= month.days; i++) {
                        self.$dayOfMonth.append("<option value='" + i + "'>" + i + "</option>");
                    }
                    self.$dayOfMonth.val(dom <= month.days ? dom : month.days); 
                });
                this.$month.trigger('change');
                
                this.$hour = $("<select class='qcron-hour-select'></select>").appendTo(this.$qcronControls);
                this.$hourSuffix = $("<span class='qcron-hour-suffix'></span>").appendTo(this.$qcronControls);
                
                this.$minute = $("<select class='qcron-minute-select'></select>").appendTo(this.$qcronControls);
                this.$minuteSuffix = $("<span class='qcron-minute-suffix'></span>").appendTo(this.$qcronControls);
                
                var i;
                for (i = 0; i < 24; i++) {
                    this.$hour.append("<option value='" + i + "'>" + this.__twodigitformat(i) + "</option>");
                }
                
                for (i = 0; i < 59; i++) {
                    this.$minute.append("<option value='" + i + "'>" + this.__twodigitformat(i) + "</option>");
                }
                
                this.$period.on('change', function () {
                    var period = self.__periods[$(this).val()];
                    self.$qcronControls.attr('class', 'qcron-controls qcron-'+period.display+'-selected');
                    
                    switch(period.display) {
                        case "minute":
                            self.$periodSuffix.text("");
                            self.$dayOfWeekSuffix.text("");
                            self.$monthSuffix.text("");
                            self.$dayOfMonthSuffix.text("");
                            self.$hourSuffix.text(":");
                            self.$minuteSuffix.text("");
                            break;
                        case "hour":
                            self.$periodSuffix.text(" at ");
                            self.$dayOfWeekSuffix.text("");
                            self.$monthSuffix.text("");
                            self.$dayOfMonthSuffix.text("");
                            self.$hourSuffix.text(":");
                            self.$minuteSuffix.text(" minutes past the hour.");
                            break;
                        case "day":
                            self.$periodSuffix.text(" at ");
                            self.$dayOfWeekSuffix.text("");
                            self.$monthSuffix.text("");
                            self.$dayOfMonthSuffix.text("");
                            self.$hourSuffix.text(":");
                            self.$minuteSuffix.text("");
                            break;
                        case "week":
                            self.$periodSuffix.text(" on ");
                            self.$dayOfWeekSuffix.text(" at ");
                            self.$monthSuffix.text("");
                            self.$dayOfMonthSuffix.text("");
                            self.$hourSuffix.text(":");
                            self.$minuteSuffix.text("");
                            break;
                        case "month":
                            self.$periodSuffix.text(" on the ");
                            self.$dayOfWeekSuffix.text("");
                            self.$monthSuffix.text("");
                            self.$dayOfMonthSuffix.text(" at ");
                            self.$hourSuffix.text(":");
                            self.$minuteSuffix.text("");
                            break;
                        case "year":
                            self.$periodSuffix.text(" on ");
                            self.$dayOfWeekSuffix.text("");
                            self.$monthSuffix.text("");
                            self.$dayOfMonthSuffix.text(" at ");
                            self.$hourSuffix.text(":");
                            self.$minuteSuffix.text("");
                            break;
                    }
                }).trigger('change');   
            },
            
            _renderPreview: function () {
                var expression = !!this.expression ? this.expression : this.options.initial;
                this.$qcronPreview.html("<span>" + expression + "</span>");
            },
            
            _buildCronExpression: function () {
                switch (this.__periods[this.$period.val()].display) {
                    case "minute":
                        this.expression = this.__expression("0", "*", "*", "*", "*", "?", "*");
                        break;
                    case "hour":
                        this.expression = this.__expression("0", this.$minute.val(), "*", "*", "*", "?", "*");
                        break;
                    case "day":
                        this.expression = this.__expression("0", this.$minute.val(), this.$hour.val(), "*", "*", "?", "*");
                        break;
                    case "week":
                        var selected = this.$dayOfWeek.val() || [];
                        var weekdays = [];
                        for (var i = 0; i < selected.length; i++) {
                            weekdays.push(this.__weekdays[selected[i]].value);
                        }
                        this.expression = this.__expression("0", this.$minute.val(), this.$hour.val(), "?", "*", weekdays.join(",") || "*", "*");
                        break;
                    case "month":
                        this.expression = this.__expression("0", this.$minute.val(), this.$hour.val(), this.$dayOfMonth.val(), "*", "?", "*");
                        break;
                    case "year":
                        var month = this.__months[this.$month.val()].value;
                        this.expression = this.__expression("0", this.$minute.val(), this.$hour.val(), this.$dayOfMonth.val(), month, "?", "*");
                        break;
                }
                this._trigger(':expression');
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
    }
    
    if (typeof define === 'function' && define.amd && define.amd.jQuery) {
        define(['jquery'], setup);
    } else {
        setup(jQuery);
    }
    
})(jQuery);