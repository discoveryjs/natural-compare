[![NPM version](https://img.shields.io/npm/v/@discoveryjs/natural-compare.svg)](https://www.npmjs.com/package/@discoveryjs/natural-compare)
[![Build Status](https://github.com/discoveryjs/natural-compare/actions/workflows/build.yml/badge.svg)](https://github.com/discoveryjs/natural-compare/actions/workflows/build.yml)
[![Coverage Status](https://coveralls.io/repos/github/discoveryjs/natural-compare/badge.svg?branch=main)](https://coveralls.io/github/discoveryjs/natural-compare?branch=main)

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
].sort();
// file1.js
// file10.js
// file12.js
// file2.js
// file9.js
```

In browser:

```html
    <!-- ESM -->
    <script type="module">
        import { natualCompare } from "@discoveryjs/natural-compare/dist/natural-compare.esm.js";

        array.sort(naturalCompare);
    </script>

    <!-- Old way -->
    <script src="@discoveryjs/natural-compare/dist/natural-compare.js"></script>
    <script>
        array.sort(naturalCompare);
    </script>
```

## License

MIT
