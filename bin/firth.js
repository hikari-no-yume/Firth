#!/usr/bin/env node

var argv = require('yargs')
    .usage('Usage: $0 [options] file')
    .demand(1)
    .options('help', {
        alias: 'h'
    })
    .help('help')
    .argv;

var fs = require('fs');
var Firth = require('../src/');

var tokens = Firth.lex(fs.readFileSync(argv._[0], {encoding: 'utf8'}));
var ast = Firth.parse(tokens);
Firth.executor.execute(ast);
