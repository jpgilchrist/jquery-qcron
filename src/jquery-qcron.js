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
                preview: true,
                validateUrl: "http://localhost/veoci/api-v1/p/cron"
            },
            
            __controlsTemplate: "<div class='qcron-controls'><ul></ul></div>",
            __previewTemplate: "<div class='qcron-preview'></div>",
            
            _create: function (options) {
                $.extend(this.options, options);
                
                this._on(this.element, {
                    "qcron:expression": function (event, exp) {
                        this.expression = exp;
                        
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
                                },
                                error: function (error) {
                                    console.log('error', error);
                                }
                            });
                        }
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
                
                this.$qcronControls.tabs({
                    active: 4,
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
                var $minutesTab = $(this.__minutesTabBodyTemplate).qcronMinutesTab({
                    changed: function (exp) {
                        self._trigger(':expression', null, exp);
                    }
                });
                this.$qcronControls.append($minutesTab);
            },

            __hourlyTabItemTemplate: "<li><a href='#qcron-hourly-tab'>Hourly</a></li>",
            __hourlyTabBodyTemplate: "<div id='qcron-hourly-tab'></div>",
            _renderHourlyTab: function () {
                var self = this;
                this.$qcronControls.find("ul").append($(this.__hourlyTabItemTemplate));
                var $hourlyTab = $(this.__hourlyTabBodyTemplate).qcronHourlyTab({
                    changed: function (exp) {
                        self._trigger(':expression', null, exp);
                    }
                });
                this.$qcronControls.append($hourlyTab);
            },

            __dailyTabItemTemplate: "<li><a href='#qcron-daily-tab'>Daily</a></li>",
            __dailyTabBodyTemplate: "<div id='qcron-daily-tab'></div>",
            _renderDailyTab: function () {
                var self = this;
                this.$qcronControls.find("ul").append($(this.__dailyTabItemTemplate));
                var $dailyTab = $(this.__dailyTabBodyTemplate).qcronDailyTab({
                    changed: function (exp) {
                        self._trigger(':expression', null, exp);
                    }
                });
                this.$qcronControls.append($dailyTab);
            },

            __weeklyTabItemTemplate: "<li><a href='#qcron-weekly-tab'>Weekly</a></li>",
            __weeklyTabBodyTemplate: "<div id='qcron-weekly-tab'></div>",
            _renderWeeklyTab: function () {
                var self = this;
                this.$qcronControls.find("ul").append($(this.__weeklyTabItemTemplate));
                var $weeklyTab = $(this.__weeklyTabBodyTemplate).qcronWeeklyTab({
                    changed: function (exp) {
                        self._trigger(':expression', null, exp);
                    }
                });
                this.$qcronControls.append($weeklyTab);
            },

            __monthlyTabItemTemplate: "<li><a href='#qcron-monthly-tab'>Monthly</a></li>",
            __monthlyTabBodyTemplate: "<div id='qcron-monthly-tab'></div>",
            _renderMonthlyTab: function () {
                var self = this;
                this.$qcronControls.find("ul").append($(this.__monthlyTabItemTemplate));
                var $monthlyTab = $(this.__monthlyTabBodyTemplate).qcronMonthlyTab({
                    changed: function (exp) {
                        self._trigger(':expression', null, exp);
                    }
                });
                this.$qcronControls.append($monthlyTab);
            },

            __yearlyTabItemTemplate: "<li><a href='#qcron-yearly-tab'>Yearly</a></li>",
            __yearlyTabBodyTemplate: "<div id='qcron-yearly-tab'></div>",
            _renderYearlyTab: function () {
                var self = this;
                this.$qcronControls.find("ul").append($(this.__yearlyTabItemTemplate));
                var $yearlyTab = $(this.__yearlyTabBodyTemplate).qcronYearlyTab({
                    changed: function (exp) {
                        self._trigger(':expression', null, exp);
                    }
                });
                this.$qcronControls.append($yearlyTab);
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
                this.$daySelect = $("<select class='qcron-everyday-select'></select>");
                this.$dayStartSelect = $("<select class='qcron-daystart-select'></select>");
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
                $monthlyOptionOne.append("<span>On day</san>").appendTo($monthlyOptionOne);
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