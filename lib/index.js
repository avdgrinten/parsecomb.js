
var input = require('./input.js');

function ParseError(message, position) {
	this._message = message;
//	console.log("Error: " + message, position);
}
ParseError.prototype.getMessage = function() {
	return this._message;
};

function isSpace(c) {
	if(c == null)
		return false;
	if(c == ' ' || c == '\t'|| c == '\r' || c == '\n')
		return true;
	return false;
}
function isAlpha(c) {
	if(c == null)
		return false;
	if(c >= 'a' && c <= 'z')
		return true;
	return false;
}
function isDigit10(c) {
	if(c == null)
		return false;
	return c >= '0' && c <= '9';
}

function production() {
	var functor = function(input) {
		return functor._parseFunction(input);
	};
	functor._parseFunction = null;
	functor.define = function(parse_function) {
		functor._parseFunction = parse_function;
	};
	return functor;
}

function singleChar(predicate, transform) {
	return function(input) {
		var c = input.peek();
		if(!predicate(c))
			return new ParseError("Expected predicate", input.position());
		input.consume();
		return transform ? transform(c) : c;
	};
}

function eof() {
	return function(input) {
		if(input.peek() != null)
			return new ParseError("Expected end-of-input", input.position());
		return null;
	};
}

function seq(parsers, transform) {
	return function(input) {
		var results = [ ];
		for(var i = 0; i < parsers.length; i++) {
			var result = parsers[i](input);
			if(result instanceof ParseError)
				return result;
			results.push(result);
		}
		return transform ? transform(results) : results;
	};
}

function optional(parser, transform) {
	return function(input) {
		var sub_input = input.copy();
		var result = parser(sub_input);
		if(result instanceof ParseError)
			return null;
		input.assign(sub_input);
		return transform ? transform(results) : results;
	};
}

function zeroPlus(parser, transform) {
	return function(input) {
		var results = [ ];
		while(true) {
			var sub_input = input.copy();
			var result = parser(sub_input);
			if(result instanceof ParseError)
				break;
			input.assign(sub_input);
			results.push(result);
		}
		return transform ? transform(results) : results;
	};
}

function onePlus(parser, transform) {
	return function(input) {
		var results = [ ];
		while(true) {
			var sub_input = input.copy();
			var result = parser(sub_input);
			if(result instanceof ParseError)
				break;
			input.assign(sub_input);
			results.push(result);
		}
		if(results.length == 0)
			return new ParseError("Expected at least one", input.position());
		return transform ? transform(results) : results;
	};
}

function lookahead(defs, otherwise) {
	return function(input) {
		for(var i = 0; i < defs.length; i++) {
			var sub_input = input.copy();
			var look_result = defs[i].lookahead(sub_input);
			if(look_result instanceof ParseError)
				continue;
			
			if(!defs[i].consume)
				sub_input = input.copy();

			var parse_result = defs[i].parse(sub_input);
			if(parse_result instanceof ParseError)
				return parse_result;
			input.assign(sub_input);

			var result = { lookahead: look_result, parse: parse_result };
			return defs[i].transform ? defs[i].transform(result) : result;
		}

		if(!otherwise)
			return new ParseError("No alternative matches", input.position());
		return otherwise(input);
	};
}

function alternative(parsers) {
	return function(input) {
		for(var i = 0; i < parsers.length; i++) {
			var sub_input = input.copy();
			var result = parsers[i](sub_input);
			if(result instanceof ParseError)
				continue;
			input.assign(sub_input);
			return result;
		}
		return new ParseError("No alternative matches", input.position());
	};
}

function certainChar(expected, transform) {
	return singleChar(function(c) {
		return c == expected;
	});
}

function word(transform) {
	return onePlus(
		singleChar(isAlpha),
	function(results) {
		var string = results.join('');
		return transform ? transform(string) : string;
	});
}

function spaceBefore(parser, transform) {
	return seq([
		zeroPlus(singleChar(isSpace)),
		parser
	], function(results) {
		return transform ? transform(results[1]) : results[1];
	});
}

function parseSync(parser, input) {
	return parser(input);
}

module.exports.StringInput = input.StringInput;
module.exports.ParseError = ParseError;

module.exports.isSpace = isSpace;
module.exports.isAlpha = isAlpha;
module.exports.isDigit10 = isDigit10;

module.exports.production = production;
module.exports.singleChar = singleChar;
module.exports.eof = eof;
module.exports.seq = seq;
module.exports.optional = optional;
module.exports.zeroPlus = zeroPlus;
module.exports.onePlus = onePlus;
module.exports.lookahead = lookahead;
module.exports.alternative = alternative;

module.exports.certainChar = certainChar;
module.exports.word = word;
module.exports.spaceBefore = spaceBefore;

module.exports.parseSync = parseSync;

