require('./-replace-stream');
const assert = require('assert');
const test = require('@nlib/test');
const {PassThrough} = require('stream');
const {ReplaceStream} = require('..');
test('readme example', (test) => {
	test('simple text', () => {
		return new Promise((resolve) => {
			const stream = new PassThrough();
			const chunks = [];
			stream.pipe(new ReplaceStream([
				{
					pattern: 'foo',
					replacement: 'FOO',
				},
				{
					pattern: /ba+r/,
					replacement: 'BAR',
					limit: 2
				},
			]))
			.on('data', (chunk) => {
				chunks.push(chunk);
			})
			.once('end', () => {
				resolve(Buffer.concat(chunks));
			});
			for (const byte of Buffer.from('foofoobarbaarbaaar')) {
				stream.write(Buffer.from([byte]));
			}
			stream.end();
		})
		.then((buffer) => {
			assert.equal(`${buffer}`, 'FOOfooBARBARbaaar');
		});
	});
	test('emoji', () => {
		return new Promise((resolve) => {
			const stream = new PassThrough();
			const chunks = [];
			stream.pipe(new ReplaceStream([
				{
					pattern: '😀',
					replacement: '😎',
				},
			]))
			.on('data', (chunk) => {
				chunks.push(chunk);
			})
			.once('end', () => {
				resolve(Buffer.concat(chunks));
			});
			for (const byte of Buffer.from('😀😁😂')) {
				stream.write(Buffer.from([byte]));
			}
			stream.end();
		})
		.then((buffer) => {
			assert.equal(`${buffer}`, '😎😁😂');
		});
	});
});
