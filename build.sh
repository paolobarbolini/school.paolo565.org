HASH=$(git rev-parse HEAD)
rm -rf public
mkdir -p public/assets

# Html
cp index.html public/index.html

sed -i '11d' public/index.html
sed -i '11i\<link rel="stylesheet" href="/assets/app.'$HASH'.css">' public/index.html

sed -i '13,15d' public/index.html
sed -i '13i\<script src="/assets/app.'$HASH'.js"></script>' public/index.html

# Css
node_modules/.bin/crass assets/css/app.css > public/assets/app.$HASH.css

# Javascript
node_modules/.bin/uglifyjs --compress --mangle toplevel -- assets/js/utils.js assets/js/istitutogobetti.js assets/js/app.js > public/assets/app.$HASH.js

# Service Worker
cp service-worker.js public/service-worker.js.tmp

sed -i '1d' public/service-worker.js.tmp
sed -i '1i\const cacheName = "istitutogobettiapp-'$HASH'";' public/service-worker.js.tmp

sed -i '9,12d' public/service-worker.js.tmp

sed -i '9i\"/assets/app.'$HASH'.css",' public/service-worker.js.tmp
sed -i '9i\"/assets/app.'$HASH'.js",' public/service-worker.js.tmp

node_modules/.bin/uglifyjs --compress --mangle toplevel -- public/service-worker.js.tmp > public/service-worker.js
rm public/service-worker.js.tmp

# Other Assets
cp manifest.json public
cp favicon.ico public
cp -r assets/icons public/assets/icons

# Compression
gzip --best --keep --recursive public/