The Firth Programming Language
==============================

Firth is a functional, strongly dynamically-typed, concatenative stack-oriented programming language. Here's a program calculating the factorial of 5 written in it:

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

And here are some of its features:

* Concatenative, stack-oriented
* Functional with first-class, convenient, anonymous functions
* Strongly dynamically-typed, but with optional type hinting (planned, unimplemented)
* No variable/word distinction
* Arbitrary-precision integers (planned, unimplemented)
* Tabs are a syntax error
* Never touch the Shift key (if you use a US-like keyboard, anyway!)
* Free software
* More to come!

Please note: Firth is in early development and any and all features are subject to change. Features that are implemented may not be implemented *well*, features may be implemented that the specification does not define, the specification may define features that are not implemented, etc. The specification is very much incomplete.

Interested? Great! Check out the following files in the `/docs` directory:

* `overview.md` for a tour and explanation of the language fundamentals with code samples
* `design.md` for more information on Firth's origins and design goals
* `spec.md` for the specification and language reference

Or, read on to learn how to get Firth up and running!

Usage
-----

Currently, the (incomplete) implementation is in `src`. For testing purposes, open `test.html` in your browser, which lets you type in Firth code and see its tokenised and parsed forms, as well as its output.
