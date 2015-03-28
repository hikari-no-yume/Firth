#!/usr/bin/env node

var argv = require('yargs')
    .usage('Usage: $0 [options] file')
    .options('help', {
        alias: 'h'
    })
    .help('help')
    .argv;

var Firth = require('../src/');

if (argv._.length) {
    var fs = require('fs');

    var tokens = Firth.lex(fs.readFileSync(argv._[0], {encoding: 'utf8'}));
    var ast = Firth.parse(tokens);
    Firth.execute(ast, new Firth.Stack(), Firth.stdlib);
    return;
}

var Stack = require('../src/Stack');
var stack = new Stack();
var scope = require('../src/stdlib');

var readline = require('readline');
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    completer: function (line) {
        var lastWord = line.split(/\b/).pop();
        var keys = [];
        for (var key in scope) {
            keys.push(key);
        };
        return [keys.filter(function (c) {
            return c.indexOf(lastWord) === 0;
        }), lastWord];
    }
});

rl.setPrompt('> ');
rl.prompt();

var depth = 0;
var tokens = [];
rl.on('line', function (cmd) {
    try {
        var newTokens = Firth.lex(cmd);
        for (var i = 0; i < newTokens.length; i++) {
            var type = newTokens[i].type;
            if (type === '[') {
                depth++;
            } else
            if (type === ']') {
                depth--;
            }
        };
        tokens = tokens.concat.apply(tokens, newTokens);
        if (depth === 0) {
            var ast = Firth.parse(tokens);
            tokens = [];
            scope = Firth.execute(ast, stack, scope);
        }
    } catch (e) {
        tokens = [];
        console.error(e);
    }
    rl.prompt();
});

rl.on('close', function() {
    process.exit(0);
});

