declare module 'openpgp' {
    interface KeyModule {
        readArmored(armoredText: string): ReadResult;
    }
    interface ConfigModule {
        commentstring: string;
        show_comment: boolean;
        show_version: boolean;
    }
    interface ReadResult {
        keys: Array<object>
        err?: Array<Error>
    }
    interface EncryptResult {
        data?: string,
        message?: object,
        signature?: any,
    }
    class Key { }
    class SessionKey { data: Uint8Array; algorithm: String }
    class Signature { }
    class Message { }

    var key: KeyModule;
    var config: ConfigModule
    interface EncryptArgs {
        data: String | Uint8Array,
        publicKeys?: Key | Array<Key>,
        privateKeys?: Key | Array<Key>,
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
    function encrypt(args: EncryptArgs): Promise<EncryptResult>;
}