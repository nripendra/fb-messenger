'use strict';

var Formatter = require('./formatter');
var ipc = require('ipc');

var defaultTimer = {
      start: function () {
            this.started = Date.now();
      },
      elapsed: function () {
            return Math.round((Date.now() - this.started) / 100) * 100;
      }
};


var failures = 0, passes = 0;
var options = {};
options.done = options.done || function () { };
options.includeStackTrace = !!options.includeStackTrace;
options.timer = options.timer || defaultTimer;
options.isVerbose = !!options.isVerbose;
var formatter = new Formatter(options);
var failureSummary = [];
var reporter = {
      jasmineStarted: function (suiteInfo) {
            formatter.print('Running suite with ' + suiteInfo.totalSpecsDefined + ' specs...');
            formatter.printNewline();
      },
      suiteStarted: function (result) {
            formatter.print('Suite: ' + result.description);
            formatter.printNewline();
      },
      specStarted: function (result) {
            //formatter.print('Spec started: ' + result.description);
            //formatter.printNewline();
      },
      specDone: function (result) {
            
            var prefix;
            var color;
            if(result.status == 'passed') {
                 prefix = '✓ ';
                 color = 'green';
            }else if(result.status == 'pending') {
                 prefix =  '* ';
                 color = 'yellow'; 
            } else if (result.status == 'disabled') {
                  prefix =  '- ';
                  color = 'gray';
            }  else  {
                  prefix =  '✗ ';
                  color = 'red';
            }
            
            var text = prefix + result.description ;//+ ' ' + result.status;
            
            formatter.print(formatter.indent(formatter.colorize(color, text), 3));
            formatter.printNewline();
            
            failures += result.failedExpectations.length;
            passes += result.passedExpectations.length;
            
            if(result.failedExpectations.length > 0) {
                  failureSummary.push(result);
            }
      },
      suiteDone: function (result) {

      },
      jasmineDone: function () {
            if(failureSummary.length > 0){
                  formatter.print('Failure summary');
                  for(var j = 0; j< failureSummary.length; j++) {
                        var result = failureSummary[j];
                        formatter.print(result.fullName + ":");
                        formatter.printNewline();
                        formatter.print("Number of expectations failed:" + result.failedExpectations.length);
                        formatter.printNewline();
                        for(var i = 0; i < result.failedExpectations.length; i++) {
                              formatter.print(result.failedExpectations[i].message);
                              formatter.printNewline();      
                        }
                  }
            }
            
            formatter.print('...................\n');
            formatter.print('All Done!!');
            ipc.send('renderer-test-result', failures, passes);
      }
};

module.exports = reporter;