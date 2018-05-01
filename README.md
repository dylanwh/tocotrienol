# tocotrienol

An easy command line interface to [openpgp](https://www.npmjs.com/package/openpgp).

### Compiling executable

Using [nexe](https://www.npmjs.com/package/nexe) tocotrienol can be compiled
into a single executable file for easy deployment.

- Run `npm install`.
- Make sure `which python2` evaluates properly on your computer, if not modify the
`build.sh` file where it is used.
- Run `npm run buildexe`.
- An executable file will be placed in the newly created `dist` folder.

### Example usage
Tocotrienol aims to have a very simple interface.

- `cat message.txt | ./tct encrypt -k key.file`
- `./tct inspect -k key.file`
- `./tct check -k key.file` (No error == valid)
