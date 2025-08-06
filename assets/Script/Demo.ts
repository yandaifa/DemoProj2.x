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

    protected onLoad(): void {
        this.init.on(cc.Node.EventType.TOUCH_END, this.initSDK, this)
        this.login.on(cc.Node.EventType.TOUCH_END, this.loginSDK, this)
        this.showPrivacy.on(cc.Node.EventType.TOUCH_END, this.showPolicy, this)
        this.showBanner.on(cc.Node.EventType.TOUCH_END, this.showBannerAd, this)
        this.hideBanner.on(cc.Node.EventType.TOUCH_END, this.hideBannerAd, this)
        this.showInters.on(cc.Node.EventType.TOUCH_END, this.showIntersAd, this)
        this.hideInters.on(cc.Node.EventType.TOUCH_END, this.hideIntersAd, this)
        this.showVideo.on(cc.Node.EventType.TOUCH_END, this.showVideoAd, this)
    }

    initSDK() {
        console.log('start init')
        let param: Config
        param = {
            pkgName: "",
            appId:"",
            bannerId: [],
            intersId: [],
            videoId: [""],
            nativeId: [],
            nativeBannerId: []
        }
        YCSDK.ins.init(param, () => {
            console.log("demo init")
        })
    }

    loginSDK() {
        YCSDK.ins.login(null)
    }

    showPolicy() {
        YCSDK.ins.showPolicy(this.node.parent, {
            userAgree: () => {
                console.log("userAgree")
            },
            nodeError: () => {
                //传入的节点错误，隐私政策弹窗依赖游戏节点
                console.log("nodeError")
            },
            onAgree: () => {
                //同意隐私政策，继续游戏
                console.log("onAgree")
            },
            onDisAgree: () => {
                //不同意隐私政策，退出游戏
                console.log("onDisAgree")
            }
        })
    }

    showBannerAd() {
        YCSDK.ins.showBanner()
    }

    hideBannerAd() {
        YCSDK.ins.hideBanner()
    }

    showIntersAd() {
        YCSDK.ins.showInters()
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
