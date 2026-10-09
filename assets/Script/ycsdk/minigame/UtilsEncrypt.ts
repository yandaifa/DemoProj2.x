import { Md5 } from "./md5";
import { aesEcbDecrypt, aesEcbEncrypt } from "./aes";

/**
 * 加解密工具。
 *
 * 说明：OPPO/微信等小游戏在 Creator 打包时对 node_modules 里 UMD/CommonJS 形态的
 * crypto-js 支持不稳定（import 到的 CryptoJS 对象里 MD5/AES/enc 等成员为 undefined，
 * 调用即抛 “(void 0) is not a function”）。这里改用纯 TS 本地实现，无运行时第三方依赖。
 *
 * 输出与原实现完全一致：
 *   - buildSec = Base64( MD5("pichu-yang" + appId + appKey) ).slice(0, 16)
 *   - encrypt  = AES-ECB + PKCS#7 加密后取 Base64（等价 CryptoJS.AES ... ECB/Pkcs7）
 *   - decrypt  = 上述逆过程，返回 UTF-8 明文
 */

const B64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function bytesToBase64(bytes: Uint8Array): string {
    let out = "";
    for (let i = 0; i < bytes.length; i += 3) {
        const b0 = bytes[i];
        const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
        const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
        out += B64_CHARS[b0 >> 2];
        out += B64_CHARS[((b0 & 0x03) << 4) | (b1 >> 4)];
        out += i + 1 < bytes.length ? B64_CHARS[((b1 & 0x0f) << 2) | (b2 >> 6)] : "=";
        out += i + 2 < bytes.length ? B64_CHARS[b2 & 0x3f] : "=";
    }
    return out;
}

function base64ToBytes(b64: string): Uint8Array {
    b64 = String(b64).replace(/\s+/g, "");
    while (b64.length % 4 !== 0) b64 += "=";
    const map: { [k: string]: number } = {};
    for (let i = 0; i < B64_CHARS.length; i++) map[B64_CHARS[i]] = i;
    const out: number[] = [];
    for (let i = 0; i < b64.length; i += 4) {
        const c0 = b64[i];
        const c1 = b64[i + 1];
        const c2 = b64[i + 2];
        const c3 = b64[i + 3];
        if (c0 === undefined || c1 === undefined || c0 === "=" || c1 === "=") break;
        const n0 = map[c0];
        const n1 = map[c1];
        if (n0 === undefined || n1 === undefined) throw new Error("invalid base64");
        const n2 = c2 === undefined || c2 === "=" ? 0 : map[c2];
        const n3 = c3 === undefined || c3 === "=" ? 0 : map[c3];
        out.push((n0 << 2) | (n1 >> 4));
        if (c2 !== undefined && c2 !== "=") out.push(((n1 & 0x0f) << 4) | (n2 >> 2));
        if (c3 !== undefined && c3 !== "=") out.push(((n2 & 0x03) << 6) | n3);
    }
    return Uint8Array.from(out);
}

function utf8Encode(str: string): Uint8Array {
    const out: number[] = [];
    for (let i = 0; i < str.length; i++) {
        let code = str.charCodeAt(i);
        if (code >= 0xd800 && code <= 0xdbff && i + 1 < str.length) {
            const low = str.charCodeAt(i + 1);
            if (low >= 0xdc00 && low <= 0xdfff) {
                code = ((code - 0xd800) << 10) + (low - 0xdc00) + 0x10000;
                i++;
            }
        }
        if (code < 0x80) {
            out.push(code);
        } else if (code < 0x800) {
            out.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
        } else if (code < 0x10000) {
            out.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
        } else {
            out.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 0x3f), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
        }
    }
    return Uint8Array.from(out);
}

function utf8Decode(bytes: Uint8Array): string {
    let out = "";
    for (let i = 0; i < bytes.length;) {
        const b0 = bytes[i];
        if (b0 < 0x80) {
            out += String.fromCharCode(b0);
            i++;
        } else if (b0 < 0xe0) {
            out += String.fromCharCode(((b0 & 0x1f) << 6) | (bytes[i + 1] & 0x3f));
            i += 2;
        } else if (b0 < 0xf0) {
            out += String.fromCharCode(((b0 & 0x0f) << 12) | ((bytes[i + 1] & 0x3f) << 6) | (bytes[i + 2] & 0x3f));
            i += 3;
        } else {
            const cp = ((b0 & 0x07) << 18) | ((bytes[i + 1] & 0x3f) << 12) | ((bytes[i + 2] & 0x3f) << 6) | (bytes[i + 3] & 0x3f);
            out += String.fromCharCode(0xd800 + ((cp - 0x10000) >> 10), 0xdc00 + ((cp - 0x10000) & 0x3ff));
            i += 4;
        }
    }
    return out;
}

function hexToBytes(hex: string): Uint8Array {
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i++) {
        out[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return out;
}

function md5Base64(str: string): string {
    return bytesToBase64(hexToBytes(Md5.hashStr(str)));
}

export class UtilsEncrypt {

    public static buildSec(appId, appKey) {
        try {
            const seed = `pichu-yang${appId}${appKey}`;
            return md5Base64(seed).slice(0, 16);
        } catch (e) {
            console.log("buildsec error:", e)
            return ""
        }
    }

    public static encrypt(plain, secret): string {
        try {
            const text = (typeof plain === "string") ? plain : JSON.stringify(plain)
            const key = utf8Encode(secret)
            const cipher = aesEcbEncrypt(utf8Encode(text), key)
            return bytesToBase64(cipher)
        } catch (e) {
            console.log("encrypt error:", e)
            return ""
        }
    }

    public static decrypt(b64, secret): string {
        try {
            const key = utf8Encode(secret)
            const plain = aesEcbDecrypt(base64ToBytes(b64), key)
            return utf8Decode(plain)
        } catch (e) {
            console.log("decrypt error:", e)
            return ""
        }
    }
}
