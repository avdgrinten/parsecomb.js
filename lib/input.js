
function StringInput(string, position) {
	if(!position)
		position = 0;
	this._string = string;
	this._position = position;
}
StringInput.prototype.peek = function() {
	if(this._position >= this._string.length)
		return null;
	return this._string[this._position];
};
StringInput.prototype.consume = function() {
	this._position++;
};
StringInput.prototype.copy = function() {
	return new StringInput(this._string, this._position);
};
StringInput.prototype.assign = function(other) {
	this._string = other._string;
	this._position = other._position;
};
StringInput.prototype.position = function() {
	return { index: this._position };
};

module.exports.StringInput = StringInput;

