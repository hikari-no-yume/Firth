var Firth = require('../../src');


var inputTextarea = document.getElementById('firth-input');
var runButton = document.getElementById('firth-run');
var tokenOutput = document.getElementById('firth-tokens');
var astOutput = document.getElementById('firth-ast');

runButton.onclick = function () {
    try {
        var tokens = Firth.lex(inputTextarea.value);
    } catch (e) {
        alert('Error when lexing: ' + e.message);
    }
    tokenOutput.value = tokens.map(function (token) { return JSON.stringify(token); }).join('\n');

    try {
        var ast = Firth.parse(tokens);
    } catch (e) {
        alert('Error when parsing: ' + e.message);
    }
    astOutput.value = JSON.stringify(ast, null, 4);

    try {
        Firth.executor.execute(ast);
    } catch (e) {
        alert('Error when executing: ' + e.message);
    }
};
