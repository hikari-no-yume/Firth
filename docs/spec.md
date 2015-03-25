The Firth Programming Language: Specification and Language Reference
====================================================================

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL
NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and
"OPTIONAL" in this document are to be interpreted as described in
[RFC 2119](http://tools.ietf.org/html/rfc2119).

Lexical structure
-----------------

A Firth program source file consists of a sequence of UTF-8-encoded plaintext characters. Space (U+0020), carriage return (U+000D) and line feed (U+000A) characters between tokens are considered to be "whitespace" and are ignored. Tab characters (U+0009) are illegal within a file. Implementations of Firth MUST produce a syntax error when a tab is encountered.

A Firth program source file may contain line comments, which can exist between (but NOT inside) tokens. A line comment begins at a semicolon character (`;`, U+003B) and ends at the first following line feed character (U+000A). Line comments, like whitespace, are ignored.

A Firth program source file may contain any of the following tokens. Their formats are defined with regular expressions delimited by /slashes/.

* `/\./` - Function invocation operator
* `/\[/` and `/\]/` - Function literal opening and closing braces (respectively)
  
  Function literals are delimited by these (see syntax)
* `/[_a-z][_a-z0-9]+/` - Variable name

  The value of this token (the variable name) is the entire literal text
* `/\/[_a-z][_a-z0-9]+/` - Symbol literal

  The value of this token (the symbol value) is the literal text following the slash (`/`))
* `/[\+\-]?[0-9]+/` - Integer literal

  The literal text of this token is interpreted as the decimal representation of an integer
  The value of this token (the integer value) is the aforementioned integer value the literal text represents
* `/(true)|(false)/` - Boolean literal

* `/'((\\')?.)*'/` - String literal

  The value of this token (the string value) is the text between the opening and closing quotes, with the following (non-regex, literal text) replacements:
  
  * `\\` is replaced by a single backslash
  * `\'` is replaced by a lone single quote (`'`)
  * `\n` is replaced by a line feed (U+000A)
  * `\r` is replaced by a carriage return (U+000D)
  
  A backslash followed by any other character is a syntax error

Encountering characters within a Firth program source file that match neither whitespace, a line comment, nor one of the previously specified tokens MUST be produce a syntax error.

Syntax
------

The syntax of a valid Firth program source file is a sequence of zero or more operations, where:

* A function literal is defined as a *function definition opening brace*, followed by a sequence of zero or more operations, followed by a *function definition closing brace*
* An *operation* is defined as either:
    * A token other than an *function definition opening brace* or *function definition closing brace*
    * A function literal

  The value of a function literal (the function body) is the aforementioned sequence of zero or more operations

A Firth program source file whose sequence of tokens do not match this syntax MUST produce a syntax error.

Types
-----

A Firth value can have one of the following types. The name specified in `Monospace Text` is the name of the variable containing the `Type` value representing that type (see the "Basic types, functions and constants" section), while the name in brackets is its English language name. 

* `Type` (type) - a representation of a data type
* `Any` (any) - the superclass of all types
* `Int` (integer) - a signed integer of unbounded range (subject to available memory)

  Integer values can be produced either with integer literals, or with basic Firth functions that produce integer values
* `Bool` (boolean) - either the value `true` or the value `false`

  The only source of Boolean values is the basic Firth constants `true` and `false`
* `Str` (string) - a string of Unicode characters

  String values can be produced either with string literals, or with basic Firth functions that produce string values
* `Sym` (symbol) - a symbol

  Symbol values can be produced with symbol literals
* `List` (list) - an ordered collection of elements indexed from zero

  List values can be produced with the basic Firth `list` function, which executes a function in a special temporary data stack, and produces a list containing the values the function produced in top-to-bottom order (the last value it produced being the first item in the list)

  Thus `[1 2 3] list.` results in a list with `3` as its first (0th) item, and `1` as its last (2nd) item
* `Fn` (function) - a function

  Function values can be produced with function literals

Execution
---------

The execution of a Firth program revolves around a *stack*. Stacks are last-in, first-out datastructures. That is, the item most recently added ("pushed" onto the stack) is the first to be removed ("popped" from the stack).

There are two principle stacks used in execution: the data stack, and the variable scope stack. The data stack stores arbitrary values and is directly exposed to and operated on by the program. The variable scope stack stores "scopes" (collections of variable name to value bindings) and is only indirectly exposed.

The data stack is initially empty. The variable scope stack initially contains a single entry, a scope containing bindings for Firth's basic types, functions and constants (see the "Predefined variables" section).

There are two classes of function, for execution purposes:

* User-defined functions - these are functions created using function literals in a Firth program source file
* Implementation functions - these are functions exposed by the Firth implementation to the Firth program

The details of how implementation functions work is unspecified. Both classes of function operate on the data and scope stacks, though implementation functions have considerably more freedom, as they are not bound by what stack manipulation functionality is exposed by Firth in the form of operations and functions.

Invoking a Firth function causes it to be executed, handing control to it (and in turn any functions it invokes) until its execution completes. For the purposes of execution, a Firth program source file's content is essentially a user-defined function that is immediately invoked.

At the start of a user-defined function, a new, empty scope is pushed onto the variable scope stack.

Operations within a user-defined function are processed in the order they come in the function body. For each operation:

* If it is a literal (for an integer, string, function or symbol), the value is pushed onto the data stack
* If it is a variable name, the variable binding by that name is searched for in each successive each entry in the scope stack, from top to bottom, stopping at the first item found, and then:
  * If the variable binding is found, its value is pushed onto the data stack
  * If the variable binding is not found, an error is raised
* If is the function invocation operator (`.`), the value on the top of the data stack is popped off, and then:
  * If the value is a function, it is invoked
  * If the value is not a function, an error is raised

At the end of the user-defined function, the scope is popped off the scope stack.

Predefined variables
--------------------

The variable scope stack is initially populated with Firth's basic types, functions and constants.

###Types

See the types section above.

###Functions

For the sake of conciseness and error-checking, full type signatures are given for Firth's basic/predefined functions.

The "stack effect diagram" type signatures below (in brackets after function names) are of the following format:

<pre>
    <i>argument types</i> -> <i>return types</i>
</pre>

*argument types* is a sequence of type names representing the types of the values the function will pop off the data stack, where the rightmost type is the first value popped off (the "first" argument).

*return types* is a sequence of type names representing the types of the values the function will pop off the data stack, where the rightmost type is the last value pushed on (the "first" return value).

For example, `Int Int -> Int` denotes a function that pops two integers off the data stack and pushes an integer onto it.

Type variables, denoted with a `'` followed by a lowercase name, can be used to represent types only known in context. The types represented by all instances of the same variable must match. For example, `'a 'b -> 'b 'a` is the type of a function that swaps the two values at the top of the stack.

Type vector variables, denoted with a `'` followed by an uppercase name, can be used to represent a sequence of zero or more types only known in context. The types represented by all instances of the same type vector variable must match. For example, `'a 'A Int -> 'A 'a` would be the type of a function that takes a value from a numbered position in the stack and places it on top.

Function type signatures in parentheses represent function values taken as arguments, or function values returned. For example, `(-> 'a) -> 'a` might be the type of a function that accepts a single-return value, parameter-less function, executes it, and returns the value it produces. 

Type signatures MUST be strictly enforced by the implementation. Passing a function incompatibly-typed values MUST trigger an error. 

####Variable definition

* `def` (`Sym Any ->`) - defines, in the scope at the top of the scope stack, the variable named by the symbol with the value given, and errors if the value is already defined in it (`def` MUST NOT error if the variable exists lower in the scope stack)

####Stack manipulation

* `dup` (`'a -> 'a 'a`) - duplicates the value at the top of the stack
* `drop` (`'a ->`) - drops the value at the top of the stack
* `swap` (`'a 'b -> 'b 'a`) - swaps the top two values on the stack

####Flow control

* `if` (`'A bool ('A -> 'B) -> 'B`) - where the boolean value given is `true`, executes the given function
* `ifelse` (`'A bool ('A -> 'B) ('A -> 'B) -> 'B`) - where the boolean value is `true`, executes the first function, otherwise executing the second function
* `while` (`'A ('A -> 'A Bool) ('A -> 'A) -> 'A`) - executes the function first function given, and if the boolean value it produces is `true`, executes the second function, repeating until the boolean value the first function produces is `false`

####Integer arithmetic

* `add` (`Int Int -> Int`) - adds two integers
* `sub` (`Int Int -> Int`) - subtracts the second integer passed from the first integer passed
* `mul` (`Int Int -> Int`) - multiplies two integer
* `div` (`Int Int -> Int`) - divides two integers, producing the quotient (floored, i.e. rounded towards -Infinity)
* `mod` (`Int Int -> Int`) - divides two integers, producing the remainder (with the sign of the divisor)
* `divmod` (`Int Int -> Int Int`) - divides two integers, producing the quotient and remainder

####Comparison

* `eq` (`Any Any -> Bool`) - returns `true` if the two arguments are equal
* `neq` (`Any Any -> Bool`) - returns `true` if the two arguments are not equal
* `gt` (`Int Int -> Bool`) - returns `true` if the first argument is greater than the second
* `gteq` (`Int Int -> Bool`) - returns `true` if the first argument is greater than or equal to the second
* `lt` (`Int Int -> Bool`) - returns `true` if the first argument is less than the second
* `lteq` (`Int Int -> Bool`) - returns `true` if the first argument is less than or equal to the second

####Boolean Algebra

* `and` (`Bool Bool -> Bool`) - returns `true` if the two arguments are `true`
* `or` (`Bool Bool -> Bool`) - returns `true` if at least one of the arguments is `true`
* `xor` (`Bool Bool -> Bool`) - returns `true` if exactly one of the arguments is `true`
* `not` (`Bool -> Bool`) - returns `true` if the argument is `false`
