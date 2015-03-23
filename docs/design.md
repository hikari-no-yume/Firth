The Firth Programming Language: Design
======================================

Name and Origins
----------------

In 2012, I made a tiny non-Turing-complete stack-oriented scripting language called Fjord ([docs](https://github.com/TazeTSchnitzel/schnitzelVerse/blob/master/htdocs/script_help.html), [source](https://github.com/TazeTSchnitzel/schnitzelVerse/blob/master/htdocs/fjord.js)), since I needed a way to script objects in a virtual world I was making. It was never used outside of that particular application, but it was still an interesting project. Its name, by the way, came from clicking the "Random Article" button on Wikipedia: on one of my clicks, I ended up on an article about a fjord, and thought Fjord would be a nice name.

Now it's 2015, and I feel like making a programming language. I've decided that a stack-oriented programming language (a more practical and general-purpose one than Fjord) would be a good idea, and so I'd like to reuse the name. However, it turns out [someone else used that name in the meantime](https://github.com/penberg/fjord). So, what do I do?

Well, I happen to know that the Scottish word *firth* is etymologically related to the Norwegian *fjord*, and it appears nobody else has named a language that. As well as being related to Fjord, it has some other desireable traits. Serendipitously, it resembles *Forth*, perhaps the best-known stack-oriented language, making for a nice homage. It's a lovely-sounding word, and contains my favourite consonant, the voiceless dental fricative ⟨θ⟩. It alludes to natural beauty. And, finally, it's Scottish and I love me some Scotland (I do live there, but haven't always!) For all these reasons, I knew right away that I just had to use it.

The idea of a stack-oriented language came to me because I wanted to make something super-simple, and stack-oriented languages are both incredibly simple in their design and *really* easy to implement. There is no syntactical analysis necessary, only trivial lexical analysis. And, despite their simplicity, stack-oriented languages can be very powerful and user-friendly. Another option I'd considered was making [yet](https://github.com/TazeTSchnitzel/Gang-Garrison-2/tree/FaucetLisp) [another](https://github.com/igorw/yolo/blob/master/src/yolisp.php) [micro](https://gist.github.com/TazeTSchnitzel/44720ea3aec64a9e330a) Lisp. However, these require a bit too much elaboration to be useful, I think. I also don't like the bracket spam that Lisp causes, and the programming model isn't too nice if you like imperative programming. So, stack-oriented it was, then.

I borrowed quite a few things from other languages:

* Obviously, the whole stack-oriented/concatenative programming paradigm
* The idea of flow control-as-a-function was something I was interested in from Andi McClure's [Emily](https://bitbucket.org/runhello/emily/wiki/Home), even before I thought of stack-oriented programming, which happens to also embrace this concept!
    * I also wanted really lightweight function syntax like Emily's `^{ foo }`, but it turns out that stack-oriented languages have that
* A functional stack-oriented language isn't a novel idea, the [Cat programming language](https://web.archive.org/web/20150205061802/http://cat-language.com/) is a shining example of that, and I'm indebted to it:
    * I liked its type signatures, but I've decided to do them in a dynamic, homoiconic manner (no special syntax)
        * In a way, you could say I copied Haskell, but before I could figure out how to do varargs, I saw Cat's approach
        * Firth isn't statically-typed and allows dynamism, but has type hints like PHP's
    * `list`
* The `.` function invokation operator is similar to Fjord's `!` suffix for names, though in its case that merely denoted that something was a word
* Using `/foo bar def.` for variable declaration comes from PostScript
* I hate integer overflow (it is an inexcusable class of bugs in an age where mandatory checks cost so little CPU time), and I like how Haskell and Python have arbitrary-precision integers, so I'm having those too
* `div` using floor division and `mod` using the sign of the divisor is [borrowed from Python](http://python-history.blogspot.co.uk/2010/08/why-pythons-integer-division-floors.html)

Guiding Principles
------------------

In the language's design, there are some guiding principles:

* Keep the core language syntax to a minimum, don't have magic or special cases:
    * No need for list syntax, the `list` function is enough
    * No need for type definition syntax, use lists
    * No need to distinguish between variables and words
    * Flow control is just a function
    * Operators aren't operators, they're just functions
    * Variable assignment, function definition are also just functions
* [Don't require the Shift key](https://twitter.com/rabcyr/status/575159023244345344)
    * Single quotes and square braces, which don't require Shift on US keyboards, are used instead of double quotes and curly braces, which do
    * No symbolic operators, i.e. `add` and `sub` instead of `+` and `-` 
