#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var parseHTML = require('./parseHTML')

// https://nodejs.org/docs/latest/api/process.html#process_process_argv
const PROCESS_ARGS = process.argv.slice(0);
const ARGS = PROCESS_ARGS.slice(2);
const PROGPATH = PROCESS_ARGS[1];
const PROGFILE = path.basename(PROGPATH);
const PROGDIR = path.dirname(PROGPATH);

function usage() {
    console.log('Usage: ' + PROGFILE + ' <INPUT HTML FILE> [OUTPUT JSON FILE]');
}

function parseArgs() {
  if (ARGS.length == 0 && !ARGS[0]) {
    usage();
    process.exit(1);
  }
}

function main() {
    parseArgs();
    convert(ARGS[0], ARGS[1], {pretty: true});
}

function convert(inputFile, outputFile, options) {
  options = options || {};
  options.pretty = !!options.pretty;

  fs.readFile(inputFile, 'utf-8', function read(err, data) {
    if (err) {
      throw err;
    }

    var list = parseHTML(data);

    var str = options.pretty ? JSON.stringify(list, undefined, 2) : JSON.stringify(list);
    if (outputFile) {
      fs.writeFile(outputFile, str, 'utf-8');
      console.log("Finish writing to " + outputFile);
    } else {
      console.log(str);
    }
  });
}

main();
