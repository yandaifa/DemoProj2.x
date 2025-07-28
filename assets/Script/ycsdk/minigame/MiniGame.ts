import { AdTactics } from "../AdTactics";
import { GameInterface } from "../GameInterface";
import { sdkconfig } from "../SDKConfig";
import { YCSDK } from "../YCSDK";
import { BannerType } from "./BannerType";
import { DouYinGame } from "./douyin/DouYinGame";
import HttpRequest from "./HttpRequest";
import { HuaWeiGame } from "./huawei/HuaWeiGame";
import { InterstitialType } from "./InterstitialType";
import { KuaiShouGame } from "./kuaishou/KuaiShouGame";
import { Md5 } from "./md5";
import { OppoGame } from "./oppo/OppoGame";
import { VivoGame } from "./vivo/VivoGame";
import { XiaoMiGame } from "./xiaomi/XiaoMiGame";

export class MiniGame implements GameInterface {

    private channel: GameInterface

    constructor(platform: number) {
        this.channelFactory(platform)
    }

    private channelFactory(platform) {
        console.log("switch platform:", platform)
        switch (platform) {
            case cc.sys.HUAWEI_GAME:
                this.channel = new HuaWeiGame()
                break
            case cc.sys.XIAOMI_GAME:
                this.channel = new XiaoMiGame()
                break
            case cc.sys.OPPO_GAME:
                this.channel = new OppoGame()
                break
            case cc.sys.VIVO_GAME:
                this.channel = new VivoGame()
                break
            case cc.sys.BYTEDANCE_GAME:
                this.channel = new DouYinGame()
                break
            case cc.sys.WECHAT_GAME:
                this.channel = new KuaiShouGame()
                break
            default:
                break
        }
    }

    jsonToKeyValue(json: Record<string, any>): string {
        return Object.entries(json)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&')
    }

    init(callBack?): void {
        if (!YCSDK.ins.isRun(cc.sys.OPPO_GAME)) {
            this.setAdStateListener()
            this.channel.init(callBack)
            return
        }
        const url = "https://iaa.rhino-times.com/api/game/query-match-config"
        const data = { pkgName: sdkconfig.pkgName, version: sdkconfig.version }
        const sign = Md5.hashStr(this.jsonToKeyValue(data))
        data["sign"] = sign
        HttpRequest.get().requestPostjson(url, data, (success, result) => {
            if (!success || !result) {
                this.setAdStateListener()
                this.channel.init(callBack)
                return
            }
            const res = result.oexts
            sdkconfig.open = result.open
            sdkconfig.ratio = res.ratio
            sdkconfig.subornUserTest = res.subornUserTest
            this.setAdStateListener()
            this.channel.init(callBack)
        })
    }

    setAdStateListener() {
        const st = new AdTactics()
        st.refreshAll()
        YCSDK.ins.setAdStateListener(st)
    }

    login(callBack?: Function): void {
        this.channel.login(callBack)
    }

    pay(params: string, callBack): void {
        this.channel.pay(params, callBack)
    }

    showBanner(position: BannerType): void {
        if (!sdkconfig.open) {
            console.log("广告未开启")
            return
        }
        this.channel.showBanner(position)
    }

    hideBanner(): void {
        this.channel.hideBanner()
    }

    showInters(type: InterstitialType): void {
        if (!sdkconfig.open) {
            console.log("广告未开启")
            return
        }
        console.log("interstitial type:", type)
        this.channel.showInters(type)
    }

    hideInters(type: InterstitialType = InterstitialType.Native): void {
        this.channel.hideInters(type)
    }

    showVideo(callBack: Function): boolean {
        if (!sdkconfig.open) {
            console.log("广告未开启")
            callBack && callBack(true)//不影响正常游玩，下发奖励
            return false
        }
        return this.channel.showVideo(callBack)
    }

    customFunc(methodName: string, params: any[], callBack: Function) {
        if (!sdkconfig.open) {
            console.log("广告未开启")
            return
        }
        this.channel.customFunc(methodName, params, callBack)
    }
}
