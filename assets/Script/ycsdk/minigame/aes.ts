/**
 * 纯 TypeScript 实现的 AES 加密（无任何第三方运行时依赖）。
 *
 * 仅提供小游戏环境最常用的 ECB 分组模式 + PKCS#7 填充，
 * 加密结果与 crypto-js（CryptoJS.AES.encrypt(x, key, { mode: ECB, padding: Pkcs7 })）一致：
 *   - key 支持 16/24/32 字节（AES-128/192/256）
 *   - 字节序 / 分组顺序与 FIPS-197 完全一致
 *
 * 数据在 OPPO/微信等小游戏引擎中不需要 node_modules、UMD、global 判断，可安全打包运行。
 */

// ---------------------------------------------------------------------------
// FIPS-197 S-box / 逆 S-box
// ---------------------------------------------------------------------------
const SBOX: number[] = [
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
    0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
    0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
    0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
    0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
    0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
    0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
    0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
    0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
    0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
    0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
];

const INV_SBOX: number[] = [
    0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e, 0x81, 0xf3, 0xd7, 0xfb,
    0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87, 0x34, 0x8e, 0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb,
    0x54, 0x7b, 0x94, 0x32, 0xa6, 0xc2, 0x23, 0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e,
    0x08, 0x2e, 0xa1, 0x66, 0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49, 0x6d, 0x8b, 0xd1, 0x25,
    0x72, 0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16, 0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65, 0xb6, 0x92,
    0x6c, 0x70, 0x48, 0x50, 0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46, 0x57, 0xa7, 0x8d, 0x9d, 0x84,
    0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a, 0xf7, 0xe4, 0x58, 0x05, 0xb8, 0xb3, 0x45, 0x06,
    0xd0, 0x2c, 0x1e, 0x8f, 0xca, 0x3f, 0x0f, 0x02, 0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b,
    0x3a, 0x91, 0x11, 0x41, 0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6, 0x73,
    0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8, 0x1c, 0x75, 0xdf, 0x6e,
    0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89, 0x6f, 0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b,
    0xfc, 0x56, 0x3e, 0x4b, 0xc6, 0xd2, 0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4,
    0x1f, 0xdd, 0xa8, 0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59, 0x27, 0x80, 0xec, 0x5f,
    0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d, 0x2d, 0xe5, 0x7a, 0x9f, 0x93, 0xc9, 0x9c, 0xef,
    0xa0, 0xe0, 0x3b, 0x4d, 0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb, 0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61,
    0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6, 0x26, 0xe1, 0x69, 0x14, 0x63, 0x55, 0x21, 0x0c, 0x7d
];

// 轮常量（RKCON[i]，i 从 1 开始，最大支持 AES-256 的 14 轮）
const RCON: number[] = [
    0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40,
    0x80, 0x1b, 0x36, 0x6c, 0xd8, 0xab, 0x4d
];

const BLOCK_SIZE = 16;

// ---------------------------------------------------------------------------
// GF(2^8) 乘法辅助
// ---------------------------------------------------------------------------
function xtime(a: number): number {
    a &= 0xff;
    return ((a << 1) ^ ((a & 0x80) ? 0x1b : 0)) & 0xff;
}

function mul(a: number, b: number): number {
    a &= 0xff;
    b &= 0xff;
    let result = 0;
    while (b) {
        if (b & 1) result ^= a;
        a = xtime(a);
        b >>>= 1;
    }
    return result & 0xff;
}

// ---------------------------------------------------------------------------
// 密钥扩展（按 FIPS-197 输出轮密钥 words，每 word 对应一列，MSB 为第 0 行字节）
// ---------------------------------------------------------------------------
function keyExpansion(key: Uint8Array): number[] {
    const Nk = key.length / 4;      // 4 / 6 / 8
    const Nr = Nk + 6;              // 10 / 12 / 14
    const w: number[] = [];

    for (let i = 0; i < Nk; i++) {
        w[i] = ((key[4 * i] << 24) | (key[4 * i + 1] << 16) | (key[4 * i + 2] << 8) | key[4 * i + 3]) >>> 0;
    }

    for (let i = Nk; i < 4 * (Nr + 1); i++) {
        let temp = w[i - 1];
        if (i % Nk === 0) {
            // RotWord + SubWord + Rcon
            temp = (((temp << 8) | (temp >>> 24)) >>> 0);
            temp = (
                (SBOX[(temp >>> 24) & 0xff] << 24) |
                (SBOX[(temp >>> 16) & 0xff] << 16) |
                (SBOX[(temp >>> 8) & 0xff] << 8) |
                SBOX[temp & 0xff]
            ) >>> 0;
            temp = (temp ^ ((RCON[i / Nk] << 24) >>> 0)) >>> 0;
        } else if (Nk > 6 && i % Nk === 4) {
            temp = (
                (SBOX[(temp >>> 24) & 0xff] << 24) |
                (SBOX[(temp >>> 16) & 0xff] << 16) |
                (SBOX[(temp >>> 8) & 0xff] << 8) |
                SBOX[temp & 0xff]
            ) >>> 0;
        }
        w[i] = (w[i - Nk] ^ temp) >>> 0;
    }
    return w;
}

// ---------------------------------------------------------------------------
// 分组加解密（输入 / 输出均为 16 字节，state 按“列优先”存放：s[4c + r]）
// ---------------------------------------------------------------------------
function addRoundKey(state: number[], roundKeyWords: number[], round: number): void {
    for (let c = 0; c < 4; c++) {
        const word = roundKeyWords[round * 4 + c];
        for (let r = 0; r < 4; r++) {
            state[4 * c + r] ^= (word >>> (8 * (3 - r))) & 0xff;
        }
    }
}

function subBytes(state: number[]): void {
    for (let i = 0; i < state.length; i++) state[i] = SBOX[state[i]];
}

function invSubBytes(state: number[]): void {
    for (let i = 0; i < state.length; i++) state[i] = INV_SBOX[state[i]];
}

// ShiftRows：第 r 行循环左移 r 个字节
function shiftRows(state: number[]): void {
    for (let r = 1; r < 4; r++) {
        const row = [state[r], state[4 + r], state[8 + r], state[12 + r]];
        for (let c = 0; c < 4; c++) {
            state[4 * c + r] = row[(c + r) % 4];
        }
    }
}

// InvShiftRows：第 r 行循环右移 r 个字节
function invShiftRows(state: number[]): void {
    for (let r = 1; r < 4; r++) {
        const row = [state[r], state[4 + r], state[8 + r], state[12 + r]];
        for (let c = 0; c < 4; c++) {
            state[4 * c + r] = row[((c - r) % 4 + 4) % 4];
        }
    }
}

function mixColumns(state: number[]): void {
    for (let c = 0; c < 4; c++) {
        const a0 = state[4 * c];
        const a1 = state[4 * c + 1];
        const a2 = state[4 * c + 2];
        const a3 = state[4 * c + 3];
        state[4 * c] = xtime(a0) ^ (xtime(a1) ^ a1) ^ a2 ^ a3;
        state[4 * c + 1] = a0 ^ xtime(a1) ^ (xtime(a2) ^ a2) ^ a3;
        state[4 * c + 2] = a0 ^ a1 ^ xtime(a2) ^ (xtime(a3) ^ a3);
        state[4 * c + 3] = (xtime(a0) ^ a0) ^ a1 ^ a2 ^ xtime(a3);
    }
}

function invMixColumns(state: number[]): void {
    for (let c = 0; c < 4; c++) {
        const a0 = state[4 * c];
        const a1 = state[4 * c + 1];
        const a2 = state[4 * c + 2];
        const a3 = state[4 * c + 3];
        state[4 * c] = mul(a0, 14) ^ mul(a1, 11) ^ mul(a2, 13) ^ mul(a3, 9);
        state[4 * c + 1] = mul(a0, 9) ^ mul(a1, 14) ^ mul(a2, 11) ^ mul(a3, 13);
        state[4 * c + 2] = mul(a0, 13) ^ mul(a1, 9) ^ mul(a2, 14) ^ mul(a3, 11);
        state[4 * c + 3] = mul(a0, 11) ^ mul(a1, 13) ^ mul(a2, 9) ^ mul(a3, 14);
    }
}

function encryptBlock(block: Uint8Array, roundKeyWords: number[]): Uint8Array {
    const Nr = roundKeyWords.length / 4 - 1;
    const state: number[] = [];
    for (let i = 0; i < BLOCK_SIZE; i++) state.push(block[i]);

    addRoundKey(state, roundKeyWords, 0);
    for (let round = 1; round < Nr; round++) {
        subBytes(state);
        shiftRows(state);
        mixColumns(state);
        addRoundKey(state, roundKeyWords, round);
    }
    subBytes(state);
    shiftRows(state);
    addRoundKey(state, roundKeyWords, Nr);

    return Uint8Array.from(state);
}

function decryptBlock(block: Uint8Array, roundKeyWords: number[]): Uint8Array {
    const Nr = roundKeyWords.length / 4 - 1;
    const state: number[] = [];
    for (let i = 0; i < BLOCK_SIZE; i++) state.push(block[i]);

    addRoundKey(state, roundKeyWords, Nr);
    for (let round = Nr - 1; round >= 1; round--) {
        invShiftRows(state);
        invSubBytes(state);
        addRoundKey(state, roundKeyWords, round);
        invMixColumns(state);
    }
    invShiftRows(state);
    invSubBytes(state);
    addRoundKey(state, roundKeyWords, 0);

    return Uint8Array.from(state);
}

// ---------------------------------------------------------------------------
// PKCS#7 填充
// ---------------------------------------------------------------------------
function pkcs7Pad(data: Uint8Array, blockSize: number): Uint8Array {
    const padLen = blockSize - (data.length % blockSize);
    const out = new Uint8Array(data.length + padLen);
    out.set(data);
    for (let i = data.length; i < out.length; i++) out[i] = padLen;
    return out;
}

function pkcs7Unpad(data: Uint8Array): Uint8Array {
    if (data.length === 0) throw new Error("aes: empty data to unpad");
    const padLen = data[data.length - 1];
    if (padLen < 1 || padLen > BLOCK_SIZE || padLen > data.length) {
        throw new Error("aes: invalid pkcs7 padding");
    }
    for (let i = data.length - padLen; i < data.length; i++) {
        if (data[i] !== padLen) throw new Error("aes: invalid pkcs7 padding");
    }
    return data.slice(0, data.length - padLen);
}

function expandKeyOrThrow(key: Uint8Array): number[] {
    if (key.length !== 16 && key.length !== 24 && key.length !== 32) {
        throw new Error("aes: key must be 16/24/32 bytes, got " + key.length);
    }
    return keyExpansion(key);
}

// ---------------------------------------------------------------------------
// 对外接口：ECB + PKCS#7
// ---------------------------------------------------------------------------
export function aesEcbEncrypt(plain: Uint8Array, key: Uint8Array): Uint8Array {
    const roundKeyWords = expandKeyOrThrow(key);
    const padded = pkcs7Pad(plain, BLOCK_SIZE);
    const out = new Uint8Array(padded.length);
    for (let offset = 0; offset < padded.length; offset += BLOCK_SIZE) {
        out.set(encryptBlock(padded.subarray(offset, offset + BLOCK_SIZE), roundKeyWords), offset);
    }
    return out;
}

export function aesEcbDecrypt(cipher: Uint8Array, key: Uint8Array): Uint8Array {
    const roundKeyWords = expandKeyOrThrow(key);
    if (cipher.length === 0 || cipher.length % BLOCK_SIZE !== 0) {
        throw new Error("aes: cipher length must be a multiple of 16");
    }
    const out = new Uint8Array(cipher.length);
    for (let offset = 0; offset < cipher.length; offset += BLOCK_SIZE) {
        out.set(decryptBlock(cipher.subarray(offset, offset + BLOCK_SIZE), roundKeyWords), offset);
    }
    return pkcs7Unpad(out);
}
