# @nlib/replace-stream

[![Build Status](https://travis-ci.org/nlibjs/replace-stream.svg?branch=master)](https://travis-ci.org/nlibjs/replace-stream)
[![Build status](https://ci.appveyor.com/api/projects/status/github/nlibjs/replace-stream?branch=mater&svg=true)](https://ci.appveyor.com/project/kei-ito/replace-stream/branch/master)
[![codecov](https://codecov.io/gh/nlibjs/replace-stream/branch/master/graph/badge.svg)](https://codecov.io/gh/nlibjs/replace-stream)
[![dependencies Status](https://david-dm.org/nlibjs/replace-stream/status.svg)](https://david-dm.org/nlibjs/replace-stream)
[![devDependencies Status](https://david-dm.org/nlibjs/replace-stream/dev-status.svg)](https://david-dm.org/nlibjs/replace-stream?type=dev)

Transform streams.

## Install

```
npm install @nlib/replace-stream
```

## Usage

```javascript
const {PassThrough} = require('stream');
const {ReplaceStream} = require('@nlib/replace-stream');
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
  console.log(Buffer.concat(chunks).toString());
  // FOOfooBARBARbaaar
});
for (const byte of Buffer.from('foofoobarbaarbaaar')) {
  stream.write(Buffer.from([byte]));
}
stream.end();
```

```javascript
const {PassThrough} = require('stream');
const {ReplaceStream} = require('@nlib/replace-stream');
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
  console.log(Buffer.concat(chunks).toString());
  // 😎😁😂
});
for (const byte of Buffer.from('😀😁😂')) {
  stream.write(Buffer.from([byte]));
}
stream.end();
```

## LICENSE

MIT
