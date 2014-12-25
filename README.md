
# parsecomb.js: Parsing combinators for JavaScript

parsecomb.js is a simple library that implements parsing combinators. It allows you to construct parsers for arbitrary parsing expression grammars, which are sufficient to parse almost all programming languages.

parsecomb.js is available on npm: `npm install parsecomb.js`.

## Tutorial

### Parsing single characters

The following trivial example parses a single `x` character:

```javascript
var pc = require('parsecomb.js');

var singleXParser = pc.certainChar('x');

var result = parseSync(singleXParser, new pc.StringInput('x'));
console.log(result);
```

`certainChar()` returns a parser object that can be passed to `parseSync()` in order to actually parse something. `StringInput` wraps a string that is passed to the `parseSync()` function.

Running the program simply prints `x` to the console.

### Error handling

If we change the input from `new pc.StringInput('x')` to `new pc.StringInput('y')` the parse will fail. In this case an object of type `ParseError` is returned: `console.log(result instanceof pc.ParseError)` prints `true`.

### Combinators

Combinators are functions that take parser objects (like the one returned from `certainChar()`) and return a new parser object.

Suppose we do not want to parse a single `x` character but a sequence of one or more `x` characters. The following snippet does just that:

```javascript
var multipleXParser = pc.onePlus(pc.certainChar('x'));
```

Applied to the input `'xxx'` this parser will return `[ 'x', 'x', 'x' ]`.

### Transformation functions

In many cases getting the result of `onePlus()` and similar functions as an array is not what we want. Often we have to build parse trees or transform the parser output in some way. For this reason most of the combinators accept transformation functions. If we change to code to:

```javascript
var multipleXParser = pc.onePlus(
	pc.certainChar('x'),
	function(result) {
		result.join('');
	}
);
```

The output for `'xxx'` will be the string `xxx` instead.

### Dealing with end-of-file

Changing the input of the previous snippet to `'xxy'` will still print `xx`: Our parser does not check if it reached the end of the input. We can simply fix this by using the sequence combinator `seq()` and the end-of-input combinator `eof()`:

```javascript
var multipleXParser = /* some code as before */

var finalParser = pc.seq(
	[ multipleXParser,
		pc.eof()
	],
	function(result) {
		return result[0];
	}
);
```

This parser will accept `xxx` but not `xxy`. The transformation function here just returns the first result of the sequence (i.e. the result from `multipleXParser`) and discards the second (i.e. the result from `pc.eof()`, which is always `null`).

### Example: Parsing integers

The following snippet parses an integer:

```javascript
var numberParser = pc.seq(
	[ pc.optional(pc.certainChar('-')),
		pc.onePlus(pc.singleChar(pc.isDigit10))
	],
	function(results) {
		var abs = parseInt(results[1].join(''));
		return results[0] ? -abs : abs;
	}
);
```

`singleChar()` is a combinator that takes a predicate function that gets a character as only argument and succeeds if this function returns true. `isDigit10` simply checks if a character is between '0' and '9'.

`optional()` returns the result of its first argument if that succeeds or null otherwise.

### Full example: Parsing arithmetic expressions

The file `example/arithmetic.js` contains a full example for parsing arithmetic expressions with correct operator precedence.

