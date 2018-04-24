#!/usr/bin/env node
import * as yargs from "yargs";
import { Argv, Arguments } from "yargs";
import * as fs from "fs";
import * as openpgp from "openpgp";

function readPublicKeys(publicKey: string): openpgp.key.Key[] {
    const pubkey = fs.readFileSync(publicKey, { encoding: "utf8" });
    const result = openpgp.key.readArmored(pubkey.trim());
    if (result.err) {
        process.stderr.write(`unable to find key in ${publicKey}\n`);
        result.err.forEach(err => console.error(err));
        process.exit(1);
    }
    return result.keys;
}

function assertFileExists(filename: string) {
    try {
        fs.accessSync(filename, fs.constants.R_OK);
        return true;
    } catch (e) {
        throw (new Error(`Can't read ${filename}`))
    }
}


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
        const plaintext = fs.readFileSync(0);
        const keys = readPublicKeys(args.publicKey);

        openpgp.config.show_version = args.showVersion;
        openpgp.config.show_comment = args.showComment;
        if (args.comment) {
            openpgp.config.commentstring = args.comment;
            openpgp.config.show_comment = true;
        }
        let { data: ciphertext } = await openpgp.encrypt({ publicKeys: keys, data: plaintext });
        if (typeof ciphertext !== "undefined")
            process.stdout.write(ciphertext);
    };
}

async function getInfo(key: openpgp.key.Key) {
    return {
        expirationTime: await key.getExpirationTime(),
        userIds: key.getUserIds(),
        isPrivate: key.isPrivate()
    }
}

class Info {
    command = "info"
    describe = "display information about a key"

    builder = (yargs: Argv) =>
        yargs.option('public-key',
            {
                alias: ["k"],
                describe: 'a file that contains armored keys used for encryption'
            })
            .demandOption('public-key');

    async handler(args: Arguments) {
        const keys = readPublicKeys(args.publicKey);
        const info = await Promise.all(keys.map(getInfo));
        process.stdout.write(JSON.stringify(info));
    }
}

const argv = yargs
    .command(new Encrypt)
    .command(new Info)
    .help()
    .recommendCommands()
    .demandCommand(1, 'You need to specify a command')
    .argv;