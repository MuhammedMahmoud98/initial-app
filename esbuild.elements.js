const esbuild = require('esbuild');
const fs = require('fs');

// Bundles the ngx-build-plus output into a single minimized file.
// Adjust inputPath if your build outputs a different filename.
const inputPath = 'dist/unified-qr-code-elements/main.js';
const outdir = 'dist/unified-qr-code-elements/bundle';
const outfile = `${outdir}/elements.bundle.js`;

if (!fs.existsSync(inputPath)) {
  console.error(`Input not found: ${inputPath}. Run npm run build:elements first.`);
  process.exit(1);
}

if (!fs.existsSync(outdir)) fs.mkdirSync(outdir, { recursive: true });

esbuild
  .build({
    entryPoints: [inputPath],
    bundle: true,
    minify: true,
    platform: 'browser',
    target: ['es2017'],
    outfile,
  })
  .then(() => console.log('Bundled elements to', outfile))
  .catch((e) => {
    console.error('esbuild error:', e);
    process.exit(1);
  });
