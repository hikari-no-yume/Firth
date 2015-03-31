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
var tokenTypes = require('../src/token-types');

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
            var token = newTokens[i];
            if (token.getName() === 'function-opening') {
                depth++;
            } else
            if (token.getName() === 'function-closing') {
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
    var stackValues = [];
    for (var i = stack.getHeight(); i > 0; i--) {
        var value = stack.peek(i - 1);
        stackValues.push(value);
    }
    console.log(stackValues.join(' '));
    rl.prompt();
});

rl.on('close', function() {
    process.exit(0);
});

