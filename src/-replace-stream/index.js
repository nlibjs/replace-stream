const {Transform} = require('stream');
const {StringDecoder} = require('string_decoder');
const replacementFunction = require('@nlib/replacement-function');

module.exports = class ReplaceStream extends Transform {

	constructor(replacers, encoding = 'utf-8') {
		super();
		this.decoder = new StringDecoder(encoding);
		this.buffer = '';
		this.replacers = new Set();
		for (const replacer of replacers) {
			if (typeof replacer.pattern === 'string') {
				replacer.pattern = new RegExp(replacer.pattern.replace(/(\W)/gu, '\\$1'));
			}
			if (typeof replacer.replacement === 'string') {
				replacer.replacement = replacementFunction(replacer.replacement);
			}
			replacer.limit = replacer.limit || 1;
			this.replacers.add(replacer);
		}
	}

	_transform(data, encoding, callback) {
		let text = `${this.buffer}${this.decoder.write(data)}`;
		const replacers = Array.from(this.replacers);
		const nextReplacer = () => {
			if (replacers.length === 0) {
				this.buffer = text;
				return callback();
			}
			const replacer = replacers.shift();
			const nextMatch = () => {
				replacer.pattern.lastIndex = 0;
				const result = replacer.pattern.exec(text);
				if (result) {
					const {index, input} = result;
					this.push(text.slice(0, index));
					Promise.resolve(replacer.replacement(...result, index, input))
					.then((replaced) => {
						this.push(replaced);
						text = text.slice(index + result[0].length);
						if (0 < replacer.limit) {
							replacer.limit--;
							if (replacer.limit === 0) {
								this.replacers.delete(replacer);
								return nextReplacer();
							}
						}
						return nextMatch();
					})
					.catch((error) => {
						this.emit('error', error);
					});
				} else {
					nextReplacer();
				}
			}
			return nextMatch();
		}
		nextReplacer();
	}

	_flush(callback) {
		this.push(this.buffer);
		callback();
	}

};
