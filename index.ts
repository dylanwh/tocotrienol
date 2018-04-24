#!/usr/bin/env node
import * as yargs from "yargs";
import { Argv, Arguments } from "yargs";
import * as fs from "fs";
import * as openpgp from "openpgp";

class Encrypt {
    command = "encrypt";
    describe = "encrypt stdin using the public key file";

    builder = (yargs: Argv) =>
        yargs.option('public-key',
            {
                alias: ["k"],
                describe: 'a file that contains armored keys used for encryption'
            })
            .demandOption('public-key')
            .check((argv) => assertFileExists(argv.publicKey))
            .option('comment', { describe: 'include arbitrary comment string in output' })
            .option('show-comment', { describe: 'include default comment in output' })
            .boolean('show-comment')
            .option('show-version', { describe: 'include version string in output' })
            .boolean('show-version')

    async handler(args: Arguments) {
        const pubkey = fs.readFileSync(args.publicKey, { encoding: 'utf8' });
        const plaintext = fs.readFileSync(0);
        const result = openpgp.key.readArmored(pubkey);
        if (result.err) {
            process.stderr.write(`unable to find key in ${args.publicKey}\n`);
            result.err.forEach(err => console.error(err));
            process.exit(1);
        }

        openpgp.config.show_version = args.showVersion;
        openpgp.config.show_comment = args.showComment;
        if (args.comment) {
            openpgp.config.commentstring = args.comment;
            openpgp.config.show_comment = true;
        }
        let { data: ciphertext } = await openpgp.encrypt({ publicKeys: result.keys, data: plaintext });
        if (typeof ciphertext !== "undefined")
            process.stdout.write(ciphertext);
    };
}

function assertFileExists(filename: string) {
    try {
        fs.accessSync(filename, fs.constants.R_OK);
        return true;
    } catch (e) {
        throw (new Error(`Can't read ${filename}`))
    }
}

const argv = yargs.command(new Encrypt).help().argv;
console.log(argv._.length)