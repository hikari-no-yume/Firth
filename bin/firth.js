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
var Stdlib = require('../src/stdlib');
var scope = Stdlib;
var tokens = [];
var showTokens = false;
var showAst = false;
var builtins = {
    '\\help': function() {
        console.log('\\clear\tremove all element from stack & from the token buffer');
        console.log('\\reset\treset scope & \\clear');
        console.log('\\tokens\ttoggle - show parsed tokens. currently: ', showTokens);
        console.log('\\ast\ttoggle - show parsed AST. currently: ', showAst);
        console.log('\\help\tthis help');
    },
    '\\clear': function() {
        stack = new Stack();
        tokens = [];
    },
    '\\reset': function() {
        builtins.clear();
        scope = Stdlib;
    },
    '\\tokens': function() {
        showTokens = !showTokens;
    },
    '\\ast': function() {
        showAst = !showAst;
    }
}

var readline = require('readline');
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    completer: function (line) {
        var autocompleteScope = builtins;
        var lastWord = line;
        if (line.indexOf('\\') !== 0) {
            lastWord = line.split(/\b/).pop();
            autocompleteScope = scope;
        }
        var keys = [];
        for (var key in autocompleteScope) {
            keys.push(key);
        };
        return [keys.filter(function (c) {
            return c.indexOf(lastWord) === 0;
        }), lastWord];
    }
});

var _format = function(elements) {
    return elements.map(function(element) {
        var formattedElement = {
            type: element.type
        };
        if ('name' in element) {
            formattedElement.name = element.name;
        }
        if ('getValue' in element) {
            formattedElement.value = element.getValue();
            if (formattedElement.value instanceof Array) {
                formattedElement.value = _format(formattedElement.value);
            }
        }
        return formattedElement;
    });
}

var printTokens = function(tokens) {
    if (!showTokens) {
        return;
    }
    console.log('tokens:');
    console.dir(_format(tokens), {depth: null, colors: true});
};

var printAst = function(ast) {
    if (!showAst) {
        return;
    }
    console.log('AST:');
    console.dir(_format(ast), {depth: null, colors: true});
};

rl.setPrompt('> ');
rl.prompt();

var depth = 0;
rl.on('line', function (cmd) {
    if (builtins.hasOwnProperty(cmd)) {
        builtins[cmd]();
    } else {
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
            }
            printTokens(newTokens);
            tokens = tokens.concat.apply(tokens, newTokens);
            if (depth === 0) {
                var ast = Firth.parse(tokens);
                printAst(ast);
                tokens = [];
                scope = Firth.execute(ast, stack, scope);
            }
        } catch (e) {
            tokens = [];
            console.log(e);
        }
    }
    var stackValues = [];
    for (var i = stack.getHeight(); i > 0; i--) {
        var value = stack.peek(i - 1);
        stackValues.push(value.type + ':' + value.show());
    }
    console.log('(' + stackValues.join(' ') + ')');
    rl.prompt();
});

rl.on('close', function() {
    process.exit(0);
});

