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
            .boolean('show-version');

    async handler(args: Arguments) {
        try {
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
        } catch (e) {
            process.exit(2);
        }
    };
}

interface InspectResult {
    expirationTime: Date,
    userIds: string[],
    isPrivate: boolean,
    primaryKey: KeyInfo,
    subKeys?: KeyInfo[],
}

interface KeyInfo {
    created: Date;
    fingerprint: string;
    keyId: string;
    algorithmInfo: { algorithm: string, bits: number };
}

function KeyInfo(pubkey: openpgp.packet.PublicKey): KeyInfo {
    return {
        created: pubkey.created,
        fingerprint : pubkey.getFingerprint(),
        keyId : pubkey.getKeyId().toHex(),
        algorithmInfo : pubkey.getAlgorithmInfo(),
    }
}

class Check {
    command = "check";
    describe = "check a keyfile is valid and not expired";

    builder = (yargs: Argv) =>
        yargs.option('public-key',
            {
                alias: ["k"],
                describe: 'a file that contains armored keys used for encryption'
            })
            .demandOption('public-key');

    async handler(args: Arguments) {
        try {
            const keys = readPublicKeys(args.publicKey);
            const expirationTimes = await Promise.all(keys.map(async key => await key.getExpirationTime()));
            const now = new Date;
            const ok = expirationTimes.every(time => time > now);
            process.exit(ok ? 0 : 1);
        } catch (e) {
            process.exit(2);
        }
    }
}

class Inspect {
    command = "inspect";
    describe = "view json representation of a key file";

    builder = (yargs: Argv) =>
        yargs.option('public-key',
            {
                alias: ["k"],
                describe: 'a file that contains armored keys used for encryption'
            })
            .demandOption('public-key')
            .option('with-sub-keys', { describe: "include sub keys" })
            .boolean('with-sub-keys');

    async handler(args: Arguments) {
        const keys = readPublicKeys(args.publicKey);
        const getInfo = async (key: openpgp.key.Key) => {
            let result: InspectResult = {
                expirationTime: await key.getExpirationTime(),
                userIds: key.getUserIds(),
                isPrivate: key.isPrivate(),
                primaryKey: KeyInfo(key.primaryKey),
            };
            if (args.withSubKeys)
                result.subKeys = key.subKeys.map(k => KeyInfo(k.subKey));

            return result;
        };
        process.stdout.write(JSON.stringify(await Promise.all(keys.map(getInfo)), null, 2));
    }
}

const argv = yargs
    .command(new Encrypt)
    .command(new Inspect)
    .command(new Check)
    .help()
    .recommendCommands()
    .demandCommand(1, 'You need to specify a command')
    .argv;