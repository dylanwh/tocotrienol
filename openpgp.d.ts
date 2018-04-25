declare module 'openpgp' {
    namespace config {
        var commentstring: string;
        var show_comment: boolean;
        var show_version: boolean;
    }
    class Keyid {
        bytes: string;
        read(bytes: Uint8Array): Keyid;
        write(): Uint16Array;
        toHex(): string;
    }
    class SessionKey { data: Uint8Array; algorithm: String }
    namespace packet {
        class Signature {
            isExpired(date: Date): boolean;
        }
        class PublicKey {
            created: Date;
            read(bytes: Uint8Array): PublicKey;
            write(): Uint8Array;
            getKeyId(): Keyid;
            getFingerprint(): string;
            getAlgorithmInfo(): { algorithm: string, bits: number };

        }
        class PublicSubkey extends PublicKey {
        }
    }
    class Message { }
    namespace key {
        function readArmored(armoredText: string): {
            keys: Array<key.Key>
            err?: Array<Error>
        };
        class User { }
        class Key {
            getExpirationTime(): Promise<Date>
            getPrimaryUser(date?: Date): { user: key.User, selfCertification: packet.Signature };
            getUserIds(): Array<string>;
            isPrivate(): boolean;
            primaryKey: packet.PublicKey;
            subKeys: Array<SubKey>
        }

        class SubKey {
            subKey: packet.PublicSubkey;
        }
    }

    function encrypt(args: {
        data: string | Uint8Array,
        publicKeys?: key.Key | Array<key.Key>,
        privateKeys?: key.Key | Array<key.Key>,
        passwords?: string | Array<string>,
        sessionKey?: SessionKey,
        filename?: string,
        compression?: any,
        armor?: boolean,
        detached?: boolean,
        signature?: any,
        returnSessionKey?: boolean,
        wildcard?: boolean,
        date?: Date
    }): Promise<{
        data?: string,
        message?: Message,
        signature?: packet.Signature
    }>;
}