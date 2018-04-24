declare module 'openpgp' {
    namespace config {
        var commentstring: string;
        var show_comment: boolean;
        var show_version: boolean;
    }
    class SessionKey { data: Uint8Array; algorithm: String }
    namespace packet {
        class Signature {
            isExpired(date: Date): boolean;
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
        }
    }

    interface EncryptArgs {
        data: String | Uint8Array,
        publicKeys?: key.Key | Array<key.Key>,
        privateKeys?: key.Key | Array<key.Key>,
        passwords?: String | Array<String>,
        sessionKey?: SessionKey,
        filename?: string,
        compression?: any,
        armor?: boolean,
        detached?: boolean,
        signature?: any,
        returnSessionKey?: boolean,
        wildcard?: boolean,
        date?: Date
    }
    function encrypt(args: EncryptArgs): Promise<{
        data?: string,
        message?: Message,
        signature?: packet.Signature
    }>;
}