const t = require('tap');
const {PassThrough} = require('stream');
const {ReplaceStream} = require('../..');

t.test('readme examples', (t) => {
	t.test('simple text', (t) => {
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
					limit: 2,
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
			t.equal(`${buffer}`, 'FOOfooBARBARbaaar');
		});
	});
	t.test('emoji', (t) => {
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
			t.equal(`${buffer}`, '😎😁😂');
		});
	});
	t.end();
});
