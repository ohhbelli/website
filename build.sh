#!/bin/sh
# Minimiert CSS & JS aus src/ nach site/assets/ (benötigt Node.js)
set -e
cd "$(dirname "$0")"
npx --yes esbuild src/style.css --minify --outfile=site/assets/css/style.css
npx --yes esbuild src/forest.js --minify --target=es2019 --outfile=site/assets/js/forest.js
npx --yes esbuild src/main.js --minify --target=es2019 --outfile=site/assets/js/main.js
