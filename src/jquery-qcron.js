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
            
            __periods: {
                minute: {
                    tabName: "Minutes",
                    inputName: "minute(s)"
                },
                hour: {
                    tabName: "Hourly",
                    inputName: "hour(s)"
                },
                day: {
                    tabName: "Daily",
                    inputName: "day(s)"
                },
                week: {
                    tabName: "Weekly",
                    inputName: "week(s)"
                },
                month: {
                    tabName: "Monthly",
                    inputName: "month(s)"
                },
                year: {
                    tabName: "Yearly",
                    inputName: "year(s)"
                }
            },
            __weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            __weeks: ["First", "Second", "Third", "Fourth"],
            __months: ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            
            __tabsTemplate: "<div id='qcron-periods'><ul></ul></div>",
            __previewTemplate: "<div class='qcron-preview'></div>",
            
            _create: function (options) {
                $.extend(this.options, options);
                
                this._on(this.element, {
                
                });
            },
            
            _init: function () {
                this.$element = $(this.element);
                this.$element.empty();
                
                this.$qcronControls = $(this.__tabsTemplate);
                this.$qcronPreview = $(this.__previewTemplate);
                
                this.$element.append(this.$qcronControls).append(this.$qcronPreview);
                
                this._renderInputs();
                this._renderPreview();
            },
            
            _renderInputs: function () {
                
                this._renderMinutesTab();
                this._renderHourlyTab();
                this._renderDailyTab();
                this._renderWeeklyTab();
                this._renderMonthlyTab();
                this._renderYearlyTab();
                
                this.$qcronControls.tabs();
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
                
                $hourlyTab.append("<div><input type='radio' name='hourly-format' value='every' checked/> Every <input type='number'/> hour(s)</div>");
                $hourlyTab.append("<div><input type='radio' name='hourly-format' value='starts'/> Starts at <select class='hour-select'></select>:<select class='minute-select'></select></div>");
                
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
                
                $dailyTab.append("<div><input type='radio' name='daily-format' value='every' checked/> Every <input type='number'/> day(s)</div>");
                $dailyTab.append("<div><input type='radio' name='daily-format' value='starts'> Every Week Day </div>");
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
                
                $.each(this.__weekdays, function (i, weekday) {
                    $weeklyTab.append("<label><input type='checkbox' name='weekly-day'/>" + weekday + "</label>");
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
                
                $monthlyTab.append("<div><input type='radio' name='monthly-format' value='every' checked/> Day <input type='number'/> of every <input type='number'/> month(s)</div>");
                $monthlyTab.append("<div><input type='radio' name='monthly-format' value='starts'> The <select class='week-select'></select><select class='day-select'></select> of every <input type='number'/> month(s) </div>");
                $monthlyTab.append("<div>Starting at <select class='hour-select'></select>:<select class='minute-select'></select></div>");
                
                $.each(this.__weeks, function (i, week) {
                   $monthlyTab.find("select.week-select").append("<option value='" + i + "'>" + week + "</option>"); 
                });
                
                $.each(this.__weekdays, function (i, weekday) {
                   $monthlyTab.find("select.day-select").append("<option value='" + i + "'>" + weekday + "</option"); 
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
            __yearlyTabBodyTemplate: "<div id='qcron-yearly-tab'>yearly</div>",
            _renderYearlyTab: function () {
                this.$qcronControls.find("ul").append($(this.__yearlyTabItemTemplate));
                var $yearlyTab = $(this.__yearlyTabBodyTemplate);
                
                $yearlyTab.append("<div><input type='radio' name='yearly-format' value='every' checked/> Every <select class='month-select'></select><input type='number'/></div>");
                $yearlyTab.append("<div><input type='radio' name='yearly-format' value='starts'> The <select class='week-select'></select><select class='day-select'></select> of <select class='month-select'></select></div>");
                $yearlyTab.append("<div>Starting at <select class='hour-select'></select>:<select class='minute-select'></select></div>");
                
                $.each(this.__months, function (i, month) {
                   $yearlyTab.find("select.month-select").append("<option value='" + i + "'>" + month + "</option>"); 
                });
                
                
                $.each(this.__weeks, function (i, week) {
                    $yearlyTab.find("select.week-select").append("<option value='" + i + "'>" + week + "</option>"); 
                });

                $.each(this.__weekdays, function (i, weekday) {
                    $yearlyTab.find("select.day-select").append("<option value='" + i + "'>" + weekday + "</option"); 
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
                this.$qcronPreview.html("<span>preview</span>");
            },
            
            __twodigitformat: function (num) {
                return ("0" + num).slice(-2);
            }
        });
    }
    
    if (typeof define === 'function' && define.amd && define.amd.jQuery) {
        define(['jquery'], setup);
    } else {
        setup(jQuery);
    }
    
})(jQuery);