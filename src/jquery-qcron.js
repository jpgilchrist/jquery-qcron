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
                validateUrl: "http://localhost/veoci/api-v1/p/cron",
                defaultTab: "daily"
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
                        $.ajax({
                            url: self.options.validateUrl,
                            type: "POST", 
                            dataType: 'json',
                            contentType: 'application/json',
                            position: {},
                            data: JSON.stringify({
                                expression: self.expression
                            }),
                            success: function (data) {
                                console.log('success', data);
                            },
                            error: function (error) {
                                console.error('failed to validate expression', error);
                            }
                        });
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
                        var self = this;
                        self.$minutesTab.qcronMinutesTab("value", value).then(function () {
                            self.$qcronControls.tabs("option", "active", 0);
                        }, function () {
                            self.$hourlyTab.qcronHourlyTab("value", value).then(function () {
                                self.$qcronControls.tabs("option", "active", 1);
                            }, function () {
                                self.$dailyTab.qcronDailyTab("value", value).then(function() {
                                    self.$qcronControls.tabs("option", "active", 2);
                                }, function () {
                                    self.$weeklyTab.qcronWeeklyTab("value", value).then(function () {
                                        self.$qcronControls.tabs("option", "active", 3);
                                    }, function () {
                                        self.$monthlyTab.qcronMonthlyTab("value", value).then(function () {
                                            self.$qcronControls.tabs("option", "active", 4);
                                        }, function () {
                                            self.$yearlyTab.qcronYearlyTab("value", value).then(function () {
                                                self.$qcronControls.tabs("option", "active", 5);
                                            }, function () {
                                                console.log('error did not match any tabs formats');
                                            });
                                        });
                                    }); 
                                });
                            });
                        });
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
                
                this.$element.addClass("has-qcron");
                if (!!this.options.width)
                    this.$element.css("width", this.options.width);
                
                this.$qcronControls = $(this.__controlsTemplate);
                this.$element.append(this.$qcronControls);
                
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
                var dfd = $.Deferred();
                if (!value)
                    dfd.resolve(this.expression);
                var parts = value.split(/\s+/);
                var builder = this._builder();
                try {
                    builder.seconds(parts[0])
                        .minutes(parts[1])
                        .hours(parts[2])
                        .month(parts[4])
                        .dayOfMonth(parts[3])
                        .dayOfWeek(parts[5]);
                    if (!!parts[6])
                        builder.year(parts[6]);
                    dfd.resolve(builder.build());
                } catch (ex) {
                    dfd.reject(ex);
                }
                return dfd.promise();
            },

            _builder: function () {
                function Builder(context) {
                    var s, mi, h, dom, mo, dow, y, ui = context;

                    this.seconds = function (seconds) {
                        var p = /^0$/;
                        if (p.exec(seconds) === null)
                            throw new Error("seconds must be '0'");
                        s = seconds;
                        return this;
                    };

                    this.minutes = function (minutes) {
                        if (!s)
                            throw new Error("must set seconds first");
                        var p = /^([0-9]|[1-5][0-9])\/([1-9]|[1-5][0-9])$/;
                        var match = p.exec(minutes);
                        if (match === null)
                            throw new Error("minutes must be in the form {int}/{int}")
                        mi = minutes;

                        ui.$minuteStartSelect.val(match[1]);
                        ui.$minuteSelect.val(match[2]);

                        return this;
                    };

                    this.hours = function (hours) {
                        if (!mi)
                            throw new Error("must set minutes first.");
                        var p = /^[*]$/;
                        if (p.exec(hours) === null)
                            throw new Error("hours must be '*'");
                        h = hours;
                        return this;
                    };
                    
                    this.month = function (month) {
                        if (!h)
                            throw new Error('must set hours first');
                        var p = /^[*]$/;
                        if (p.exec(month) === null)
                            throw new Error("month must be '*'");
                        mo = month;
                        return this;
                    };

                    this.dayOfMonth = function (dayOfMonth) {
                        if (!mo)
                            throw new Error("must set month first");
                        var p = /^[*?]$/;
                        if (p.exec(dayOfMonth) === null)
                            throw new Error("day of month must be '*' or '?'");
                        dom = dayOfMonth;
                        return this;
                    };

                    this.dayOfWeek = function (dayOfWeek) {
                        if (!dom)
                            throw new Error("must set day of month first");
                        var p = /^[*?]$/;
                        if (p.exec(dayOfWeek) === null)
                            throw new Error("day of week must be '*' or '?'");
                        if (dom === "?" && dayOfWeek === "?")
                            throw new Error("only day of week or day of month can be '?' not both.");
                        if (dom === "*" && dayOfWeek === "*")
                            throw new Error("either day of week or day of month must be '?'.");
                        dow = dayOfWeek;
                        return this;
                    };

                    this.year = function (year) {
                        if (!dow)
                            throw new Error("must set dow first");
                        var p = /^[*]$/;
                        if (p.exec(year) === null)
                            throw new Error("year must be '*'");
                        y = year;
                        return this;
                    };

                    this.build = function () {
                        var expression = "";
                        if (!!s && !!mi && !!h && !!dom && !!mo && !!dow) {
                            expression += s + " " + mi  + " " + h + " " + dom + " " + mo + " " + dow;
                            if (!!y)
                                expression += " " + y;
                        } else {
                            throw new Error("must specify all values before building");
                        }
                        return expression;
                    };
                }
                return new Builder(this);
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
                var dfd = $.Deferred();
                if (!value)
                    dfd.resolve(this.expression);
                var parts = value.split(/\s+/);
                var builder = this._builder();
                try {
                    builder.seconds(parts[0])
                        .minutes(parts[1])
                        .hours(parts[2])
                        .month(parts[4])
                        .dayOfMonth(parts[3])
                        .dayOfWeek(parts[5]);
                    if (!!parts[6])
                        builder.year(parts[6]);
                    dfd.resolve(builder.build());
                } catch (ex) {
                    dfd.reject(ex);
                }
                return dfd.promise();
            },
            _builder: function () {
                function Builder(context) {
                    var s, mi, h, dom, mo, dow, y, ui = context;

                    this.seconds = function (seconds) {
                        var p = /^0$/;
                        if (seconds.match(p) === null)
                            throw new Error("seconds must be '0'");
                        s = seconds;
                        return this;
                    };

                    this.minutes = function (minutes) {
                        if (!s)
                            throw new Error("must set seconds first");
                        var p = /^([0-9]|[1-5][0-9])$/;
                        var match = p.exec(minutes);
                        if (match === null)
                            throw new Error("minutes must be a number between 0 and 59.");
                        mi = minutes;

                        ui.$minuteStartSelect.val(match[1]);

                        return this;
                    };

                    this.hours = function (hours) {
                        if (!mi)
                            throw new Error("must set minutes first.");
                        var p = /^([0-9]|1[0-9]|2[0-3])\/([1-9]|1[0-9]|2[0-3])$/;
                        if (p.exec(hours) === null)
                            throw new Error("hours must be in the form {0-23}/{1-23}");
                        h = hours;
                        return this;
                    };

                    this.month = function (month) {
                        if (!h)
                            throw new Error('must set hours first');
                        var p = /^[*]$/;
                        if (p.exec(month) === null)
                            throw new Error("month must be '*'");
                        mo = month;
                        return this;
                    };
                    
                    this.dayOfMonth = function (dayOfMonth) {
                        if (!mo)
                            throw new Error("must set month first");
                        var p = /^[*?]$/;
                        if (p.exec(dayOfMonth) === null)
                            throw new Error("day of month must be '*' or '?'");
                        dom = dayOfMonth;
                        return this;
                    };

                    this.dayOfWeek = function (dayOfWeek) {
                        if (!dom)
                            throw new Error("must set day of month first");
                        var p = /^[*?]$/;
                        if (p.exec(dayOfWeek) === null)
                            throw new Error("day of week must be '*' or '?'");
                        if (dom === "?" && dayOfWeek === "?")
                            throw new Error("only day of week or day of month can be '?' not both.");
                        if (dom === "*" && dayOfWeek === "*")
                            throw new Error("either day of week or day of month must be '?'.");
                        dow = dayOfWeek;
                        return this;
                    };

                    this.year = function (year) {
                        if (!dow)
                            throw new Error("must set dow first");
                        var p = /^[*]$/;
                        if (p.exec(year) === null)
                            throw new Error("year must be '*'");
                        y = year;
                        return this;
                    };

                    this.build = function () {
                        var expression = "";
                        if (!!s && !!mi && !!h && !!dom && !!mo && !!dow) {
                            expression += s + " " + mi  + " " + h + " " + dom + " " + mo + " " + dow;
                            if (!!y)
                                expression += " " + y;
                        } else {
                            throw new Error("must specify all values before building");
                        }

                        return expression;
                    };
                }
                return new Builder(this);
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
                this.$element.append("<span>starting on day</sapn>");
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
                var dfd = $.Deferred();
                if (!value)
                    dfd.resolve(this.expression);
                var parts = value.split(/\s+/);
                var builder = this._builder();
                try {
                    builder.seconds(parts[0])
                        .minutes(parts[1])
                        .hours(parts[2])
                        .month(parts[4])
                        .dayOfMonth(parts[3])
                        .dayOfWeek(parts[5]);
                    if (!!parts[6])
                        builder.year(parts[6]);
                    dfd.resolve(builder.build());
                } catch (ex) {
                    dfd.reject(ex);
                }
                return dfd.promise();
            },
            _builder: function () {
                function Builder(context) {
                    var s, mi, h, dom, mo, dow, y, ui = context;

                    this.seconds = function (seconds) {
                        if (seconds !== "0")
                            throw new Error("seconds must be 0");
                        s = seconds;
                        return this;
                    };

                    this.minutes = function (minutes) {
                        if (!s)
                            throw new Error("must set seconds first");
                        var p = /^([0-9]|[1-5][0-9])$/;
                        var match = p.exec(minutes);
                        if (match === null)
                            throw new Error("minutes must be a number between 0 and 59.");
                        mi = minutes;

                        ui.$minuteStartSelect.val(match[1]);

                        return this;
                    };

                    this.hours = function (hours) {
                        if (!mi)
                            throw new Error("must set minutes first.");
                        var p = /^([0-9]|1[0-9]|2[0-3])$/;
                        var match = p.exec(hours);
                        if (match === null)
                            throw new Error("hours must be a number between 0 and 23");
                        h = hours;

                        ui.$hourStartSelect.val(match[1]);

                        return this;
                    };

                    this.month = function (month) {
                        if (!h)
                            throw new Error('must set hours first');
                        var p = /^[*]$/;
                        if (p.exec(month) === null)
                            throw new Error("month must be '*'");
                        mo = month;
                        return this;
                    };
                    
                    this.dayOfMonth = function (dayOfMonth) {
                        if (!mo)
                            throw new Error("must set month first");
                        var p = /^([1-9]|1[0-9]|2[0-9]|3[0-1])\/([1-9]|1[0-9]|2[0-9]|3[0-1])$/;
                        var match = p.exec(dayOfMonth);
                        if (match === null)
                            throw new Error("day of month must be of the form {1-31}/{1-30}");
                        dom = dayOfMonth;

                        ui.$dayStartSelect.val(match[1]);
                        ui.$daySelect.val(match[2]);

                        return this;
                    };

                    this.dayOfWeek = function (dayOfWeek) {
                        if (!dom)
                            throw new Error("must set day of month first");
                        var p = /^[?]$/;
                        if (p.exec(dayOfWeek) === null)
                            throw new Error("day of week must be '?'");
                        dow = dayOfWeek;
                        return this;
                    };

                    this.year = function (year) {
                        if (!dow)
                            throw new Error("must set dow first");
                        var p = /^[*]$/;
                        if (p.exec(year) === null)
                            throw new Error("year must be '*'");
                        y = year;
                        return this;
                    };

                    this.build = function () {
                        var expression = "";
                        if (!!s && !!mi && !!h && !!dom && !!mo && !!dow) {
                            expression += s + " " + mi  + " " + h + " " + dom + " " + mo + " " + dow;
                            if (!!y)
                                expression += " " + y;
                        } else {
                            throw new Error("must specify all values before building");
                        }

                        return expression;
                    };
                }
                return new Builder(this);
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
                var dfd = $.Deferred();
                if (!value)
                    dfd.resolve(this.expression);
                var parts = value.split(/\s+/);
                var builder = this._builder();
                try {
                    builder.seconds(parts[0])
                        .minutes(parts[1])
                        .hours(parts[2])
                        .month(parts[4])
                        .dayOfMonth(parts[3])
                        .dayOfWeek(parts[5]);
                    if (!!parts[6])
                        builder.year(parts[6]);
                    dfd.resolve(builder.build());
                } catch (ex) {
                    dfd.reject(ex);
                }
                return dfd.promise();
            },
            _builder: function () {
                function Builder(context) {
                    var s, mi, h, dom, mo, dow, y, ui = context;

                    this.seconds = function (seconds) {
                        if (seconds !== "0")
                            throw new Error("seconds must be 0");
                        s = seconds;
                        return this;
                    };

                    this.minutes = function (minutes) {
                        if (!s)
                            throw new Error("must set seconds first");
                        var p = /^([0-9]|[1-5][0-9])$/;
                        var match = p.exec(minutes);
                        if (match === null)
                            throw new Error("minutes must be a number between 0 and 59.");
                        mi = minutes;

                        ui.$minuteStartSelect.val(match[1]);

                        return this;
                    };

                    this.hours = function (hours) {
                        if (!mi)
                            throw new Error("must set minutes first.");
                        var p = /^([0-9]|1[0-9]|2[0-3])$/;
                        var match = p.exec(hours);
                        if (match === null)
                            throw new Error("hours must be a number between 0 and 23");
                        h = hours;

                        ui.$hourStartSelect.val(match[1]);

                        return this;
                    };
                    
                    this.month = function (month) {
                        if (!h)
                            throw new Error('must set hours first');
                        var p = /^[*]$/;
                        if (p.exec(month) === null)
                            throw new Error("month must be '*'");
                        mo = month;
                        return this;
                    };

                    this.dayOfMonth = function (dayOfMonth) {
                        if (!mo)
                            throw new Error("must set month first");
                        var p = /^[?]$/;
                        if (p.exec(dayOfMonth) === null)
                            throw new Error("day of month must be '?' since day of week is not '?'");
                        dom = dayOfMonth;
                        return this;
                    };

                    this.dayOfWeek = function (dayOfWeek) {
                        if (!dom)
                            throw new Error("must set day of month first");
                        var p = /^[1-7](?:,[1-7])*$/;
                        if (p.exec(dayOfWeek) === null)
                            throw new Error("day of week must be a comma seperated list of days [1-7] and must specifiy at least one day.");
                        var days = dayOfWeek.split(","),
                            processedCache = {},
                            processedDays  = [];
                        
                        for (var i = 0; i < days.length; i++) {
                            if (!!processedCache[days[i]])
                                continue;
                            processedCache[days[i]] = true;
                            processedDays.push(days[i]);
                            
                            ui.$dayOfWeekCheckboxes.find(".qcron-dow-input[value='" + days[i] + "']").attr('checked', true);
                        }
                        
                        dow = processedDays.join(",");
                        return this;
                    };

                    this.year = function (year) {
                        if (!dow)
                            throw new Error("must set dow first");
                        if (year !== "*")
                            throw new Error("year must be '*'");
                        y = year;
                        return this;
                    };

                    this.build = function () {
                        var expression = "";
                        if (!!s && !!mi && !!h && !!dom && !!mo && !!dow) {
                            expression += s + " " + mi  + " " + h + " " + dom + " " + mo + " " + dow;
                            if (!!y)
                                expression += " " + y;
                        } else {
                            throw new Error("must specify all values before building");
                        }

                        return expression;
                    };
                }
                return new Builder(this);
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
                this.$monthlyOptionOneRadio = $("<input type='radio' name='qcron-monthly-option' value='option-one' checked/>").appendTo($monthlyOptionOne);
                $monthlyOptionOne.append("<span>On day</san>");
                this.$mo1DomStartSelect = $("<select class='qcron-dom-select'></select>").appendTo($monthlyOptionOne);
                
                var $monthlyOptionTwo = $("<div class='qcron-monthly-option-two'></div>");
                this.$monthlyOptionTwoRadio = $("<input type='radio' name='qcron-monthly-option' value='option-two'/>").appendTo($monthlyOptionTwo);
                $monthlyOptionTwo.append("<span>The</span>");
                this.$mo2WeekSelect = $("<select class='qcron-week-select'></select>").appendTo($monthlyOptionTwo);
                this.$mo2DowSelect = $("<select class='qcron-dow-select'></select>").appendTo($monthlyOptionTwo);
                
                this.$monthIncrementSelect = $("<select class='qcron-month-increment'></select>");
                this.$monthStartSelect = $("<select class='qcron-monthstart-select'></select>");
                this.$hourStartSelect = $("<select class='qcron-hourstart-select'></select>");
                this.$minuteStartSelect = $("<select class='qcron-minutestart-select'></select>");

                for (var i = 0; i < 60; i++) {
                    if (i > 0 && i < 32)
                        $(".qcron-dom-select", $monthlyOptionOne).append("<option value='" + i + "'>" + i + "</option>");
                    
                    if (i > 0 && i <= 12) {
                        if (i < 12)
                            this.$monthIncrementSelect.append("<option value='" + i + "'>" + i + "</option>");
                        this.$monthStartSelect.append("<option value='" + i + "'>" + i + "</option>");
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
                this.$element.append("<span>every</span>");
                this.$element.append(this.$monthIncrementSelect);
                this.$element.append("<span>month(s) starting on month</span>");
                this.$element.append(this.$monthStartSelect);
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
                        monthIncr, monthStart;
                    if (selectedOption == "option-one") {
                        minuteStart = this.$minuteStartSelect.val();
                        hourStart   = this.$hourStartSelect.val();
                        monthIncr   = this.$monthIncrementSelect.val();
                        monthStart  = this.$monthStartSelect.val();
                        
                        var dom         = this.$element.find(".qcron-monthly-option-one .qcron-dom-select").val();
                            
                        this.expression = "0 " + minuteStart + " " + hourStart + " " + dom + " " + monthStart + "/" + monthIncr + " ? *";    
                    } else {
                        minuteStart = this.$minuteStartSelect.val();
                        hourStart   = this.$hourStartSelect.val();
                        monthIncr   = this.$monthIncrementSelect.val();
                        monthStart  = this.$monthStartSelect.val();
                        
                        var weekNum     = this.$element.find(".qcron-monthly-option-two .qcron-week-select").val(),
                            dow         = this.$element.find(".qcron-monthly-option-two .qcron-dow-select").val();
                        
                        this.expression = "0 " + minuteStart + " " + hourStart + " ? " + monthStart + "/" + monthIncr + " " + dow + "#" + weekNum + " *";
                    }
                    
                }

                if (!!this.options.changed)
                    this.options.changed.call(this, this.expression);
            },
            value: function (value) {
                var dfd = $.Deferred();
                if (!value)
                    dfd.resolve(this.expression);
                var parts = value.split(/\s+/);
                var builder = this._builder();
                try {
                    builder.seconds(parts[0])
                        .minutes(parts[1])
                        .hours(parts[2])
                        .month(parts[4])
                        .dayOfMonth(parts[3])
                        .dayOfWeek(parts[5]);
                    if (!!parts[6])
                        builder.year(parts[6]);
                    dfd.resolve(builder.build());
                } catch (ex) {
                    dfd.reject(ex);
                }
                return dfd.promise();
            },
            _builder: function () {
                function Builder(context) {
                    var s, mi, h, dom, mo, dow, y, ui = context;

                    this.seconds = function (seconds) {
                        if (seconds !== "0")
                            throw new Error("seconds must be 0");
                        s = seconds;
                        return this;
                    };

                    this.minutes = function (minutes) {
                        if (!s)
                            throw new Error("must set seconds first");
                        var p = /^([0-9]|[1-5][0-9])$/;
                        var match = p.exec(minutes);
                        if (match === null)
                            throw new Error("minutes must be a number between 0 and 59.");
                        mi = minutes;

                        ui.$minuteStartSelect.val(match[1]);

                        return this;
                    };

                    this.hours = function (hours) {
                        if (!mi)
                            throw new Error("must set minutes first.");
                        var p = /^([0-9]|1[0-9]|2[0-3])$/;
                        var match = p.exec(hours);
                        if (match === null)
                            throw new Error("hours must be a number between 0 and 23");
                        h = hours;

                        ui.$hourStartSelect.val(match[1]);

                        return this;
                    };

                    this.month = function (month) {
                        if (!h)
                            throw new Error('must set hours first');
                        var p = /^([1-9]|1[0-2])\/([1-9]|1[0-1])$/;
                        var match = p.exec(month);
                        if (match === null)
                            throw new Error("for montly option one - month must be of the form {1-12}/{1-11}");
                        mo = month;
                        
                        ui.$monthStartSelect.val(match[1]);
                        ui.$monthIncrementSelect.val(match[2]);
                        
                        return this;
                    };
                    
                    this.dayOfMonth = function (dayOfMonth) {
                        if (!mo)
                            throw new Error("must set month first");
                        
                        var p = /^([1-9]|[12]\d|3[01])|([?])$/;
                        var match = p.exec(dayOfMonth);
                        if (match === null)
                            throw new Error("invalid day of month should be of the form {1-31}");
                        
                        dom = dayOfMonth;

                        ui.$monthlyOptionOneRadio.attr('checked', !!match[1]);
                        ui.$monthlyOptionTwoRadio.attr('checked', !match[1]);
                        if (!!match[1])
                            ui.$mo1DomStartSelect.val(dom);
                            
                        return this;
                    };

                    this.dayOfWeek = function (dayOfWeek) {
                        if (!dom)
                            throw new Error("must set day of month first");
                        
                        var p = /^([1-7])#([1-4])|([?])$/;
                        var match = p.exec(dayOfWeek);
                        if (match ===  null)
                            throw new Error("Invalid day of week should of the form {1-7}#{1-4} or '?'");
                        if (match[3] && dom === "?")
                            throw new Error("Invalid day of week day. Day of month is not defined, therefore day of week must be.");
                        if (!match[3] && dom !== "?")
                            throw new Error("Invalid day of week. Day of months is already defined, therefore day of week cannot be.");
                        
                        dow = dayOfWeek;
                        
                        if (!match[3]) {
                            ui.$mo2WeekSelect.val(match[2]);
                            ui.$mo2DowSelect.val(match[1]);
                        }
                        
                        return this;
                    };

                    this.year = function (year) {
                        if (!dow)
                            throw new Error("must set dow first");
                        if (year !== "*")
                            throw new Error("year must be '*'");
                        y = year;
                        return this;
                    };

                    this.build = function () {
                        var expression = "";
                        if (!!s && !!mi && !!h && !!dom && !!mo && !!dow) {
                            expression += s + " " + mi  + " " + h + " " + dom + " " + mo + " " + dow;
                            if (!!y)
                                expression += " " + y;
                        } else {
                            throw new Error("must specify all values before building");
                        }

                        return expression;
                    };
                }
                return new Builder(this);
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
                this.$yearlyOptionOneRadio = $("<input type='radio' name='qcron-yearly-option' value='option-one' checked/>").appendTo($yearlyOptionOne);
                $yearlyOptionOne.append("<span>Every</san>");
                this.$yearlyOptionOneMonthSelect = $("<select class='qcron-month-select'></select>").appendTo($yearlyOptionOne);
                this.$yearlyOptionOneDomSelect = $("<select class='qcron-dom-select'></select>").appendTo($yearlyOptionOne);

                var $yearlyOptionTwo = $("<div class='qcron-yearly-option-two'></div>");
                this.$yearlyOptionTwoRadio = $("<input type='radio' name='qcron-yearly-option' value='option-two'/>").appendTo($yearlyOptionTwo);
                $yearlyOptionTwo.append("<span>The</span>");
                this.$yearlyOptionTwoWeekSelect = $("<select class='qcron-week-select'></select>").appendTo($yearlyOptionTwo);
                this.$yearlyOptionTwoDowSelect = $("<select class='qcron-dow-select'></select>").appendTo($yearlyOptionTwo);
                $yearlyOptionTwo.append("<span>of</span>");
                this.$yearlyOptionTwoMonthSelect = $("<select class='qcron-month-select'></select>").appendTo($yearlyOptionTwo);

                this.$hourStartSelect = $("<select class='qcron-hourstart-select'></select>");
                this.$minuteStartSelect = $("<select class='qcron-minutestart-select'></select>");

                for (var i = 0; i < 60; i++) {
                    if (i < 24)
                        this.$hourStartSelect.append("<option value='" + i + "'>" + twodigitformat(i) + "</option>");
                    this.$minuteStartSelect.append("<option value='" + i + "'>" + twodigitformat(i) + "</option>");
                }

                var self = this;
                $.each(__months, function (key, month) {
                    self.$yearlyOptionOneMonthSelect.append("<option value='" + key + "'>" + month.display + "</option>");
                    self.$yearlyOptionTwoMonthSelect.append("<option value='" + key + "'>" + month.display + "</option>");
                });
                
                $.each(__weeks, function (key, week) {
                    self.$yearlyOptionTwoWeekSelect.append("<option value='" + key + "'>" + week.display + "</option>"); 
                });
                
                $.each(__weekdays, function (key, weekday) {
                    self.$yearlyOptionTwoDowSelect.append("<option value='" + key + "'>" + weekday.display + "</option>");
                });
                
                this.$yearlyOptionOneMonthSelect.on('change', function () {
                    var month = __months[$(this).val()];
                    self.$yearlyOptionOneDomSelect.empty();
                    for (var i = 1; i <= month.days; i++) {
                        self.$yearlyOptionOneDomSelect.append("<option value='" + i + "'>" + i + "</option>");
                    }
                });
                this.$yearlyOptionOneMonthSelect.trigger('change');
                

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
            },
            value: function (value) {
                var dfd = $.Deferred();
                if (!value)
                    dfd.resolve(this.expression);
                var parts = value.split(/\s+/);
                var builder = this._builder();
                try {
                    builder.seconds(parts[0])
                        .minutes(parts[1])
                        .hours(parts[2])
                        .month(parts[4])
                        .dayOfMonth(parts[3])
                        .dayOfWeek(parts[5]);
                    if (!!parts[6])
                        builder.year(parts[6]);
                    dfd.resolve(builder.build());
                } catch (ex) {
                    dfd.reject(ex);
                }
                return dfd.promise();
            },
            _builder: function () {
                function Builder(context) {
                    var s, mi, h, dom, mo, dow, y, ui = context;

                    this.seconds = function (seconds) {
                        if (seconds !== "0")
                            throw new Error("seconds must be 0");
                        s = seconds;
                        return this;
                    };

                    this.minutes = function (minutes) {
                        if (!s)
                            throw new Error("must set seconds first");
                        var p = /^([0-9]|[1-5][0-9])$/;
                        var match = p.exec(minutes);
                        if (match === null)
                            throw new Error("minutes must be a number between 0 and 59.");
                        mi = minutes;

                        ui.$minuteStartSelect.val(match[1]);

                        return this;
                    };

                    this.hours = function (hours) {
                        if (!mi)
                            throw new Error("must set minutes first.");
                        var p = /^([0-9]|1[0-9]|2[0-3])$/;
                        var match = p.exec(hours);
                        if (match === null)
                            throw new Error("hours must be a number between 0 and 23");
                        h = hours;

                        ui.$hourStartSelect.val(match[1]);

                        return this;
                    };
                    
                    this.month = function (month) {
                        if (!h)
                            throw new Error('must set hours first');
                        var p = /^[1-9]|1[0-2]$/;
                        var match = p.exec(month);
                        if (match === null)
                            throw new Error("months must be between 1 and 12");
                        mo = month;
                        
                        ui.$yearlyOptionOneMonthSelect.val(mo);
                        return this;
                    };

                    this.dayOfMonth = function (dayOfMonth) {
                        if (!mo)
                            throw new Error("must set month first");

                        var p = /^([1-9]|[12]\d|3[01])|([?])$/;
                        var match = p.exec(dayOfMonth);
                        if (match === null)
                            throw new Error("invalid day of month should be of the form {1-31}");

                        dom = dayOfMonth;

                        ui.$yearlyOptionOneRadio.attr('checked', !!match[1]);
                        ui.$yearlyOptionTwoRadio.attr('checked', !match[1]);
                        if (!!match[1])
                            ui.$yearlyOptionOneDomSelect.val(dom);

                        return this;
                    };

                    this.dayOfWeek = function (dayOfWeek) {
                        if (!dom)
                            throw new Error("must set day of month first");

                        var p = /^([1-7])#([1-4])|([?])$/;
                        var match = p.exec(dayOfWeek);
                        if (match ===  null)
                            throw new Error("Invalid day of week should of the form {1-7}#{1-4} or '?'");
                        if (match[3] && dom === "?")
                            throw new Error("Invalid day of week day. Day of month is not defined, therefore day of week must be.");
                        if (!match[3] && dom !== "?")
                            throw new Error("Invalid day of week. Day of months is already defined, therefore day of week cannot be.");

                        dow = dayOfWeek;

                        if (!match[3]) {
                            ui.$yearlyOptionTwoWeekSelect.val(match[2]);
                            ui.$yearlyOptionTwoDowSelect.val(match[1]);
                        }

                        return this;
                    };

                    this.year = function (year) {
                        if (!dow)
                            throw new Error("must set dow first");
                        if (year !== "*")
                            throw new Error("year must be '*'");
                        y = year;
                        return this;
                    };

                    this.build = function () {
                        var expression = "";
                        if (!!s && !!mi && !!h && !!dom && !!mo && !!dow) {
                            expression += s + " " + mi  + " " + h + " " + dom + " " + mo + " " + dow;
                            if (!!y)
                                expression += " " + y;
                        } else {
                            throw new Error("must specify all values before building");
                        }

                        return expression;
                    };
                }
                return new Builder(this);
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