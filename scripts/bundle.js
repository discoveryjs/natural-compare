import esbuild from 'esbuild';

const globalDef = 'typeof globalThis!="undefined"?globalThis:typeof window!="undefined"?window:typeof global!="undefined"?global:typeof self!="undefined"?self:this';

async function build() {
    await esbuild.build({
        entryPoints: ['cjs/index.cjs'],
        outfile: 'dist/natural-compare.js',
        format: 'cjs',
        banner: { js: '(function(exports){' },
        footer: { js: `})(${globalDef});` },
        globalName: '__export__',
        bundle: true,
        logLevel: 'info',
        minify: true,
        sourcemap: true
    });

    await esbuild.build({
        entryPoints: ['src/index.js'],
        outfile: 'dist/natural-compare.esm.js',
        format: 'esm',
        bundle: true,
        logLevel: 'info',
        minify: true,
        sourcemap: true
    });
}

build();
