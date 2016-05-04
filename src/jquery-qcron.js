/*!
 * jquery-cron
 * Version 0.1.1
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
        
        // all possible week days for use in the weekly tab
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
        
        // all possible week options for the montly and yearly tabs
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
        
        
        // all possible months and their associated *maximum* number of days
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
        
        /*
         * Root Widget for Jquery Qcron, which encapsulates several tabs
         * - minutes, hourly, daily, weekly, monthly, yearly, and custom
         * 
         * uses jquery ui tabs to render a set of tabs, each tab is its own
         * jquery widget that controls it's own logic and uses events and callbacks
         * to communicate with this root level widget. 
         */
        $.widget("jpgilchrist.qcron", {
            
            // default options for Jquery Qcron
            options: {
                minutes: true,  // display the minutes tab
                hourly: true,   // display the hourly tab
                daily: true,    // display the daily tab
                weekly: true,   // display the weekly tab
                monthly: true,  // display the monthly tab
                yearly: true,   // display the yearly tab
                custom: true,   // display the custom tab
                allowUserOverride: false,       // allows the user to manually enter a cron expression in the custom tab
                allowUserOverrideNote: null,    // An optional note to render as HTML on the custom tab
                validateUrl: null,  // URL that takes a GET with the query params: expression and count, which should validate the expression
                defaultTab: "daily" // the tab to be displayed (selected) by default
            },
            
            __controlsTemplate: "<div class='qcron-controls'><ul></ul></div>",  // the tabs
            
            _create: function () {
                
                // tabIndicies keeps track of which tabs are actually rendered and available to 
                // activate by utilizing that index in jquery ui tabs widget. Whether they are 
                // rendered or not is determined by the options provided during initialization.
                var currentTabIndex = 0;
                this.tabIndices = {};
                if (!!this.options.minutes)
                    this.tabIndices.minutes = currentTabIndex++;
                if (!!this.options.hourly)
                    this.tabIndices.hourly = currentTabIndex++;
                if (!!this.options.daily)
                    this.tabIndices.daily = currentTabIndex++;
                if (!!this.options.weekly)
                    this.tabIndices.weekly = currentTabIndex++;
                if (!!this.options.monthly)
                    this.tabIndices.monthly = currentTabIndex++;
                if (!!this.options.yearly)
                    this.tabIndices.yearly = currentTabIndex++;
                if (!!this.options.custom)
                    this.tabIndices.custom = currentTabIndex++;
            },
            
            /**
             * Retrieves or sets the value utlizing a $.Deferred promise object.
             * 
             * Using value as a setter:
             * - calls each tabs respective value function
             * - determines which tab supports the specified expression
             * - encountering an unsupported expression:
             * -- with validateURL: calls GET validateUrl?expression=value&count=20 to determine it's validity. 
             * --- if it's invalid, an error is thrown
             * --- if it's valid, custom tab is activated and the expression is rendered in the input.
             * -- without validate URL
             * --- activates the cust tab and renders the expression in the input.
             * 
             * Using value as a getter:
             * - calls the value function of the currently activated tab
             * - optionally validates the value returned with the validateUrl (if specified)
             * 
             * @param   {string}   value The expression
             * @returns {promise} a promise resolving a valid expression or error
             */
            value: function (value) {
                var dfd = $.Deferred(); // the deferred object
                
                var self = this; 
                
                if (!!value) { // if a value has been passed, then we need to set the value
                    
                    value = value.trim(); // first clean the value
                    
                    var parts = value.split(/\s+/); // split on white spaces
                    
                    // an expression must at least consist of:
                    // - 6 parts [seconds minutes hour dayOfMonth month dayOfYear]
                    // - 7 parts [seconds minutes hour dayOfMonth month dayOfYear year]
                    if (parts.length === 6 || parts.length === 7) { 
                        var errors = []; // list of erros to reject with in the case of an error
                        
                        var val = null;
                        if (!!this.$minutesTab && val === null) { // if minutes tab is available and no val is found yet
                            // attempt the set the value of the minutes tab
                            // - if it succeeds, then activat the minutes tab
                            // - otherwise add the error to the array to reject later
                            try {
                                val = this.$minutesTab.qcronMinutesTab("value", value); 
                                this.$qcronControls.tabs("option", "active", self.tabIndices.minutes); 
                            } catch (exc) {
                                errors.push(exc);
                            }
                        }
                        
                        if (!!this.$hourlyTab && val === null) { // if hourly tab is available and no val is found yet
                            // attempt the set the value of the hourly tab
                            // - if it succeeds, then activate the hourly tab
                            // - otherwise add the error to the array to reject later
                            try {
                                val = this.$hourlyTab.qcronHourlyTab("value", value);
                                this.$qcronControls.tabs("option", "active", self.tabIndices.hourly);
                            } catch (exc) {
                                errors.push(exc);
                            }
                        }
                        
                        if (!!this.$dailyTab && val === null) { // if daily tab is available and no val is found yet
                            // attempt the set the value of the daily tab
                            // - if it succeeds, then activate the daily tab
                            // - otherwise add the error to the array to reject later
                            try {
                                val = this.$dailyTab.qcronDailyTab("value", value);
                                this.$qcronControls.tabs("option", "active", self.tabIndices.daily);
                            } catch (exc) {
                                errors.push(exc);
                            }
                        }
                        
                        if (!!this.$weeklyTab && val === null) { // if weekly tab is available and no val is found yet
                            // attempt the set the value of the weekly tab
                            // - if it succeeds, then activate the weekly tab
                            // - otherwise add the error to the array to reject later
                            try {
                                val = this.$weeklyTab.qcronWeeklyTab("value", value);
                                this.$qcronControls.tabs("option", "active", self.tabIndices.weekly);
                            } catch (exc) {
                                errors.push(exc);
                            }
                        }
                        
                        if (!!this.$monthlyTab && val === null) { // if monthly tab is available and no val is found yet
                            // attempt the set the value of the monthly tab
                            // - if it succeeds, then activate the monthly tab
                            // - otherwise add the error to the array to reject later
                            try {
                                val = this.$monthlyTab.qcronMonthlyTab("value", value);
                                this.$qcronControls.tabs("option", "active", self.tabIndices.monthly);
                            } catch (exc) {
                                errors.push(exc);
                            }
                        }
                        
                        if (!!this.$yearlyTab && val === null) { // if yearly tab is available and no val is found yet
                            // attempt the set the value of the yearly tab
                            // - if it succeeds, then activate the yearly tab
                            // - otherwise add the error to the array to reject later
                            try {
                                val = this.$yearlyTab.qcronYearlyTab("value", value);
                                this.$qcronControls.tabs("option", "active", self.tabIndices.yearly);
                            } catch (exc) {
                                errors.push(exc);
                            }
                        }
                        
                        if (!!this.$customTab && val === null) { // if custom tab is available and no val is found yet
                            // attempt the set the value of the custom tab
                            // - if it succeeds, then activate the custom tab
                            // - otherwise add the error to the array to reject later
                            try {
                                val = this.$customTab.qcronCustomTab("value", value);
                                this.$qcronControls.tabs("option", "active", self.tabIndices.custom);
                            } catch (exc) {
                                errors.push(exc);
                            }
                        }
                        
                        // if val is still null here and custom tab wasn't available then add one last error to the errors array
                        if (!this.$customTab && val === null) {
                            errors.push('value is not supported by the ui and custom tab is not enabled');
                        }
                        
                        if (!!val) { // if there is a val then resolve with the val
                            dfd.resolve(val);
                        } else { // otherwise reject with the errors array
                            dfd.reject(errors);
                        }
                        
                    } else {
                        // reject because we know that there is no possibility for this to be valid.
                        dfd.reject("value must have all it's parts: 'seconds minutes hours dayOfMonth month dayOfWeek [year]'! Raw Value: [" + value + "]");
                    }
                    
                } else { // if no value has been passed to the function, then get the value out of the current activated tab
                    
                    /**
                     * Function to call on successfully getting the value out of the currently activated tab
                     * @param {string} value A cron expression returned by the tab
                     */
                    var success = function (value) {
                        // if initialized with a validateUrl, then call the endpoint and handle the validation
                        if (!!self.options.validateUrl) {
                            $.ajax({
                                url: self.options.validateUrl,
                                type: "GET", 
                                dataType: 'json',
                                data: {
                                    expression: value,
                                    count: 20
                                },
                                success: function (data) {
                                    // resolve with the cron expression returned by the endpoint
                                    dfd.resolve(data.expression);
                                },
                                error: function (error) {
                                    // reject with the error returned by the endpoint
                                    dfd.reject(error);
                                }
                            });
                        } else { 
                            // if validateUrl was not specified that we just have to accept the value, even on a custom tab. 
                            // it's up to the initializer to accept this outcome... 
                            dfd.resolve(value);
                        }
                    };
                    
                    /**
                     * Function to call when encountering an error when getting the value out of the currently activated tab.
                     * @param {Error} error The error thrown
                     */
                    var fail = function (error) {
                        dfd.reject(error);
                    };
                    
                    // determines which tab is currently activated, by looping over the tabIndices map for a match
                    var active = this.$qcronControls.tabs("option", "active");
                    for (var key in this.tabIndices) {
                        if (this.tabIndices[key] === active) {
                            active = key;
                            break;
                        }
                    }

                    // switch on the activated tab and get the value. call success or fail depending on the outcome.
                    switch (active) {
                        case "minutes":
                            try {
                                success(this.$minutesTab.qcronMinutesTab("value"));
                            } catch (exc) {
                                fail(exc);
                            }
                            break;
                        case "hourly":
                            try {
                                success(this.$hourlyTab.qcronHourlyTab("value"));
                            } catch (exc) {
                                fail(exc);
                            }
                            break;
                        case "daily":
                            try {
                                success(this.$dailyTab.qcronDailyTab("value"));
                            } catch (exc) {
                                fail(exc);
                            }
                            break;
                        case "weekly":
                            try {
                                success(this.$weeklyTab.qcronWeeklyTab("value"));
                            } catch (exc) {
                                fail(exc);
                            }
                            break;
                        case "monthly":
                            try {
                                success(this.$monthlyTab.qcronMonthlyTab("value"));
                            } catch (exc) {
                                fail(exc);
                            }
                            break;
                        case "yearly":
                            try {
                                success(this.$yearlyTab.qcronYearlyTab("value"));
                            } catch (exc) {
                                fail(exc);
                            }
                            break;
                        case "custom":
                            try {
                                success(this.$customTab.qcronCustomTab("value"));
                            } catch (exc) {
                                fail(exc);
                            }
                            break;
                    }
                }
                
                // return the promise object
                return dfd.promise();
            },
            
            _init: function () {
                this.$element = $(this.element); // convenient cache of the jquery object of the element
                this.$element.empty(); // empty the html and start from scratch
                
                this.$element.addClass("has-qcron"); // add a convenience class that indicates the widget is initialized
                if (!!this.options.width) // establish a width if specified as an option
                    this.$element.css("width", this.options.width);
                
                this.$qcronControls = $(this.__controlsTemplate); // cache the tabs jquery object template
                this.$element.append(this.$qcronControls); // appned tabs template to the element in order to prepare for rendering the actual content
                
                this._renderInputs(); // render the individual tabs
            },
            
            _renderInputs: function () {
                // render the individual tabs based on whether they have been enabled or not.
                if (!!this.options.minutes)
                    this._renderMinutesTab();
                if (!!this.options.hourly)
                    this._renderHourlyTab();
                if (!!this.options.daily)
                    this._renderDailyTab();
                if (!!this.options.weekly)
                    this._renderWeeklyTab();
                if (!!this.options.monthly)
                    this._renderMonthlyTab();
                if (!!this.options.yearly)
                    this._renderYearlyTab();
                if (!!this.options.custom)
                    this._renderCustomTab();
                
                // if the defaultTab has been specified and it's in the "enabled" set of tabs, then activate it in the initialization of jquery ui tabs
                if (!!this.options.defaultTab && !!this.tabIndices[this.options.defaultTab]) {
                    this.$qcronControls.tabs({
                        active: this.tabIndices[this.options.defaultTab]
                    });
                } else { // otherwise just initialize jquery ui tabs generically
                    this.$qcronControls.tabs();
                }        
            },
            
            __minutesTabItemTemplate: "<li><a href='#qcron-minutes-tab'>Minutes</a></li>",
            __minutesTabBodyTemplate: "<div id='qcron-minutes-tab'></div>",
            _renderMinutesTab: function () {
                // appends and renders the tab according to jquery ui tabs specification
                this.$qcronControls.find("ul").append($(this.__minutesTabItemTemplate));
                this.$minutesTab = $(this.__minutesTabBodyTemplate).qcronMinutesTab(); // initializes the minutes tab widget
                this.$qcronControls.append(this.$minutesTab);
            },

            __hourlyTabItemTemplate: "<li><a href='#qcron-hourly-tab'>Hourly</a></li>",
            __hourlyTabBodyTemplate: "<div id='qcron-hourly-tab'></div>",
            _renderHourlyTab: function () {
                // appends and renders the tab according to jquery ui tabs specification
                this.$qcronControls.find("ul").append($(this.__hourlyTabItemTemplate));
                this.$hourlyTab = $(this.__hourlyTabBodyTemplate).qcronHourlyTab(); // initializes the hourly tab widget
                this.$qcronControls.append(this.$hourlyTab);
            },

            __dailyTabItemTemplate: "<li><a href='#qcron-daily-tab'>Daily</a></li>",
            __dailyTabBodyTemplate: "<div id='qcron-daily-tab'></div>",
            _renderDailyTab: function () {
                // appends and renders the tab according to jquery ui tabs specification
                this.$qcronControls.find("ul").append($(this.__dailyTabItemTemplate));
                this.$dailyTab = $(this.__dailyTabBodyTemplate).qcronDailyTab(); // initializes the daily tab widget
                this.$qcronControls.append(this.$dailyTab);
            },

            __weeklyTabItemTemplate: "<li><a href='#qcron-weekly-tab'>Weekly</a></li>",
            __weeklyTabBodyTemplate: "<div id='qcron-weekly-tab'></div>",
            _renderWeeklyTab: function () {
                // appends and renders the tab according to jquery ui tabs specification
                this.$qcronControls.find("ul").append($(this.__weeklyTabItemTemplate));
                this.$weeklyTab = $(this.__weeklyTabBodyTemplate).qcronWeeklyTab(); // initializes the weekly tab widget
                this.$qcronControls.append(this.$weeklyTab);
            },

            __monthlyTabItemTemplate: "<li><a href='#qcron-monthly-tab'>Monthly</a></li>",
            __monthlyTabBodyTemplate: "<div id='qcron-monthly-tab'></div>",
            _renderMonthlyTab: function () {
                // appends and renders the tab according to jquery ui tabs specification
                this.$qcronControls.find("ul").append($(this.__monthlyTabItemTemplate));
                this.$monthlyTab = $(this.__monthlyTabBodyTemplate).qcronMonthlyTab(); // initializes the monthly tab widget
                this.$qcronControls.append(this.$monthlyTab);
            },

            __yearlyTabItemTemplate: "<li><a href='#qcron-yearly-tab'>Yearly</a></li>",
            __yearlyTabBodyTemplate: "<div id='qcron-yearly-tab'></div>",
            _renderYearlyTab: function () {
                // appends and renders the tab according to jquery ui tabs specification
                this.$qcronControls.find("ul").append($(this.__yearlyTabItemTemplate));
                this.$yearlyTab = $(this.__yearlyTabBodyTemplate).qcronYearlyTab(); // initializes the yearly tab widget
                this.$qcronControls.append(this.$yearlyTab);
            },
            
            __customTabItemTemplate: "<li><a href='#qcron-custom-tab'>Custom</a></li>",
            __customTabBodyTemplate: "<div id='qcron-custom-tab'></div>",
            _renderCustomTab: function () {
                // appends and renders the tab according to jquery ui tabs specification
                this.$qcronControls.find("ul").append($(this.__customTabItemTemplate));
                var options = {
                    inputEnabled: !!this.options.allowUserOverride // disables the input of the custom tab
                };
                if (!!this.options.allowUserOverrideNote) // provides a note to render on the custom tab
                    options.note = this.options.allowUserOverrideNote;
                    
                this.$customTab = $(this.__customTabBodyTemplate).qcronCustomTab(options); // initializes the custom tab widget
                this.$qcronControls.append(this.$customTab);
            }
        });
        
        /*
         * Jquery Qcron Minutes Tab
         * 
         * Defines a very restrictive definition of what running a cron expression every minute should look like
         * so that it is easily renderable in a selection ui that provides no dynamic user input, other than selection
         * dropdowns. 
         * 
         * The form of minutes as defined by quartz cron expressino language is '#/#' meaning an explicit minute to start at 
         * and an increment. Therefore 1/3 means: start a minute 1 and run every 3 minutes thereafter. Thus the outcome would
         * be 1,4,7,... 
         */
        $.widget("jpgilchrist.qcronMinutesTab", {
            options: {},
            _create: function () {
                this.$element = $(this.element); // convenient element cache
            },
            
            _init: function () {
                this.$minuteSelect = $("<select class='qcron-minute-select'></select>"); // the minute increment
                this.$minuteStartSelect = $("<select class='qcron-minutestart-select'></select>"); // the start minute
                
                // add 0 to 59 as possible start minutes
                // add 1 5o 59 as possibel minute increments
                for (var i = 0; i < 60; i++) {
                    if (i > 0)
                        this.$minuteSelect.append("<option value='" + i + "'>" + i + "</option>");
                    this.$minuteStartSelect.append("<option value='" + i + "'>" + i + "</option>");
                }
                
                // empty and render
                this.$element.empty();
                $("<label>Every</label>")
                    .append(this.$minuteSelect)
                    .append("minute(s)")
                    .appendTo(this.$element);
                $("<label>starting at</label>")
                    .append(this.$minuteStartSelect)
                    .append("past the hour.")
                    .appendTo(this.$element);
            },
            
            /**
             * Returns an expression built off of the current state of the tab
             * @returns {string} cron expression
             */
            build: function () {
                // 0 1/3 * * * ? *
                return "0 " + this.$minuteStartSelect.val() + "/" + this.$minuteSelect.val() + " * * * ? *";
            },
            
            /**
             * Gets or Sets the value for this tab by utilizing the defined Builder methods.
             * 
             * @throws Error error from {Builder}
             * @param   {string}   value optional cron expression
             * @returns {string} cron expression
             */
            value: function (value) {
                if (!value) // if a value hasn't been passed, then just build an expression for the current state of the tab
                    return this.build();
                var parts = value.split(/\s+/); // split on the white spaces
                var builder = this._builder(); // get a builder object
                builder.seconds(parts[0])
                    .minutes(parts[1])
                    .hours(parts[2])
                    .dayOfMonth(parts[3])
                    .month(parts[4])
                    .dayOfWeek(parts[5]);
                if (!!parts[6])
                    builder.year(parts[6]);
                return builder.build(); // return the built value (if valid)
            },

            /**
             * Always returns a new instance of {Builder}
             * @throws {Error} reason for failing, typically a pattern issue
             * @returns {Builder} minutes tab builder
             */
            _builder: function () {
                
                /**
                 * The builder for minutes tab. Internally defines functions to set each part of the cron expression
                 * in a convenient DSL.
                 * @throws {Error} Reason for failing.
                 * @param   {object} context - the context of the widget
                 * @returns {string} cron expression
                 */
                function Builder(context) {
                    var s, mi, h, dom, mo, dow, y, ui = context;

                    /**
                     * set the seconds 
                     * - pattern A where A is 0
                     * 
                     * @throws {Error} invalid seconds error
                     * @param   {string} seconds - the seconds expression
                     * @returns {Builder} the builder itself
                     */
                    this.seconds = function (seconds) {
                        var p = /^0$/;
                        if (p.exec(seconds) === null)
                            throw new Error("seconds must be '0'");
                        s = seconds;
                        return this;
                    };

                    /**
                     * set the minutes
                     * - pattern A/B where A is 0 - 59 and B is 1 - 59.
                     * 
                     * @throws {Error} invalid minutes error
                     * @param   {string} minutes - the minutes expression
                     * @returns {Builder} the builder itself
                     */
                    this.minutes = function (minutes) {
                        if (!s)
                            throw new Error("must set seconds first");
                        var p = /^([0-9]|[1-5][0-9])\/([1-9]|[1-5][0-9])$/;
                        var match = p.exec(minutes);
                        if (match === null)
                            throw new Error("minutes must be in the form {int}/{int}");
                        mi = minutes;

                        ui.$minuteStartSelect.val(match[1]);
                        ui.$minuteSelect.val(match[2]);

                        return this;
                    };

                    /**
                     * set the hours
                     * - pattern A where A is *
                     * 
                     * @throws {Error} invalid hours error
                     * @param   {string} hours - the hours expression
                     * @returns {Builder} the builder itself
                     */
                    this.hours = function (hours) {
                        if (!mi)
                            throw new Error("must set minutes first.");
                        var p = /^[*]$/;
                        if (p.exec(hours) === null)
                            throw new Error("hours must be '*'");
                        h = hours;
                        return this;
                    };
                    

                    /**
                     * set the day of month
                     * - pattern A where A is * or ?
                     * 
                     * @throws {Error} invalid day of month error
                     * @param   {string} dayOfMonth - the day of month expression
                     * @returns {Builder} the builder itself
                     */
                    this.dayOfMonth = function (dayOfMonth) {
                        if (!h)
                            throw new Error("must set hour first");
                        var p = /^[*?]$/;
                        if (p.exec(dayOfMonth) === null)
                            throw new Error("day of month must be '*' or '?'");
                        dom = dayOfMonth;
                        return this;
                    };
                    
                    /**
                     * set the month
                     * - pattern A where A is *
                     * 
                     * @throws {Error} invalid month error
                     * @param   {string} month - the month expression
                     * @returns {Builder} the builder itself
                     */
                    this.month = function (month) {
                        if (!dom)
                            throw new Error('must set dom first');
                        var p = /^[*]$/;
                        if (p.exec(month) === null)
                            throw new Error("month must be '*'");
                        mo = month;
                        return this;
                    };

                    /**
                     * set the day of week
                     * - pattern A where A is * or ? but not equivalent to day of month
                     * 
                     * @throws {Error} invalid day of week error
                     * @param   {string} dayOfWeek - the day of week expression
                     * @returns {Builder} the builder itself
                     */
                    this.dayOfWeek = function (dayOfWeek) {
                        if (!mo)
                            throw new Error("must set month first");
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

                    /**
                     * set the year
                     * - pattern A where A is *
                     * 
                     * @throws {Error} invalid day of year error
                     * @param   {string} year - the year expression
                     * @returns {Builder} the builder itself
                     */
                    this.year = function (year) {
                        if (!dow)
                            throw new Error("must set dow first");
                        var p = /^[*]$/;
                        if (p.exec(year) === null)
                            throw new Error("year must be '*'");
                        y = year;
                        return this;
                    };

                    /**
                     * build the full cron expression based on the configured builder and returns it. 
                     * 
                     * @throws {Error} invalid cron expression error
                     * @returns {string} the cron expression
                     */
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
                
                return new Builder(this); // the builder initialized with the context of the plugin
            }
        });
        
        $.widget("jpgilchrist.qcronHourlyTab", {
            options: {},
            _create: function () {
                this.$element = $(this.element);
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
                $("<label>Every</label>")
                    .append(this.$hourSelect)
                    .append("hour(s)")
                    .appendTo(this.$element);
                $("<label>starting at</label>")
                    .append(this.$hourStartSelect)
                    .append(":")
                    .append(this.$minuteStartSelect)
                    .appendTo(this.$element);
            },
            build: function () {
                return "0 " + this.$minuteStartSelect.val() + " " + this.$hourStartSelect.val() + "/" + this.$hourSelect.val() + " * * ? *";
            },
            value: function (value) {
                if (!value)
                    return this.build();
                
                var parts = value.split(/\s+/);
                var builder = this._builder();
                builder.seconds(parts[0])
                    .minutes(parts[1])
                    .hours(parts[2])
                    .dayOfMonth(parts[3])
                    .month(parts[4])
                    .dayOfWeek(parts[5]);
                if (!!parts[6])
                    builder.year(parts[6]);
                return builder.build();
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
                        var match = p.exec(hours);
                        if (match === null)
                            throw new Error("hours must be in the form {0-23}/{1-23}");
                        h = hours;
                        
                        ui.$hourSelect.val(match[2]);
                        ui.$hourStartSelect.val(match[1]);
                        
                        return this;
                    };

                    this.dayOfMonth = function (dayOfMonth) {
                        if (!h)
                            throw new Error("must set hour first");
                        var p = /^[*?]$/;
                        if (p.exec(dayOfMonth) === null)
                            throw new Error("day of month must be '*' or '?'");
                        dom = dayOfMonth;
                        return this;
                    };
                    
                    this.month = function (month) {
                        if (!dom)
                            throw new Error('must set dom first');
                        var p = /^[*]$/;
                        if (p.exec(month) === null)
                            throw new Error("month must be '*'");
                        mo = month;
                        return this;
                    };

                    this.dayOfWeek = function (dayOfWeek) {
                        if (!mo)
                            throw new Error("must set month first");
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
            options: {},
            _create: function () {
                this.$element = $(this.element);
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
                $("<label>Every</label>")
                    .append(this.$daySelect)
                    .append("day(s)")
                    .appendTo(this.$element);
                $("<label>at</label>")
                    .append(this.$hourStartSelect)
                    .append(":")
                    .append(this.$minuteStartSelect)
                    .appendTo(this.$element);
                $("<label>starting on day</label>")
                    .append(this.$dayStartSelect)
                    .appendTo(this.$element);
            },
            build: function () {
                return "0 " + this.$minuteStartSelect.val() + " " + this.$hourStartSelect.val() +  " " + this.$dayStartSelect.val() + "/" + this.$daySelect.val() + " * ? *";
            },
            value: function (value) {
                if (!value)
                    return this.build();
                var parts = value.split(/\s+/);
                var builder = this._builder();
                builder.seconds(parts[0])
                    .minutes(parts[1])
                    .hours(parts[2])
                    .dayOfMonth(parts[3])
                    .month(parts[4])
                    .dayOfWeek(parts[5]);
                if (!!parts[6])
                    builder.year(parts[6]);
                return builder.build();
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

                    this.dayOfMonth = function (dayOfMonth) {
                        if (!h)
                            throw new Error("must set hour first");
                        var p = /^([1-9]|1[0-9]|2[0-9]|3[0-1])\/([1-9]|1[0-9]|2[0-9]|3[0-1])$/;
                        var match = p.exec(dayOfMonth);
                        if (match === null)
                            throw new Error("day of month must be of the form {1-31}/{1-30}");
                        dom = dayOfMonth;

                        ui.$dayStartSelect.val(match[1]);
                        ui.$daySelect.val(match[2]);

                        return this;
                    };
                    
                    this.month = function (month) {
                        if (!dom)
                            throw new Error('must set dom first');
                        var p = /^[*]$/;
                        if (p.exec(month) === null)
                            throw new Error("month must be '*'");
                        mo = month;
                        return this;
                    };

                    this.dayOfWeek = function (dayOfWeek) {
                        if (!mo)
                            throw new Error("must set month first");
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
            options: {},
            _create: function () {
                this.$element = $(this.element);
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
                $("<label>at</label>")
                    .append(this.$hourStartSelect)
                    .append(":")
                    .append(this.$minuteStartSelect)
                    .appendTo(this.$element);
            },
            build: function () {
                var selectedDaysOfWeek = [];
                this.$dayOfWeekCheckboxes.find("input.qcron-dow-input:checked").each(function(key, dow) {
                    selectedDaysOfWeek.push(__weekdays[$(dow).val()].value);
                });

                return "0 " + this.$minuteStartSelect.val() + " " + this.$hourStartSelect.val() + " ? * " + selectedDaysOfWeek.join(",") + " *";
            },
            value: function (value) {
                if (!value)
                    return this.build();
                var parts = value.split(/\s+/);
                var builder = this._builder();
                builder.seconds(parts[0])
                    .minutes(parts[1])
                    .hours(parts[2])
                    .dayOfMonth(parts[3])
                    .month(parts[4])
                    .dayOfWeek(parts[5]);
                if (!!parts[6])
                    builder.year(parts[6]);
                return builder.build();
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

                    this.dayOfMonth = function (dayOfMonth) {
                        if (!h)
                            throw new Error("must set hour first");
                        var p = /^[?]$/;
                        if (p.exec(dayOfMonth) === null)
                            throw new Error("day of month must be '?' since day of week is not '?'");
                        dom = dayOfMonth;
                        return this;
                    };
                    
                    this.month = function (month) {
                        if (!dom)
                            throw new Error('must set day of month first');
                        var p = /^[*]$/;
                        if (p.exec(month) === null)
                            throw new Error("month must be '*'");
                        mo = month;
                        return this;
                    };

                    this.dayOfWeek = function (dayOfWeek) {
                        if (!mo)
                            throw new Error("must set month first");
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
            options: {},
            _create: function () {
                this.$element = $(this.element);
                
                this._on(this.element, {
                    "change select": function (event) {
                        var $target = $(event.target);
                        if ($target.parent().hasClass("qcron-monthly-option-one")) {
                            this.$element.find("input[name='qcron-monthly-option']")[0].checked = true;
                            this.$element.find("input[name='qcron-monthly-option']")[1].checked = false;
                        } else if ($target.parent().hasClass("qcron-monthly-option-two")) {
                            this.$element.find("input[name='qcron-monthly-option']")[0].checked = false;
                            this.$element.find("input[name='qcron-monthly-option']")[1].checked = true;
                        }
                    }
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
                $("<label>every</label>")
                    .append(this.$monthIncrementSelect)
                    .append("month(s)")
                    .appendTo(this.$element);
                $("<label>starting on month</label>")
                    .append(this.$monthStartSelect)
                    .appendTo(this.$element);
                $("<label>at</label>")
                    .append(this.$hourStartSelect)
                    .append(":")
                    .append(this.$minuteStartSelect)
                    .appendTo(this.$element);
            },
            build: function () {
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

                    return "0 " + minuteStart + " " + hourStart + " " + dom + " " + monthStart + "/" + monthIncr + " ? *";    
                } else {
                    minuteStart = this.$minuteStartSelect.val();
                    hourStart   = this.$hourStartSelect.val();
                    monthIncr   = this.$monthIncrementSelect.val();
                    monthStart  = this.$monthStartSelect.val();

                    var weekNum     = this.$element.find(".qcron-monthly-option-two .qcron-week-select").val(),
                        dow         = this.$element.find(".qcron-monthly-option-two .qcron-dow-select").val();

                    return "0 " + minuteStart + " " + hourStart + " ? " + monthStart + "/" + monthIncr + " " + dow + "#" + weekNum + " *";
                }
            },
            value: function (value) {
                if (!value)
                    return this.build();
                var parts = value.split(/\s+/);
                var builder = this._builder();
                builder.seconds(parts[0])
                    .minutes(parts[1])
                    .hours(parts[2])
                    .dayOfMonth(parts[3])
                    .month(parts[4])
                    .dayOfWeek(parts[5]);
                if (!!parts[6])
                    builder.year(parts[6]);
                return builder.build();
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
                    
                    this.dayOfMonth = function (dayOfMonth) {
                        if (!h)
                            throw new Error("must set hours first");

                        var p = /^([1-9]|[12]\d|3[01])|([?])$/;
                        var match = p.exec(dayOfMonth);
                        if (match === null)
                            throw new Error("invalid day of month should be of the form {1-31}");

                        dom = dayOfMonth;

                        ui.$monthlyOptionOneRadio[0].checked = !!match[1];
                        ui.$monthlyOptionTwoRadio[0].checked = !match[1];
                        if (!!match[1])
                            ui.$mo1DomStartSelect.val(dom);

                        return this;
                    };

                    this.month = function (month) {
                        if (!dom)
                            throw new Error('must set day of month first');
                        var p = /^([1-9]|1[0-2])\/([1-9]|1[0-1])$/;
                        var match = p.exec(month);
                        if (match === null)
                            throw new Error("for montly option one - month must be of the form {1-12}/{1-11}");
                        mo = month;
                        
                        ui.$monthStartSelect.val(match[1]);
                        ui.$monthIncrementSelect.val(match[2]);
                        
                        return this;
                    };

                    this.dayOfWeek = function (dayOfWeek) {
                        if (!mo)
                            throw new Error("must set month first");
                        
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
            options: {},
            _create: function () {
                this.$element = $(this.element);
                
                this._on(this.element, {
                    "change select": function (event) {
                        var $target = $(event.target);
                        if ($target.parent().hasClass("qcron-yearly-option-one")) {
                            this.$element.find("input[name='qcron-yearly-option']")[0].checked = true;
                            this.$element.find("input[name='qcron-yearly-option']")[1].checked = false;
                        } else if ($target.parent().hasClass("qcron-yearly-option-two")) {
                            this.$element.find("input[name='qcron-yearly-option']")[0].checked = false;
                            this.$element.find("input[name='qcron-yearly-option']")[1].checked = true;
                        }
                    }
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
                $("<label>at</label>")
                    .append(this.$hourStartSelect)
                    .append(":")
                    .append(this.$minuteStartSelect)
                    .appendTo(this.$element);
            },
            build: function () {
                var selectedOption = this.$element.find("input[name='qcron-yearly-option']:checked").val(),
                    minuteStart = this.$minuteStartSelect.val(),
                    hourStart = this.$hourStartSelect.val(),
                    month;

                if (selectedOption == "option-one") {
                    minuteStart = this.$minuteStartSelect.val();
                    hourStart   = this.$hourStartSelect.val();
                    month       = this.$element.find(".qcron-yearly-option-one .qcron-month-select").val();

                    var dom = this.$element.find(".qcron-yearly-option-one .qcron-dom-select").val();

                    return "0 " + minuteStart + " " + hourStart + " " + dom + " " + month + " ? *";
                } else {
                    minuteStart = this.$minuteStartSelect.val();
                    hourStart   = this.$hourStartSelect.val();
                    month       = this.$element.find(".qcron-yearly-option-two .qcron-month-select").val();

                    var weekNum     = this.$element.find(".qcron-yearly-option-two .qcron-week-select").val(),
                        dow         = this.$element.find(".qcron-yearly-option-two .qcron-dow-select").val();

                    return "0 " + minuteStart + " " + hourStart + " ? " + month + " " + dow + "#" + weekNum + " *";
                }
            },
            value: function (value) {
                if (!value)
                    return this.build();
                var parts = value.split(/\s+/);
                var builder = this._builder();    
                builder.seconds(parts[0])
                    .minutes(parts[1])
                    .hours(parts[2])
                    .dayOfMonth(parts[3])
                    .month(parts[4])
                    .dayOfWeek(parts[5]);
                if (!!parts[6])
                    builder.year(parts[6]);
                return builder.build();
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

                    this.dayOfMonth = function (dayOfMonth) {
                        if (!h)
                            throw new Error("must set hours first");

                        var p = /^([1-9]|[12]\d|3[01])|([?])$/;
                        var match = p.exec(dayOfMonth);
                        if (match === null)
                            throw new Error("invalid day of month should be of the form {1-31}");

                        dom = dayOfMonth;

                        ui.$yearlyOptionOneRadio[0].checked = !!match[1];
                        ui.$yearlyOptionTwoRadio[0].checked = !match[1];
                        if (!!match[1])
                            ui.$yearlyOptionOneDomSelect.val(dom);

                        return this;
                    };
                    
                    this.month = function (month) {
                        if (!h)
                            throw new Error('must set day of month first');
                        var p = /^[1-9]|1[0-2]$/;
                        var match = p.exec(month);
                        if (match === null)
                            throw new Error("months must be between 1 and 12");
                        mo = month;

                        if (dom === "?") { // ui option two
                            ui.$yearlyOptionTwoMonthSelect.val(mo);
                        } else { // ui option one
                            ui.$yearlyOptionOneMonthSelect.val(mo);    
                        }
                        
                        return this;
                    };

                    this.dayOfWeek = function (dayOfWeek) {
                        if (!mo)
                            throw new Error("must set month first");

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
        
        $.widget("jpgilchrist.qcronCustomTab", {
            options: {
                inputEnabled: true,
                note: "Custom override is not enabled through the ui."
            },
            _create: function () {
                this.$element = $(this.element);
            },
            _init: function () {
                if (!this.options.inputEnabled)
                    $("<div class='qcron-custom-tab-note'></div>")
                        .html("<strong>Note: </strong><span>" + this.options.note + "</span>")
                        .appendTo(this.$element);
                    
                this.$input = $("<input type='text' class='qcron-raw-input'/>").appendTo(this.$element);
                this.$input.prop('disabled', !this.options.inputEnabled);
                $("<div><a target='_blank' href='http://www.quartz-scheduler.org/documentation/quartz-2.x/tutorials/crontrigger'>Quartz Syntax Help</a></div>")
                    .appendTo(this.$element);
            },
            build: function () {                
                return !!this.$input.val() ? this.$input.val().trim() : null;
            },
            value: function (value) {                
                if (!value)
                    return this.build();
                this.$input.val(value.trim());
                return this.$input.val();
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