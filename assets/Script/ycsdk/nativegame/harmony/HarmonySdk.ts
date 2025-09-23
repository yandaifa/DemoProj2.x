
let initSdkPhasesCallback: (phases: string, res: object) => void;
let intersCallback: (phases: string, res: object) => void;
let videoCallback: (phases: string, res: object) => void;
let payCallback: (phases: string, res: object) => void;
let redeemCallback: (res: object) => void;

const TAG = "XSDK-HarmonySdk";
export default class HarmonySdk {
    /**
     * 单例对象
     */
    private static instance: HarmonySdk;

    /**
     * 私有构造方法 不允许在子类和外部实例化对象（new一下）
     */
    private constructor() { }

    /** 使用 🎈：用懒加载形式实现单例模式 */
    // 前面加个static，变成静态方法，可以直接通过类来调用该方法
    static getInstance() {
        // 判断当前单例是否产生
        // 懒加载：需要用到对象时，再实例化对象
        if (!HarmonySdk.instance) {
            // 实例化对象 new一下
            HarmonySdk.instance = new HarmonySdk();
        }
        return HarmonySdk.instance;
    }

    private VERSION: string = "1.0.1";

    initSDK(params?: object, callback?: (phases: string, res: object) => void): void {
        console.log(TAG, "initSDK version:" + this.VERSION);
        if (callback) initSdkPhasesCallback = callback;
        else initSdkPhasesCallback = null;
        // native.reflection.callStaticMethod(true, "entry/src/main/ets/workers/cocos_worker", "entry/test",JSON.stringify(["initSDK", ""]));
        globalThis.oh.postMessage("initSDK", 0);
    }

    getIntersFlag(): boolean {
        // return jsb.reflection.callStaticMethod(true, "entry/src/main/ets/helper/CocosHelper", "getIntersFlag", "");
        return true;
    }

    showInters(params?: object, callback?: (phases: string, res: object) => void): void {
        if (callback) intersCallback = callback;
        else intersCallback = null;
        // jsb.reflection.callStaticMethod(true, "entry/src/main/ets/helper/CocosHelper", "showInters", "");
        globalThis.oh.postMessage("showInters", 0);
    }

    getVideoFlag(): boolean {
        // return jsb.reflection.callStaticMethod(true, "entry/src/main/ets/helper/CocosHelper", "getVideoFlag", "");
        return true;
    }

    showVideo(params: object, callback: (phases: string, res: object) => void): void {
        if (callback) videoCallback = callback;
        else videoCallback = null;
        // jsb.reflection.callStaticMethod(true, "entry/src/main/ets/helper/CocosHelper", "showVideo", "");
        globalThis.oh.postMessage("showVideo", "");
    }

    pay(params: object, callback: (phases: string, res: object) => void): void {
        if (callback) payCallback = callback;
        else payCallback = null;
        // jsb.reflection.callStaticMethod(true, "entry/src/main/ets/helper/CocosHelper", "pay", JSON.stringify(params));
        globalThis.oh.postMessage("pay", JSON.stringify(params));
    }

    copyText(text: string) {
        globalThis.oh.postMessage("copyText", text);
    }

    openUrl(url: string) {
        globalThis.oh.postMessage("openUrl", url);
    }


    setRedeemCallback(callback: (res: object) => void): void {
        if (callback) redeemCallback = callback;
        else redeemCallback = null;
    }

    consumeOrder(orderId: string): void {
        if (!orderId) return;
        globalThis.oh.postMessage("consumeOrder", orderId);
    }

}

// 初始化回调
window["LightHarmonyInitCallback"] = (phases: string, res: object) => {
    console.log(TAG, "初始化回调", phases, JSON.stringify(res));
    initSdkPhasesCallback && initSdkPhasesCallback(phases, res);
}

// 视频回调
window["LightHarmonyVideoCallback"] = (res: string) => {
    console.log(TAG, "视频是否播放完成?", res == "1");
    videoCallback && videoCallback(res == "1" ? "videoPlayFinish" : "videoPlayBreak", {});
    videoCallback = null;
}

// 插屏回调
window["LightHarmonyIntersCallBack"] = () => {
    console.log(TAG, "插屏关闭回调");
    intersCallback && intersCallback("intersClose", {});
    intersCallback = null;
}

// 支付回调
window["LightHarmonyPayCallBack"] = (success: string, res: any) => {
    console.log(TAG, "支付结果回调:" + res);
    payCallback && payCallback(success == "1" ? "paySuccess" : "payFail", res);
    payCallback = null;
}

//补单回调
window["LightHarmonyRedeemCallBack"] = (res: any) => {
    console.log(TAG, "补单回调:" + res);
    redeemCallback && redeemCallback(res);
}

//OnResult回调
window["LightHarmonyOnResultCallBack"] = (code: string, res: any) => {
    console.log(TAG, "onResult回调, code:" + code + ";res:" + res);
}