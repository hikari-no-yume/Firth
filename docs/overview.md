The Firth Programming Language: Overview with code samples
==========================================================

Firth should feel familiar to you if you're used to concatenative, stack-oriented languages. The following sample programs demonstrate its basics.

### hello, world

```firth
'hello, world\n' print.
```

The classic. `'hello, world\n'` is pushed onto the stack, followed by the `print` function. Note that `print` hasn't been called yet; unlike in some other stack-oriented languages, in Firth mentioning a function's name doesn't execute it: function names aren't special, they're just variable names, and like any other variable name, using it just places its value on the stack. So, we must then use `.`, which invokes the `print` function and pops it off the stack. The `print` function which we've invoked pops `'hello, world\n'` off the stack and prints it.

These three tokens give us the following end result:

    hello, world

Cool, huh?

### Nineteen Eighty-Four

```firth
2 2 add. 5 eq.
[
    'Long live the Party!' print.
] [
    'You must be reëducated, Comrade.' print.
] ifelse.
```

This program isn't very useful, but it does demonstrate some important concepts:

* `2 2 add.` adds two and two - the `add` function takes two numbers and produces their sum (result: `4`)
* `5 eq.` tests if the result was equal to `5` - the `eq` function takes two values and produces a boolean (result: `false`)
* The curly braces create *anonymous functions* (both just print messages, in our case)
* `ifelse.` looks at the boolean result from that comparison earlier, and runs the first anonymous function if it was `true`, or the second if it was `false`. In this case, it runs the function that prints `"You must be reëducated, Comrade."`, because Firth was clearly created by an enemy of Ingsoc who doesn't know that 2 + 2 = 5, and always has done. 

### Factorial

This is the most complex example:

```firth
/factorial [
    dup. 1 gt.
    [
        dup. 1 sub.
        factorial. mul.
    ] [
        drop. 1
    ] ifelse.
] def.

5 factorial. print.
```

* `/factorial` creates a symbol naming the (not yet extant) `factorial` variable
* Inside the main function:
    * `dup. 1 gt.` duplicates the value at the top of the stack (the argument to the function), and checks if it is greater than `1`
    * `ifelse.` handles two cases:
        * When the value is greater than 1:
            * `dup. 1 sub.` duplicates it and subtracts one from it
            * `factorial. mul.` recursively calls `factorial` (the function we're declaring) and multiplies its result by the original value
        * When the value isn't greater than 1:
            * `drop. 1` drops the value from the top of the stack (the argument to the function), then puts one in its place
* `def.` takes our symbol and anonymous function, and defines a variable with the name specified by the symbol and the value being the function
* `5 factorial. print.` calls our newly-defined function and prints the result it produces.

Output:

    120

Hopefully, you now understand the basics of Firth!
