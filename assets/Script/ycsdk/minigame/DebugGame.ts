import { AdTactics } from "../AdTactics";
import { AdType } from "../AdType";
import { GameInterface } from "../GameInterface";
import { sdkconfig } from "../SDKConfig";
import { StorageUtils } from "../StorageUtils";
import { YCSDK } from "../YCSDK";
import { BannerType } from "./BannerType";
import { InterstitialType } from "./InterstitialType";
import { PrivacyEvent } from "./PrivacyEvent";
import { PrivacyListener } from "./PrivacyListener";

export class DebugGame implements GameInterface {
    private privacyKey: string = "PRIVACY"

    init(callBack?): void {
        console.log("debug init")
        const st = new AdTactics()
        st.refreshAll()
        YCSDK.ins.setAdStateListener(st)
        callBack && callBack()
    }

    showPolicy(node: cc.Node, callBack: PrivacyListener) {
        let agree = StorageUtils.getStringData(this.privacyKey)
        console.log(agree)
        if (agree == 'agree') {
            console.log("user agree privacy, not show")
            callBack.userAgree && callBack.userAgree()
            return
        }

        if (!node) {
            console.log("node is null")
            callBack.nodeError && callBack.nodeError()
            return
        }
        cc.resources.load('Privacy/policyUI', cc.Prefab, (err, prefab: cc.Prefab) => {
            if (err) {
                console.error('加载Prefab失败:', err)
                return
            }
            const yinsiUI = cc.instantiate(prefab)
            const content = yinsiUI.getChildByName('panel').getChildByName('content')
            if (!content.getComponent(PrivacyEvent)) {
                content.addComponent(PrivacyEvent)
            }
            const agree = yinsiUI.getChildByName('panel').getChildByName('agree')
            agree.on(cc.Node.EventType.TOUCH_END, () => {
                callBack.onAgree && callBack.onAgree()
                StorageUtils.setStringData(this.privacyKey, "agree")
                yinsiUI.active = false
            }, this)
            const disagree = yinsiUI.getChildByName('panel').getChildByName('disagree')
            disagree.on(cc.Node.EventType.TOUCH_END, () => {
                callBack.onDisAgree && callBack.onDisAgree()
                yinsiUI.getChildByName('panel').getChildByName('tip').active = true
            }, this)
            YCSDK.ins.getGameNode().addChild(yinsiUI)
        })
    }

    login(callBack?: Function): void {
        console.log("debug call login")
    }

    pay(params: string, callBack: Function): void {
        console.log("bubug call pay")
    }

    showBanner(position: BannerType): void {
        console.log("bubug call show banner")
    }

    hideBanner(): void {
        console.log("bubug call hide banner")
    }

    showInters(type: InterstitialType): void {
        console.log("debug call show interstitial ad type:", type)
    }

    hideInters(type: InterstitialType): void {
        console.log("bubug call hide interstitial")
    }

    showVideo(callBack: Function): boolean {
        console.log("call debug show video ad")
        // YCSDK.ins.onError(AdType.Video, callBack)
        callBack && callBack(true)
        return true
    }

    customFunc(methodName: string, params: any[], callBack: Function) {
        console.log("bubug call custom function name:", methodName)
    }

}