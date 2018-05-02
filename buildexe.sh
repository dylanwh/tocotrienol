# Run with `npm run buildexe`

TCTNODEVERSION=x64-8.11.1
echo "\033[0;36mBuilding tocotrienol with Node $TCTNODEVERSION\033[0m\n";

# Compile index.ts to index.js
echo "\033[0;36mCompiling index.ts to index.js\033[0m\n";
tsc;

# Make webpack to package openpgp instead of using the distributed file.
echo "\033[0;36mInstalling openpgp dependencies\033[0m\n";
sed -i -e 's/"main": "dist\/openpgp.js"/"main": "src\/index.js"/g' \
    ./node_modules/openpgp/package.json;
cd ./node_modules/openpgp; npm install; cd ../..;

# Bundle all the js packages into one file.
echo "\033[0;36mBundling js with webpack\033[0m\n";
webpack --config webpack.config.js;

# Compile the js and node executable into a single executable.
echo "\033[0;36mBuilding tct executable (first run may take a while)\033[0m\n";
nexe -t $TCTNODEVERSION -b -p $(which python2) -i dist/tct.js -o dist/tct;
