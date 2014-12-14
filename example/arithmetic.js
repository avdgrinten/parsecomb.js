
var pc = require('../lib/index.js');

var prodNumber = pc.production();
var prodTerminal = pc.production();
var prodTimesDivision = pc.production();
var prodPlusMinus = pc.production();

prodNumber.define(pc.seq(
	[ pc.optional(pc.certainChar('-')),
		pc.onePlus(pc.singleChar(pc.isDigit10))
	],
	function(results) {
		var abs = parseInt(results[1].join(''));
		return results[0] ? -abs : abs;
	}
));

prodTerminal.define(pc.alternative([
	prodNumber,
	pc.seq(
		[ pc.certainChar('('),
			prodPlusMinus,
			pc.certainChar(')')
		],
		function(results) {
			return results[1];
		}
	)
]));

prodTimesDivision.define(pc.seq(
	[ prodTerminal,
		pc.zeroPlus(
			pc.seq([
				pc.spaceBefore(
					pc.alternative([
						pc.certainChar('*'),
						pc.certainChar('/')
					])
				),
				pc.spaceBefore(prodTerminal)
			])
		)
	], function(results) {
		return results[1].reduce(function(previous, tail) {
			if(tail[0] == '*') {
				return previous * tail[1];
			}else{
				return previous / tail[1];
			}
		}, results[0]);
	}
));

prodPlusMinus.define(pc.seq(
	[ prodTimesDivision,
		pc.zeroPlus(
			pc.seq([
				pc.spaceBefore(
					pc.alternative([
						pc.certainChar('+'),
						pc.certainChar('-')
					])
				),
				pc.spaceBefore(prodTimesDivision)
			])
		)
	], function(results) {
		return results[1].reduce(function(previous, tail) {
			if(tail[0] == '+') {
				return previous + tail[1];
			}else{
				return previous - tail[1];
			}
		}, results[0]);
	}
));

var x = pc.parseSync(prodPlusMinus, new pc.StringInput('(5 - 2) * 2'));
console.log(x);

