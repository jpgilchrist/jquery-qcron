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
        
        var __weekdays = {
            1: {
                display: "Sunday",
                value: 1
            }, 
            2: {
                display: "Monday",
                value: 2
            }, 
            3 : {
                display: "Tuesday",
                value: 3
            }, 
            4: {
                display: "Wednesday",
                value: 4
            }, 
            5: {
                display: "Thursday",
                value: 5
            }, 
            6: {
                display: "Friday",
                value: 6
            }, 
            7: {
                display: "Saturday",
                value: 7
            }
        };
        
        var __weeks = {
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
        };
        
        var __periods = {
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
        };
        
        var __months = {
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
        };
        
        $.widget("jpgilchrist.qcron", {
            options: {
                initial: "0 0/4 * 1/1 * ? *",
                minute: true,
                hour: true,
                day: true,
                week: true,
                month: true,
                year: true,
                allowOverride: true,
                previewDates: true,
                validateUrl: "http://localhost/veoci/api-v1/p/cron",
                defaultTab: "weekly"
            },
            
            __controlsTemplate: "<div class='qcron-controls'><ul></ul></div>",
            __rawInputTemplate: "<div class='qcron-raw'></div>",
            __previewTemplate : "<div class='qcron-preview'></div>",
            
            _create: function (options) {
                $.extend(this.options, options);
                
                this._on(this.element, {
                    "qcron:expression": function (event, exp) {
                        this.expression = exp;
                        
                        var self = this;
                        if (!!this.options.validateUrl) {
                            $.ajax({
                                url: this.options.validateUrl,
                                type: "POST", 
                                dataType: 'json',
                                contentType: 'application/json',
                                data: JSON.stringify({
                                    expression: exp
                                }),
                                success: function (data) {
                                    console.log('success', data);
                                    self.$element.find(".qcron-raw-input").val(data.expression);  
                                },
                                error: function (error) {
                                    console.log('error', error);
                                }
                            });
                        }
                    },
                    "click .qcron-raw-validate": function () {
                        this.value(this.$element.find(".qcron-raw-input").val());
                    }
                });
            },
            
            value: function (value) {
                value = value.trim();
                if (!!value) {
                    var parts = value.split(/\s+/);
                    if (parts.length === 6 || parts.length === 7) {
                        var valid = this.$minutesTab.qcronMinutesTab("value", value);
                        if (!!valid.error)
                            valid = this.$hourlyTab.qcronHourlyTab("value", value);
                        if (!!valid.error)
                            valid = this.$dailyTab.qcronDailyTab("value", value);
                        if (!!valid.error)
                            valid = this.$weeklyTab.qcronWeeklyTab("value", value);
                        debugger;
                        
                    } else {
                        throw new Error("jquery-qcron: The raw input must have all parts: 'seconds minutes hours dayOfMonth month dayOfWeek [year]'! Raw Value: [" + value + "]");
                    }
                } else {
                    throw new Error("jquery-qcron: The raw input value must not be empty! Raw Value [" + value + "]");
                }
            },
            
            _init: function () {
                this.$element = $(this.element);
                this.$element.empty();
                
                this.$qcronControls = $(this.__controlsTemplate);
                this.$element.append(this.$qcronControls);
                
                this.$rawInput = $(this.__rawInputTemplate).appendTo(this.$element);
                if (!!this.options.allowOverride) {
                    this.$rawInput.append("<input type='text' class='qcron-raw-input'/>");
                    this.$rawInput.append("<button class='qcron-raw-validate'>Validate</button>");
                } else {
                    this.$rawInput.append("<input type='text' class='qcron-raw-input' disabled/>");
                }
                
                if (!!this.options.validateUrl && this.options.previewDates) {
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

                function buildTab ($tab) {
                    switch($tab.attr('id')) {
                        case 'qcron-minutes-tab':
                            $tab.qcronMinutesTab('build');
                            break;
                        case 'qcron-hourly-tab':
                            $tab.qcronHourlyTab('build');
                            break;
                        case 'qcron-daily-tab':
                            $tab.qcronDailyTab('build');
                            break;
                        case 'qcron-weekly-tab':
                            $tab.qcronWeeklyTab('build');
                            break;
                        case 'qcron-monthly-tab':
                            $tab.qcronMonthlyTab('build');
                            break;
                        case 'qcron-yearly-tab':
                            $tab.qcronYearlyTab('build');
                            break;
                    }
                }
                
                var option = this.options.defaultTab;
                var active = 
                    option == "minutes" ? 0 : 
                    option == "hourly"  ? 1 :
                    option == "daily"   ? 2 :
                    option == "weekly"  ? 3 :
                    option == "monthly" ? 4 :
                    option == "yearly"  ? 5 : 3;
                this.$qcronControls.tabs({
                    active: active,
                    create: function (event, ui) {
                      buildTab(ui.panel);
                    },
                    beforeActivate: function (event, ui) {
                        buildTab(ui.newPanel);
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
                var self = this;
                this.$qcronControls.find("ul").append($(this.__minutesTabItemTemplate));
                this.$minutesTab = $(this.__minutesTabBodyTemplate).qcronMinutesTab({
                    changed: function (exp) {
                        self._trigger(':expression', null, exp);
                    }
                });
                this.$qcronControls.append(this.$minutesTab);
            },

            __hourlyTabItemTemplate: "<li><a href='#qcron-hourly-tab'>Hourly</a></li>",
            __hourlyTabBodyTemplate: "<div id='qcron-hourly-tab'></div>",
            _renderHourlyTab: function () {
                var self = this;
                this.$qcronControls.find("ul").append($(this.__hourlyTabItemTemplate));
                this.$hourlyTab = $(this.__hourlyTabBodyTemplate).qcronHourlyTab({
                    changed: function (exp) {
                        self._trigger(':expression', null, exp);
                    }
                });
                this.$qcronControls.append(this.$hourlyTab);
            },

            __dailyTabItemTemplate: "<li><a href='#qcron-daily-tab'>Daily</a></li>",
            __dailyTabBodyTemplate: "<div id='qcron-daily-tab'></div>",
            _renderDailyTab: function () {
                var self = this;
                this.$qcronControls.find("ul").append($(this.__dailyTabItemTemplate));
                this.$dailyTab = $(this.__dailyTabBodyTemplate).qcronDailyTab({
                    changed: function (exp) {
                        self._trigger(':expression', null, exp);
                    }
                });
                this.$qcronControls.append(this.$dailyTab);
            },

            __weeklyTabItemTemplate: "<li><a href='#qcron-weekly-tab'>Weekly</a></li>",
            __weeklyTabBodyTemplate: "<div id='qcron-weekly-tab'></div>",
            _renderWeeklyTab: function () {
                var self = this;
                this.$qcronControls.find("ul").append($(this.__weeklyTabItemTemplate));
                this.$weeklyTab = $(this.__weeklyTabBodyTemplate).qcronWeeklyTab({
                    changed: function (exp) {
                        self._trigger(':expression', null, exp);
                    }
                });
                this.$qcronControls.append(this.$weeklyTab);
            },

            __monthlyTabItemTemplate: "<li><a href='#qcron-monthly-tab'>Monthly</a></li>",
            __monthlyTabBodyTemplate: "<div id='qcron-monthly-tab'></div>",
            _renderMonthlyTab: function () {
                var self = this;
                this.$qcronControls.find("ul").append($(this.__monthlyTabItemTemplate));
                this.$monthlyTab = $(this.__monthlyTabBodyTemplate).qcronMonthlyTab({
                    changed: function (exp) {
                        self._trigger(':expression', null, exp);
                    }
                });
                this.$qcronControls.append(this.$monthlyTab);
            },

            __yearlyTabItemTemplate: "<li><a href='#qcron-yearly-tab'>Yearly</a></li>",
            __yearlyTabBodyTemplate: "<div id='qcron-yearly-tab'></div>",
            _renderYearlyTab: function () {
                var self = this;
                this.$qcronControls.find("ul").append($(this.__yearlyTabItemTemplate));
                this.$yearlyTab = $(this.__yearlyTabBodyTemplate).qcronYearlyTab({
                    changed: function (exp) {
                        self._trigger(':expression', null, exp);
                    }
                });
                this.$qcronControls.append(this.$yearlyTab);
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
                
                this.$element.empty();
                this.$element.append("<span>Every</span>");
                this.$element.append(this.$minuteSelect);
                this.$element.append("<span>minute(s) starting at</span>");
                this.$element.append(this.$minuteStartSelect);
                this.$element.append("minute(s) past the hour.");
            },
            
            build: function (event, value) {
                if (!!value)
                    this.expression = value;
                else
                    this.expression = "0 " + this.$minuteStartSelect.val() + "/" + this.$minuteSelect.val() + " * * * ? *";
                
                if (!!this.options.changed)
                    this.options.changed.call(this, this.expression);
            },
            
            value: function (value) {
                var builder = new MinutesTabExpressionBuilder();
                return builder
                    .seconds("0")
                    .minutes("1/2")
                    .hours("*")
                    .dayOfMonth("*")
                    .month("*")
                    .dayOfWeek("?")
                    .year("*").build();
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

                this.$element.empty();
                this.$element.append("<span>Every</span>");
                this.$element.append(this.$hourSelect);
                this.$element.append("<span>hour(s) starting at</span>");
                this.$element.append(this.$hourStartSelect);
                this.$element.append("<span>:</span>");
                this.$element.append(this.$minuteStartSelect);
            },
            build: function (event, value) {
                if (!!value)
                    this.expression = value;
                else
                    this.expression = "0 " + this.$minuteStartSelect.val() + " " + this.$hourStartSelect.val() + "/" + this.$hourSelect.val() + " * * ? *";

                if (!!this.options.changed)
                    this.options.changed.call(this, this.expression);
            },
            value: function (value) {
                if (!value)
                    return this.expression;
                var parts = value.trim().split(/\s+/);
                if (parts[0] !== "0") // seconds
                    return {error: "invalid seconds. must be '0'"};
                if (parts[3] !== "*" && parts[3] !== "?") // day of month
                    return {error: "invalid day of month. must be '*' or '?'"};
                if (parts[4] !== "*") // month
                    return {error: "invalid month. must be '*'"};
                if (parts[5] !== "*" && parts[5] !== "?") // day of week
                    return {error: "invalid day of week. must be '*' or '?'"};
                if (!!parts[6] && parts[6] !== "*") // year
                    return {error: "invalid year. must be '*' or unspecified."};
                if ((parts[3] === '?' && parts[5] === '?') || (parts[3] === '*' && parts[5] === '*')) // at least day of month or day of  year needs to be '?'
                    return {error: "either day of week or day of year must be '?', but not both."};

                var minutes = Number(parts[1]);
                if (isNaN(minutes))
                    return {error: "invalid minutes. must be an integer."};
                
                if (minutes < 0 || minutes > 59)
                    return {error: "invalid minutes. allowed values are 0 to 59."};
                
                var hours = parts[2];
                if (hours === "*")
                    hours = "0/1";

                var hourParts = hours.split("/");
                if (hourParts.length !== 2)
                    return {error: "invalid hours. must be of in the form '1/2'."};

                var start = Number(hourParts[0]),
                    increment = Number(hourParts[1]);

                if (isNaN(start) || isNaN(increment))
                    return {error: "invalid hours. must be integers. int/int"};
                
                if (start < 0 || start > 59)
                    return {error: "invalid hours. allowed values are 0 to 59."};
                
                if (increment < 1 || increment > 59)
                    return {error: "invalid hours. allowed values are 1 to 59."};
                
                this.$element.find(".qcron-minutestart-select").val(minutes);
                this.$element.find(".qcron-hourstart-select").val(start);
                this.$element.find(".qcron-hour-select").val(increment);
                
                return true;
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
                this.$daySelect = $("<select class='qcron-domincrement-select'></select>");
                this.$dayStartSelect = $("<select class='qcron-domstart-select'></select>");
                this.$hourStartSelect = $("<select class='qcron-hourstart-select'></select>");
                this.$minuteStartSelect = $("<select class='qcron-minutestart-select'></select>");

                for (var i = 0; i < 60; i++) {
                    if (i > 0 && i < 32) {
                        this.$daySelect.append("<option value='" + i + "'>" + i + "</option>");
                        this.$dayStartSelect.append("<option value='" + i + "'>" + i + "</option>");
                    }
                    if (i < 24)
                        this.$hourStartSelect.append("<option value='" + i + "'>" + twodigitformat(i) + "</option>");
                    this.$minuteStartSelect.append("<option value='" + i + "'>" + twodigitformat(i) + "</option>");
                }

                this.$element.empty();
                this.$element.append("<span>Every</span>");
                this.$element.append(this.$daySelect);
                this.$element.append("<span>day(s) at</span>");
                this.$element.append(this.$hourStartSelect);
                this.$element.append("<span>:</span>");
                this.$element.append(this.$minuteStartSelect);
                this.$element.append("<span>on day</sapn>");
                this.$element.append(this.$dayStartSelect);
            },
            build: function (event, value) {
                if (!!value)
                    this.expression = value;
                else
                    this.expression = "0 " + this.$minuteStartSelect.val() + " " + this.$hourStartSelect.val() +  " " + this.$dayStartSelect.val() + "/" + this.$daySelect.val() + " * ? *";

                if (!!this.options.changed)
                    this.options.changed.call(this, this.expression);
            },
            value: function (value) {
                if (!value)
                    return this.expression;
                
                var parts = value.trim().split(/\s+/);
                if (parts[0] !== "0") // seconds
                    return {error: "invalid seconds. must be '0'"};
                if (parts[4] !== "*") // month
                    return {error: "invalid month. must be '*'"};
                if (parts[5] !== "?") // day of week
                    return {error: "invalid day of week. must be '?' when specifiying a day of month."};
                if (!!parts[6] && parts[6] !== "*") // year
                    return {error: "invalid year. must be '*' or unspecified."};

                var minutes = Number(parts[1]);
                if (isNaN(minutes))
                    return {error: "invalid minutes. must be an integer."};

                if (minutes < 0 || minutes > 59)
                    return {error: "invalid minutes. allowed values are 0 to 59."};

                var hours = Number(parts[2]);
                if (isNaN(hours))
                    return {error: "invalid hours. must be an integer."};
                
                if (hours < 0 || hours > 59) 
                    return {error: "invalid hours. allowed values are 0 to 59."};
                
                var dom = parts[3];
                if (dom === "*")
                    dom = "1/1";

                var domParts = dom.split("/");
                if (domParts.length !== 2)
                    return {error: "invalid day of month. must be of in the form '1/2'."};

                var start = Number(domParts[0]),
                    increment = Number(domParts[1]);

                if (isNaN(start) || isNaN(increment))
                    return {error: "invalid day of month. must be integers. int/int"};

                if (start < 1 || start > 31)
                    return {error: "invalid day of month. allowed values are 0 to 59."};

                if (increment < 1 || increment > 31)
                    return {error: "invalid day of month increment. allowed values are 1 to 59."};

                this.$element.find(".qcron-minutestart-select").val(minutes);
                this.$element.find(".qcron-hourstart-select").val(hours);
                this.$element.find(".qcron-domstart-select").val(start);
                this.$element.find(".qcron-domincrement-select").val(increment);

                return true;
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
                this.$dayOfWeekCheckboxes = $("<div class='qcron-dow-checkboxes'></div>");
                
                var self = this;
                $.each(__weekdays, function (key, weekday) {
                    self.$dayOfWeekCheckboxes.append("<label><input type='checkbox' class='qcron-dow-input' value='" + key + "'/>" + weekday.display + "</label>");
                });
                
                this.$hourStartSelect = $("<select class='qcron-hourstart-select'></select>");
                this.$minuteStartSelect = $("<select class='qcron-minutestart-select'></select>");

                for (var i = 0; i < 60; i++) {
                    if (i < 24)
                        this.$hourStartSelect.append("<option value='" + i + "'>" + twodigitformat(i) + "</option>");
                    this.$minuteStartSelect.append("<option value='" + i + "'>" + twodigitformat(i) + "</option>");
                }

                this.$element.empty();
                this.$element.append(this.$dayOfWeekCheckboxes);
                this.$element.append("<span>at</span>");
                this.$element.append(this.$hourStartSelect);
                this.$element.append("<span>:</span>");
                this.$element.append(this.$minuteStartSelect);
            },
            build: function (event, value) {
                if (!!value)
                    this.expression = value;
                else {
                    var selectedDaysOfWeek = [];
                    this.$dayOfWeekCheckboxes.find("input.qcron-dow-input:checked").each(function(key, dow) {
                        selectedDaysOfWeek.push(__weekdays[$(dow).val()].value);
                    });
                    
                    this.expression = "0 " + this.$minuteStartSelect.val() + " " + this.$hourStartSelect.val() + " ? * " + selectedDaysOfWeek.join(",") + " *";
                }
                    

                if (!!this.options.changed)
                    this.options.changed.call(this, this.expression);
            },
            value: function (value) {
                if (!value)
                    return this.expression;

                var parts = value.trim().split(/\s+/);
                if (parts[0] !== "0") // seconds
                    return {error: "invalid seconds. must be '0'"};
                if (parts[3] !== "?")
                    return {error: "invalid dom. must be '?' when specifiying a day of week."};
                if (parts[4] !== "*") // month
                    return {error: "invalid month. must be '*'"};
                if (!!parts[6] && parts[6] !== "*") // year
                    return {error: "invalid year. must be '*' or unspecified."};

                var minutes = Number(parts[1]);
                if (isNaN(minutes))
                    return {error: "invalid minutes. must be an integer."};

                if (minutes < 0 || minutes > 59)
                    return {error: "invalid minutes. allowed values are 0 to 59."};

                var hours = Number(parts[2]);
                if (isNaN(hours))
                    return {error: "invalid hours. must be an integer."};

                if (hours < 0 || hours > 59) 
                    return {error: "invalid hours. allowed values are 0 to 59."};

                var dow = parts[5];
                if (dow === "*")
                    dow = "1,2,3,4,5,6,7";

                var dowParts = dow.split(",");
                for (var i = 0; i < dowParts.length; i++) {
                    var d = Number(dowParts[i]);
                    if (isNaN(d))
                        return {error: "invalid day of week. currently, only numeric values are supported."};
                    if (d < 1 || d > 7)
                        return {error: "invalid day of week. allowed values are 1 to 7."};
                    this.$element.find(".qcron-dow-input[value='" + d + "']").attr('checked', true);
                }

                this.$element.find(".qcron-minutestart-select").val(minutes);
                this.$element.find(".qcron-hourstart-select").val(hours);

                return true;
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
                var $monthlyOptionOne = $("<div class='qcron-monthly-option-one'></div>");
                $monthlyOptionOne.append("<input type='radio' name='qcron-monthly-option' value='option-one' checked/>");
                $monthlyOptionOne.append("<span>On day</san>");
                $monthlyOptionOne.append("<select class='qcron-dom-select'></select>");
                $monthlyOptionOne.append("<span>every</span>");
                $monthlyOptionOne.append("<select class='qcron-month-increment'></select>");
                $monthlyOptionOne.append("<span>month(s)");
                
                var $monthlyOptionTwo = $("<div class='qcron-monthly-option-two'></div>");
                $monthlyOptionTwo.append("<input type='radio' name='qcron-monthly-option' value='option-two'/>");
                $monthlyOptionTwo.append("<span>The</span>");
                $monthlyOptionTwo.append("<select class='qcron-week-select'></select>");
                $monthlyOptionTwo.append("<select class='qcron-dow-select'></select>");
                $monthlyOptionTwo.append("<span>of every</span>");
                $monthlyOptionTwo.append("<select class='qcron-month-increment'></select>");
                $monthlyOptionTwo.append("<span>month(s)</span>");
                
                this.$hourStartSelect = $("<select class='qcron-hourstart-select'></select>");
                this.$minuteStartSelect = $("<select class='qcron-minutestart-select'></select>");

                for (var i = 0; i < 60; i++) {
                    if (i > 0 && i < 32)
                        $(".qcron-dom-select", $monthlyOptionOne).append("<option value='" + i + "'>" + i + "</option>");
                    
                    if (i > 0 && i < 12) {
                        $(".qcron-month-increment", $monthlyOptionOne).append("<option value='" + i + "'>" + i + "</option>");
                        $(".qcron-month-increment", $monthlyOptionTwo).append("<option value='" + i + "'>" + i + "</option>");
                    }
                        
                    if (i < 24)
                        this.$hourStartSelect.append("<option value='" + i + "'>" + twodigitformat(i) + "</option>");
                    this.$minuteStartSelect.append("<option value='" + i + "'>" + twodigitformat(i) + "</option>");
                }
                
                $.each(__weeks, function (key, week) {
                    $(".qcron-week-select", $monthlyOptionTwo).append("<option value='" + key + "'>" + week.display + "</option>"); 
                });
                $.each(__weekdays, function (key, weekday) {
                    $(".qcron-dow-select", $monthlyOptionTwo).append("<option value='" + key + "'>" + weekday.display + "</option>");
                });
                
                this.$element.empty();
                this.$element.append($monthlyOptionOne);
                this.$element.append($monthlyOptionTwo);
                this.$element.append("<span>at</span>");
                this.$element.append(this.$hourStartSelect);
                this.$element.append("<span>:</span>");
                this.$element.append(this.$minuteStartSelect);
            },
            build: function (event, value) {
                if (!!value) {
                    this.expression = value;
                } else {
                    var selectedOption = this.$element.find("input[name='qcron-monthly-option']:checked").val(),
                        minuteStart = this.$minuteStartSelect.val(),
                        hourStart = this.$hourStartSelect.val(),
                        monthIncr;
                    if (selectedOption == "option-one") {
                        minuteStart = this.$minuteStartSelect.val();
                        hourStart   = this.$hourStartSelect.val();
                        monthIncr   = this.$element.find(".qcron-monthly-option-one .qcron-month-increment").val();
                        
                        var dom         = this.$element.find(".qcron-monthly-option-one .qcron-dom-select").val();
                            
                        this.expression = "0 " + minuteStart + " " + hourStart + " " + dom + " 1/" + monthIncr + " ? *";    
                    } else {
                        minuteStart = this.$minuteStartSelect.val();
                        hourStart   = this.$hourStartSelect.val();
                        monthIncr   = this.$element.find(".qcron-monthly-option-two .qcron-month-increment").val();
                        
                        var weekNum     = this.$element.find(".qcron-monthly-option-two .qcron-week-select").val(),
                            dow         = this.$element.find(".qcron-monthly-option-two .qcron-dow-select").val();
                        
                        this.expression = "0 " + minuteStart + " " + hourStart + " ? 1/" + monthIncr + " " + dow + "#" + weekNum + " *";
                    }
                    
                }

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
                var $yearlyOptionOne = $("<div class='qcron-yearly-option-one'></div>");
                $yearlyOptionOne.append("<input type='radio' name='qcron-yearly-option' value='option-one' checked/>");
                $yearlyOptionOne.append("<span>Every</san>");
                var $monthSelect = $("<select class='qcron-month-select'></select>").appendTo($yearlyOptionOne);
                $yearlyOptionOne.append("<select class='qcron-dom-select'></select>");

                var $yearlyOptionTwo = $("<div class='qcron-yearly-option-two'></div>");
                $yearlyOptionTwo.append("<input type='radio' name='qcron-yearly-option' value='option-two'/>");
                $yearlyOptionTwo.append("<span>The</span>");
                $yearlyOptionTwo.append("<select class='qcron-week-select'></select>");
                $yearlyOptionTwo.append("<select class='qcron-dow-select'></select>");
                $yearlyOptionTwo.append("<span>of</span>");
                $yearlyOptionTwo.append("<select class='qcron-month-select'></select>");

                this.$hourStartSelect = $("<select class='qcron-hourstart-select'></select>");
                this.$minuteStartSelect = $("<select class='qcron-minutestart-select'></select>");

                for (var i = 0; i < 60; i++) {
                    if (i < 24)
                        this.$hourStartSelect.append("<option value='" + i + "'>" + twodigitformat(i) + "</option>");
                    this.$minuteStartSelect.append("<option value='" + i + "'>" + twodigitformat(i) + "</option>");
                }

                $.each(__months, function (key, month) {
                    $(".qcron-month-select", $yearlyOptionOne).append("<option value='" + key + "'>" + month.display + "</option>");
                    $(".qcron-month-select", $yearlyOptionTwo).append("<option value='" + key + "'>" + month.display + "</option>");
                });
                
                $.each(__weeks, function (key, week) {
                    $(".qcron-week-select", $yearlyOptionTwo).append("<option value='" + key + "'>" + week.display + "</option>"); 
                });
                
                $.each(__weekdays, function (key, weekday) {
                    $(".qcron-dow-select", $yearlyOptionTwo).append("<option value='" + key + "'>" + weekday.display + "</option>");
                });
                
                $monthSelect.on('change', function (event) {
                    var month = __months[$(this).val()],
                        $monthSelect = $yearlyOptionOne.find(".qcron-dom-select");
                    $monthSelect.empty();
                    for (var i = 1; i <= month.days; i++) {
                        $monthSelect.append("<option value='" + i + "'>" + i + "</option>");
                    }
                });
                $monthSelect.trigger('change');
                

                this.$element.empty();
                this.$element.append($yearlyOptionOne);
                this.$element.append($yearlyOptionTwo);
                this.$element.append("<span>at</span>");
                this.$element.append(this.$hourStartSelect);
                this.$element.append("<span>:</span>");
                this.$element.append(this.$minuteStartSelect);
            },
            build: function (event, value) {
                if (!!value) {
                    this.expression = value;
                } else {
                    var selectedOption = this.$element.find("input[name='qcron-yearly-option']:checked").val(),
                        minuteStart = this.$minuteStartSelect.val(),
                        hourStart = this.$hourStartSelect.val(),
                        month;
                        
                    if (selectedOption == "option-one") {
                        minuteStart = this.$minuteStartSelect.val();
                        hourStart   = this.$hourStartSelect.val();
                        month       = this.$element.find(".qcron-yearly-option-one .qcron-month-select").val();

                        var dom = this.$element.find(".qcron-yearly-option-one .qcron-dom-select").val();
                        
                        this.expression = "0 " + minuteStart + " " + hourStart + " " + dom + " " + month + " ? *";
                    } else {
                        minuteStart = this.$minuteStartSelect.val();
                        hourStart   = this.$hourStartSelect.val();
                        month       = this.$element.find(".qcron-yearly-option-two .qcron-month-select").val();

                        var weekNum     = this.$element.find(".qcron-yearly-option-two .qcron-week-select").val(),
                            dow         = this.$element.find(".qcron-yearly-option-two .qcron-dow-select").val();

                        this.expression = "0 " + minuteStart + " " + hourStart + " ? " + month + " " + dow + "#" + weekNum + " *";
                    }
                    
                }
                    
                if (!!this.options.changed)
                    this.options.changed.call(this, this.expression);
            }
        });
                    
        function twodigitformat (num) {
            return ("0" + num).slice(-2);
        }
        
        function MinutesTabExpressionBuilder() {
            this.s = null;
            this.mi = null;
            this.h = null;
            this.dom = null;
            this.mo = null;
            this.dow = null;
            this.year = null;
            
            this.seconds = function (seconds) {
                if (seconds !== "0")
                    throw new Error("seconds must be 0");
                this.s = seconds;
                return this;
            };
            
            this.minutes = function (minutes) {
                if (!this.s)
                    throw new Error("must set seconds first.");
                if (minutes === "*")
                    minutes = "0/1";
                
                if (minutes.indexOf("/") === -1)
                    throw new Error("minutes should be in the form {start}/{increment}");
                
                var parts = minutes.split("/");
                if (parts.length !== 2)
                    throw new Error("minutes should be in the form {start}/{increment}");
                var m = parts[0],
                    i = parts[1];
                if (m < 0 || m > 59)
                    throw new Error("minutes should be within 0-59");
                if (i < 1 || i > 59)
                    throw new Error("minutes increment should be within 1-59");  
                this.mi = minutes;
                return this;
            };
            
            this.hours = function (hours) {
                if (!this.mi)
                    throw new Error("must set minutes first.");
                if (hours !== "*")
                    throw new Error("hours must be '*'");
                this.h = hours;
                return this;
            };
            
            this.dayOfMonth = function (dom) {
                if (!this.h)
                    throw new Error("must set hours first");
                if (dom !== "*" && dom !== "?")
                    throw new Error("dom must be '*' or '?'");
                this.dom = dom;
                return this;
            };
            
            this.month = function (month) {
              if (!this.dom)  
                  throw new Error('must set dom first');
                if (month !== "*")
                    throw new Error("month must be '*'");
                this.mo = month;
                return this;
            };
            
            this.dayOfWeek = function (dow) {
              if (!this.mo)
                  throw new Error("must set month first");
                if (this.dom !== '?')
                    if (dow !== '?')
                        throw new Error("dom is not '?', therefore dow must be '?'");
                
                if (this.dom === '?')
                    if (dow === '?')
                        throw new Error("dom is '?', therefore dow must not be '?'");
                    
                if (dow !== '?' && dow !== '*')
                    throw new Error("dow must either be '?' or '*'");
                
                this.dow = dow;
                return this;
            };
            
            this.year = function (year) {
                if (!this.dow)
                    throw new Error("must set dow first");
                if (year !== "*")
                    throw new Error("year must be '*'");
                this.year = year;
                return this;
            };
            
            this.build = function () {
                var expression = "";
                if (!!this.s && !!this.mi && !!this.h && !!this.dom && !!this.mo && !!this.dow) {
                    expression += this.s + " " + this.mi  + " " + this.h + " " + this.dom + " " + this.mo + " " + this.dow;
                    if (!!this.y)
                        expression += " " + this.y;
                } else {
                    throw new Error("must specify all values before building");
                }
                
                return expression;
            };
        }
    }
    
    if (typeof define === 'function' && define.amd && define.amd.jQuery) {
        define(['jquery'], setup);
    } else {
        setup(jQuery);
    }
    
})(jQuery);