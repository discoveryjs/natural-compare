# @discoveryjs/natural-compare

Compare strings in a natural order

## Install

```
npm install @discoveryjs/natural-compare
```

## Usage

```js
import { naturalCompare } from '@discoveryjs/natural-compare';

[
    'file10.js',
    'file1.js',
    'file2.js',
    'file12.js',
    'file9.js'
].sort(naturalCompare);
// file1.js
// file2.js
// file9.js
// file10.js
// file12.js

// standart sorting
[
    'file10.js',
    'file1.js',
    'file2.js',
    'file12.js',
    'file9.js'
].sort(naturalCompare);
// file1.js
// file10.js
// file12.js
// file2.js
// file9.js
```

## License

MIT
