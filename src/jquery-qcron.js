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
                        this._renderPreview();
                    },
//                    "change input, select": function () {
//                        this._buildCronExpression();
//                    }
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
                
                this.$dayOfWeek = $("<select class='qcron-dow-select'></select>").appendTo(this.$qcronControls);
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
                
                for (var i = 0; i < 24; i++) {
                    this.$hour.append("<option value='" + i + "'>" + this.__twodigitformat(i) + "</option>");
                }
                
                this.$minute = $("<select class='qcron-minute-select'></select>").appendTo(this.$qcronControls);
                this.$minuteSuffix = $("<span class='qcron-minute-suffix'></span>").appendTo(this.$qcronControls);
                
                for (var i = 0; i < 59; i++) {
                    this.$minute.append("<option value='" + i + "'>" + this.__twodigitformat(i) + "</option>");
                }
                
                this.$period.on('change', function () {
                    var period = self.__periods[$(this).val()];
                    self.$qcronControls.addClass('qcron-'+period.display+'-selected');
                    
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
            
            __minutesTabItemTemplate: "<li><a href='#qcron-minutes-tab'>Minutes</a></li>",
            __minutesTabBodyTemplate: "<div id='qcron-minutes-tab'></div>",
            _renderMinutesTab: function () {
                this.$qcronControls.find("ul").append($(this.__minutesTabItemTemplate));
                var $minutesTab = $(this.__minutesTabBodyTemplate);
                
                $minutesTab.append($("<div>Every <input type='number'/> minute(s)</div>"));
                
                this.$qcronControls.append($minutesTab);
            },
            
            __hourlyTabItemTemplate: "<li><a href='#qcron-hourly-tab'>Hourly</a></li>",
            __hourlyTabBodyTemplate: "<div id='qcron-hourly-tab'></div>",
            _renderHourlyTab: function () {
                this.$qcronControls.find("ul").append($(this.__hourlyTabItemTemplate));
                var $hourlyTab = $(this.__hourlyTabBodyTemplate);
                
                $hourlyTab.append("<div>Every <input type='number'/> hour(s)</div>");
                $hourlyTab.append("<div>Starting at <select class='hour-select'></select>:<select class='minute-select'></select></div>");
                
                var i;
                for (i = 0; i < 24; i++) {
                    $hourlyTab.find("select.hour-select").append("<option value='" + i + "'>" + this.__twodigitformat(i) + "</option>");
                }
                
                for (i = 0; i < 60; i++) {
                    $hourlyTab.find("select.minute-select").append("<option value='" + i + "'>" + this.__twodigitformat(i) + "</option>");
                }
                
                this.$qcronControls.append($hourlyTab);
            },
            
            __dailyTabItemTemplate: "<li><a href='#qcron-daily-tab'>Daily</a></li>",
            __dailyTabBodyTemplate: "<div id='qcron-daily-tab'></div>",
            _renderDailyTab: function () {
                this.$qcronControls.find("ul").append($(this.__dailyTabItemTemplate));
                var $dailyTab = $(this.__dailyTabBodyTemplate);
                
                $dailyTab.append("<div><input type='radio' name='daily-format' value='every-day' checked/> Every <input type='number'/> day(s)</div>");
                $dailyTab.append("<div><input type='radio' name='daily-format' value='every-weekday'> Every Week Day </div>");
                $dailyTab.append("<div>Starting at <select class='hour-select'></select>:<select class='minute-select'></select></div>");
                
                var i;
                for (i = 0; i < 24; i++) {
                    $dailyTab.find("select.hour-select").append("<option value='" + i + "'>" + this.__twodigitformat(i) + "</option>");
                }

                for (i = 0; i < 60; i++) {
                    $dailyTab.find("select.minute-select").append("<option value='" + i + "'>" + this.__twodigitformat(i) + "</option>");
                }
                
                this.$qcronControls.append($dailyTab);
            },
            
            __weeklyTabItemTemplate: "<li><a href='#qcron-weekly-tab'>Weekly</a></li>",
            __weeklyTabBodyTemplate: "<div id='qcron-weekly-tab'></div>",
            _renderWeeklyTab: function () {
                this.$qcronControls.find("ul").append($(this.__weeklyTabItemTemplate));
                var $weeklyTab = $(this.__weeklyTabBodyTemplate);
                
                $.each(this.__weekdays, function (key, day) {
                    $weeklyTab.append("<label><input type='checkbox' name='weekly-day' value='" + key + "'/>" + day.display + "</label>");
                });
                
                $weeklyTab.append("<div>Starting at <select class='hour-select'></select>:<select class='minute-select'></select></div>");
                
                var i;
                for (i = 0; i < 24; i++) {
                    $weeklyTab.find("select.hour-select").append("<option value='" + i + "'>" + this.__twodigitformat(i) + "</option>");
                }

                for (i = 0; i < 60; i++) {
                    $weeklyTab.find("select.minute-select").append("<option value='" + i + "'>" + this.__twodigitformat(i) + "</option>");
                }
                
                this.$qcronControls.append($weeklyTab);
            },
            
            __monthlyTabItemTemplate: "<li><a href='#qcron-monthly-tab'>Monthly</a></li>",
            __monthlyTabBodyTemplate: "<div id='qcron-monthly-tab'></div>",
            _renderMonthlyTab: function () {
                this.$qcronControls.find("ul").append($(this.__monthlyTabItemTemplate));
                var $monthlyTab = $(this.__monthlyTabBodyTemplate);
                
                $monthlyTab.append("<div class='by-day'><input type='radio' name='monthly-format' value='by-day' checked/> Day <input type='number' class='nth-day'/> of every <input type='number' class='nth-month'/> month(s)</div>");
                $monthlyTab.append("<div class='by-week'><input type='radio' name='monthly-format' value='by-week'> The <select class='week-select'></select><select class='day-select'></select> of every <input type='number' class='nth-month'/> month(s) </div>");
                $monthlyTab.append("<div>Starting at <select class='hour-select'></select>:<select class='minute-select'></select></div>");
                
                $.each(this.__weeks, function (key, week) {
                   $monthlyTab.find("select.week-select").append("<option value='" + key + "'>" + week.display + "</option>"); 
                });
                
                $.each(this.__weekdays, function (key, weekday) {
                   $monthlyTab.find("select.day-select").append("<option value='" + key + "'>" + weekday.display + "</option"); 
                });
                
                var i;
                for (i = 0; i < 24; i++) {
                    $monthlyTab.find("select.hour-select").append("<option value='" + i + "'>" + this.__twodigitformat(i) + "</option>");
                }

                for (i = 0; i < 60; i++) {
                    $monthlyTab.find("select.minute-select").append("<option value='" + i + "'>" + this.__twodigitformat(i) + "</option>");
                }
                
                this.$qcronControls.append($monthlyTab);
            },
            
            __yearlyTabItemTemplate: "<li><a href='#qcron-yearly-tab'>Yearly</a></li>",
            __yearlyTabBodyTemplate: "<div id='qcron-yearly-tab'></div>",
            _renderYearlyTab: function () {
                this.$qcronControls.find("ul").append($(this.__yearlyTabItemTemplate));
                var $yearlyTab = $(this.__yearlyTabBodyTemplate);
                
                $yearlyTab.append("<div class='specific-day'><input type='radio' name='yearly-format' value='specific-day' checked/> Every <select class='month-select'></select><select class='day-of-month-select'></select></div>");
                $yearlyTab.append("<div class='relative-day'><input type='radio' name='yearly-format' value='relative-day'> The <select class='week-select'></select><select class='day-select'></select> of <select class='month-select'></select></div>");
                $yearlyTab.append("<div>Starting at <select class='hour-select'></select>:<select class='minute-select'></select></div>");
                
                $.each(this.__months, function (key, month) {
                   $yearlyTab.find("select.month-select").append("<option value='" + key + "'>" + month.display + "</option>"); 
                });
                
                var self = this;
                $yearlyTab.find("select.month-select").on("change", function () {
                    var numberOfDaysInMonth = self.__months[$(this).val()].days;
                    for (var i = 1; i <= numberOfDaysInMonth; i++) {
                        $yearlyTab.find("select.day-of-month-select").append("<option value='" + i + "'>" + self.__twodigitformat(i) + "</option>");    
                    }
                }).trigger("change");
                
                $.each(this.__weeks, function (key, week) {
                    $yearlyTab.find("select.week-select").append("<option value='" + key + "'>" + week.display + "</option>"); 
                });

                $.each(this.__weekdays, function (key, weekday) {
                    $yearlyTab.find("select.day-select").append("<option value='" + key + "'>" + weekday.display + "</option>"); 
                });
                
                
                var i;
                for (i = 0; i < 24; i++) {
                    $yearlyTab.find("select.hour-select").append("<option value='" + i + "'>" + this.__twodigitformat(i) + "</option>");
                }

                for (i = 0; i < 60; i++) {
                    $yearlyTab.find("select.minute-select").append("<option value='" + i + "'>" + this.__twodigitformat(i) + "</option>");
                }
                
                this.$qcronControls.append($yearlyTab);
            },
            
            _renderPreview: function () {
                var expression = !!this.expression ? this.expression : this.options.initial;
                if (!!expression.error)
                    this.$qcronPreview.html("<span style='background-color: rgba(255,0,0,0.4);'>" + expression.value + "</span>");
                else
                    this.$qcronPreview.html("<span>" + expression.value + "</span>");
            },
            
            _buildCronExpression: function () {
                var tabId = this.$element.find("li.ui-tabs-active a").attr('href').slice(1);
                switch (tabId) {
                    case "qcron-minutes-tab":
                        this.expression = this._buildMinutesCronExpression();
                        break;
                    case "qcron-hourly-tab":
                        this.expression = this._buildHourlyCronExpression();
                        break;
                    case "qcron-daily-tab":
                        this.expression = this._buildDailyCronExpression();
                        break;
                    case "qcron-weekly-tab":
                        this.expression = this._buildWeeklyCronExpression();
                        break;
                    case "qcron-monthly-tab":
                        this.expression = this._buildMonthlyCronExpression();
                        break;
                    case "qcron-yearly-tab":
                        this.expression = this._buildYearlyCronExpression();
                        break;
                }
                this._trigger(':expression');
            },
            
            _buildMinutesCronExpression: function () {
                var minutes = this.$element.find("#qcron-minutes-tab input").val();
                if (!!minutes && (minutes < 0 || minutes > 59)) {
                    return {
                        error: true,
                        value: "Minutes must be within a range of 0 - 59."
                    };
                }
                    
                minutes = !minutes ? "*" : "0/" + minutes;
                return {value: this.__expression("0", minutes, "*", "*", "*", "?")};
            },
            
            _buildHourlyCronExpression: function () {
                var $tab = this.$element.find("#qcron-hourly-tab");
                
                var everyHours = $tab.find("input[type='number']").val(),
                    startsAtHours = $tab.find("select.hour-select").val(),
                    startsAtMins  = $tab.find("select.minute-select").val();
                
                if (!!everyHours && (everyHours < 1 || everyHours > 23)) {
                    return {
                        error: true,
                        value: "Hours must be within a range of 1 - 23"
                    };
                }
                
                if (!!everyHours)
                    return {value: this.__expression("0", startsAtMins, startsAtHours + "/" + everyHours, "*", "*", "?")};
                return {value: this.__expression("0", startsAtMins, startsAtHours + "/1", "*", "*", "?")};
            },
            
            _buildDailyCronExpression: function () {
                var $tab = this.$element.find("#qcron-daily-tab");
                
                var format = $tab.find("input[name='daily-format']:checked").val();
                
                var startsAtHours = $tab.find("select.hour-select").val(),
                    startsAtMins  = $tab.find("select.minute-select").val();
                
                switch (format) {
                    case 'every-day':
                        var everyDays = $tab.find("input[type='number']").val(),
                            dow = !everyDays ? "1/1" : "1/" + everyDays;
                                                
                        return {value: this.__expression("0", startsAtMins, startsAtHours, dow, "*", "?")};
                    case 'every-weekday':
                        return {value: this.__expression("0", startsAtMins, startsAtHours, "?", "*", "MON-FRI")};
                }
            },
            
            _buildWeeklyCronExpression: function () {
                var $tab = this.$element.find("#qcron-weekly-tab");
                var selectedDays = [];
                
                var self = this;
                $.each($tab.find("input[name='weekly-day']:checked"), function (i, input) {
                    selectedDays.push(self.__weekdays[$(input).val()].value);
                });
                if (!selectedDays.length)
                    console.error('must select at least one day');
                
                var startsAtHours = $tab.find("select.hour-select").val(),
                    startsAtMins  = $tab.find("select.minute-select").val();
                
                return {value: this.__expression("0", startsAtMins, startsAtHours, "?", "*", selectedDays.join(","))};
                
            },
            
            _buildMonthlyCronExpression: function () {
                var $tab = this.$element.find("#qcron-monthly-tab");
                var format = $tab.find("input[name='monthly-format']:checked").val();
                
                var startsAtHours = $tab.find("select.hour-select").val(),
                    startsAtMins  = $tab.find("select.minute-select").val();
                
                var everyNMonths;
                switch (format) {
                    case 'by-day':
                        var nthDay = $tab.find("div.by-day input.nth-day").val();
                        everyNMonths = $tab.find("div.by-day input.nth-month").val();
                        return {value: this.__expression("0", startsAtMins, startsAtHours, nthDay, "1/"+everyNMonths, "?")};
                    case 'by-week':
                        var nthWeek = $tab.find("div.by-week select.week-select").val(),
                            day = this.__weekdays[$tab.find("div.by-week select.day-select").val()].value;
                        everyNMonths = $tab.find("div.by-week input.nth-month").val();
                        return {value: this.__expression("0", startsAtMins, startsAtHours, "?", "1/"+everyNMonths, day+"#"+nthWeek)};
                }
            },
            
            _buildYearlyCronExpression: function () {
                var $tab = this.$element.find("#qcron-yearly-tab");
                var format = $tab.find("input[name='yearly-format']:checked").val();
                
                var startsAtHours = $tab.find("select.hour-select").val(),
                    startsAtMins  = $tab.find("select.minute-select").val();
                
                switch(format) {
                    case 'specific-day':
                        var spMonth = this.__months[$tab.find("div.specific-day select.month-select").val()].value,
                            dom = $tab.find("div.specific-day select.day-of-month-select").val();
                        return {value: this.__expression("0", startsAtMins, startsAtHours, dom, spMonth, "?", "*")};
                    case 'relative-day':
                        var week = this.__weeks[$tab.find("div.relative-day select.week-select").val()].value,
                            dow = this.__weekdays[$tab.find("div.relative-day select.day-select").val()].value,
                            relMonth = this.__months[$tab.find("div.relative-day select.month-select").val()].value;
                        return {value: this.__expression("0", startsAtMins, startsAtHours, "?", relMonth, dow+"#"+week, "*")};
                }
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