import { BannerType } from "./ycsdk/minigame/BannerType";
import { InterstitialType } from "./ycsdk/minigame/InterstitialType";
import { Config, sdkconfig } from "./ycsdk/SDKConfig";
import { YCSDK } from "./ycsdk/YCSDK";

const { ccclass, property } = cc._decorator;

@ccclass('Demo')
export default class Demo extends cc.Component {

    @property(cc.Node)
    init: cc.Node = null

    @property(cc.Node)
    login: cc.Node = null

    @property(cc.Node)
    showPrivacy: cc.Node = null

    @property(cc.Node)
    showBanner: cc.Node = null

    @property(cc.Node)
    hideBanner: cc.Node = null

    @property(cc.Node)
    showInters: cc.Node = null

    @property(cc.Node)
    hideInters: cc.Node = null

    @property(cc.Node)
    showVideo: cc.Node = null

    @property(cc.Node)
    showNative: cc.Node = null

    protected onLoad(): void {
        this.init.on(cc.Node.EventType.TOUCH_END, this.initSDK, this)
        this.login.on(cc.Node.EventType.TOUCH_END, this.loginSDK, this)
        this.showPrivacy.on(cc.Node.EventType.TOUCH_END, this.showPolicy, this)
        this.showBanner.on(cc.Node.EventType.TOUCH_END, this.showBannerAd, this)
        this.hideBanner.on(cc.Node.EventType.TOUCH_END, this.hideBannerAd, this)
        this.showInters.on(cc.Node.EventType.TOUCH_END, this.showIntersAd, this)
        this.hideInters.on(cc.Node.EventType.TOUCH_END, this.hideIntersAd, this)
        this.showVideo.on(cc.Node.EventType.TOUCH_END, this.showVideoAd, this)
        this.showNative.on(cc.Node.EventType.TOUCH_END, this.showNativeAd, this)
    }

    initSDK() {
        console.log('start init')
        // let params: Config = {
        //     pkgName: "com.tlx.wddzz.nearme.gamecenter",
        //     appId: "",
        //     company: "yc",
        //     bannerId: ["2913720", "2913716", "2913711", "2913706", "2913702"],
        //     videoId: ["2913725", "2913730", "2913745", "2913750", "2913755"],
        //     nativeId: ["2913818", "2913813", "2913809", "2913804", "2913799"],
        //     nativeBannerId: ["2913762", "2913763", "2913765", "2913770", "2913775"]
        // }
        let params: Config = {
            pkgName: "com.tl.zjfkgq.minigame",
            appId: "300136867",
            company: "tl",
            bannerId: ["2070343394595700736", "2070343297791295488", "2070343201476050944", "2070343104039485440", "2070343006776459264"],
            videoId: ["2070344461019381760", "2070344359941373952", "2070344255216549888", "2070344153793167360", "2070344053020819456"],
            nativeId: ["2070342908625551360", "2070342790507003904", "2070342669976076288", "2070342547824574464", "2070342425996689408"],
            intersId: ["2070343949882490880","2070343839476219904","2070343728033562624","2070343616956858368","2070343505448402944"]
        }
        YCSDK.ins.init(params, () => {
            console.log("demo init")
        })
    }

    loginSDK() {
        YCSDK.ins.login(null)
    }

    showPolicy() {
        YCSDK.ins.showPolicy(this.node.parent, {
            onDisAgree: () => {
                //不同意隐私政策，退出游戏
                console.log("onDisAgree")
            }
        })
        YCSDK.ins.showPrivacyInfo(this.node.parent, () => {
            console.log("PrivacyInfo on close")
        })
    }

    showBannerAd() {
        YCSDK.ins.showBanner(BannerType.Native)
    }

    hideBannerAd() {
        YCSDK.ins.hideBanner()
    }

    showIntersAd() {
        YCSDK.ins.showInters(InterstitialType.Initial)
    }

    showNativeAd() {
        YCSDK.ins.showInters(InterstitialType.Native)
    }

    hideIntersAd() {
        YCSDK.ins.hideInters()
    }

    showVideoAd() {
        YCSDK.ins.showVideo((res) => {
            if (res) {
                console.log("demo video reward")
                return
            }
            console.log("demo video error or close")
        })
    }
}
