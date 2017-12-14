const assert = require('assert');
const test = require('@nlib/test');
const {PassThrough} = require('stream');
const {ReplaceStream} = require('../..');

const tests = [
	{
		replacers: [
			{
				pattern: 'a',
				replacement: 'α',
			},
		],
		source: ['ab', 'ca', 'bc', 'ab', 'ca', 'bc'],
		expected: 'αbcabcabcabc',
	},
	{
		replacers: [
			{
				pattern: 'a',
				replacement: 'α',
				limit: -1,
			},
		],
		source: ['ab', 'ca', 'bc', 'ab', 'ca', 'bc'],
		expected: 'αbcαbcαbcαbc',
	},
	{
		replacers: [
			{
				pattern: 'abc',
				replacement: 'αβγ',
			},
		],
		source: ['ab', 'ca', 'bc', 'ab', 'ca', 'bc'],
		expected: 'αβγabcabcabc',
	},
	{
		replacers: [
			{
				pattern: 'abc',
				replacement: 'αβγ',
				limit: -1,
			},
		],
		source: ['ab', 'ca', 'bc', 'ab', 'ca', 'bc'],
		expected: 'αβγαβγαβγαβγ',
	},
	{
		replacers: [
			{
				pattern: /\w/g,
				replacement(match) {
					return match.toUpperCase();
				},
			},
		],
		source: ['ab', 'ca', 'bc', 'ab', 'ca', 'bc'],
		expected: 'Abcabcabcabc',
	},
	{
		replacers: [
			{
				pattern: /\w/g,
				replacement(match) {
					return match.toUpperCase();
				},
				limit: -1,
			},
		],
		source: ['ab', 'ca', 'bc', 'ab', 'ca', 'bc'],
		expected: 'ABCABCABCABC',
	},
	{
		replacers: [
			{
				pattern: /\w/g,
				replacement(match) {
					return match.toUpperCase();
				},
				limit: 5,
			},
		],
		source: ['ab', 'ca', 'bc', 'ab', 'ca', 'bc'],
		expected: 'ABCABcabcabc',
	},
	{
		replacers: [
			{
				pattern: /😁😂/gu,
				replacement: '😎😎',
			},
		],
		// echo "😀😁😂" > sample.txt && od -x sample.txt
		source: [
			0xf0, 0x9f, 0x98, 0x80,
			0xf0, 0x9f, 0x98, 0x81,
			0xf0, 0x9f, 0x98, 0x82,
			0xf0, 0x9f, 0x98, 0x83,
			0xf0, 0x9f, 0x98, 0x84,
			0xf0, 0x9f, 0x98, 0x85,
			0xf0, 0x9f, 0x98, 0x80,
			0xf0, 0x9f, 0x98, 0x81,
			0xf0, 0x9f, 0x98, 0x82,
		].map((byte) => {
			return Buffer.from([byte]);
		}),
		expected: '😀😎😎😃😄😅😀😁😂',
	},
	{
		replacers: [
			{
				pattern: /😁😂/gu,
				replacement: '😎😎',
				limit: -1,
			},
		],
		// echo "😀😁😂" > sample.txt && od -x sample.txt
		source: [
			0xf0, 0x9f, 0x98, 0x80,
			0xf0, 0x9f, 0x98, 0x81,
			0xf0, 0x9f, 0x98, 0x82,
			0xf0, 0x9f, 0x98, 0x83,
			0xf0, 0x9f, 0x98, 0x84,
			0xf0, 0x9f, 0x98, 0x85,
			0xf0, 0x9f, 0x98, 0x80,
			0xf0, 0x9f, 0x98, 0x81,
			0xf0, 0x9f, 0x98, 0x82,
		].map((byte) => {
			return Buffer.from([byte]);
		}),
		expected: '😀😎😎😃😄😅😀😎😎',
	},
	{
		replacers: [
			{
				pattern: /😁😂/gu,
				replacement() {
					return new Promise((resolve) => {
						setImmediate(() => {
							resolve('😎😎');
						});
					});
				},
				limit: -1,
			},
		],
		// echo "😀😁😂" > sample.txt && od -x sample.txt
		source: [
			0xf0, 0x9f, 0x98, 0x80,
			0xf0, 0x9f, 0x98, 0x81,
			0xf0, 0x9f, 0x98, 0x82,
			0xf0, 0x9f, 0x98, 0x83,
			0xf0, 0x9f, 0x98, 0x84,
			0xf0, 0x9f, 0x98, 0x85,
			0xf0, 0x9f, 0x98, 0x80,
			0xf0, 0x9f, 0x98, 0x81,
			0xf0, 0x9f, 0x98, 0x82,
		].map((byte) => {
			return Buffer.from([byte]);
		}),
		expected: '😀😎😎😃😄😅😀😎😎',
	},
];

test('ReplaceStream', (test) => {
	for (const {replacers, source, expected} of tests) {
		test(`${Buffer.concat(source.map(Buffer.from))} → ${expected}`, () => {
			const replaceStream = new ReplaceStream(replacers);
			return new Promise((resolve, reject) => {
				const writer = new PassThrough();
				const chunks = [];
				let length = 0;
				writer
				.pipe(replaceStream)
				.once('error', reject)
				.on('data', (chunk) => {
					chunks.push(chunk);
					length += chunk.length;
				})
				.once('end', () => {
					resolve(Buffer.concat(chunks, length).toString());
				});
				source
				.reduce((promise, source) => {
					return promise
					.then(() => {
						writer.write(source);
						return new Promise((resolve) => {
							setImmediate(resolve);
						});
					});
				}, Promise.resolve())
				.then(() => {
					writer.end();
				});
			})
			.then((actual) => {
				assert.equal(actual, expected);
			});
		});
	}
});
