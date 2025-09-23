import { AdState } from "./AdState"
import { AdTactics } from "./AdTactics"
import { AdType } from "./AdType"
import { GameInterface } from "./GameInterface"
import { SubornVideoConfig } from "./minigame/SubornVideoConfig"
import { BannerType } from "./minigame/BannerType"
import { DebugGame } from "./minigame/DebugGame"
import { InterstitialType } from "./minigame/InterstitialType"
import { MiniGame } from "./minigame/MiniGame"
import { PayParams } from "./minigame/PayParams"
import { PrivacyEvent } from "./minigame/PrivacyEvent"
import { PrivacyListener } from "./minigame/PrivacyListener"
import { AndroidGame } from "./nativegame/android/AndroidGame"
import { Config, sdkconfig } from "./SDKConfig"
import { StorageUtils } from "./StorageUtils"
import { SubornNativeConfig } from "./minigame/SubornNativeConfig"
import { HarmonyGame } from "./nativegame/harmony/HarmonyGame"

export class YCSDK {

    private static instance: YCSDK
    private platform: GameInterface
    private states: Array<AdState> = []
    private suportPlatfrom = [cc.sys.HUAWEI_GAME, cc.sys.XIAOMI_GAME, cc.sys.OPPO_GAME, cc.sys.VIVO_GAME, cc.sys.BYTEDANCE_GAME, cc.sys.WECHAT_GAME]
    private privacyKey: string = "PRIVACY"
    private gameNode: cc.Node

    private constructor() {
        this.createPlatform()
    }

    public static get ins(): YCSDK {
        if (!YCSDK.instance) {
            YCSDK.instance = new YCSDK()
        }
        return YCSDK.instance
    }

    private createPlatform(): void {
        let platform = cc.sys.platform
        console.log("current platform:", platform)
        if (platform == cc.sys.ANDROID) {
            this.platform = new AndroidGame()
            return
        }
        if(platform == 12){
            this.platform = new HarmonyGame()
            return
        }
        if (this.isSupportMiniGame(platform)) {
            this.platform = new MiniGame(platform)
            return
        }
        console.log("ycsdk暂不支持该小游戏平台,以调试模式运行")
        this.platform = new DebugGame()
    }

    isSupportMiniGame(platform: number) {
        return this.suportPlatfrom.includes(platform)
    }

    isRun(platform: number): boolean {
        return cc.sys.platform == platform
    }

    init(config: Config, callBack?: Function, adconfig?: SubornVideoConfig, cf?: SubornNativeConfig) {
        console.log("ycsdk init")
        if (!config) {
            console.log("ycsdk init fail, config is null")
            callBack && callBack()
            return
        }
        sdkconfig.pkgName = config.pkgName
        sdkconfig.appId = config.appId
        sdkconfig.bannerId = config.bannerId
        sdkconfig.intersId = config.intersId
        sdkconfig.nativeId = config.nativeId
        sdkconfig.videoId = config.videoId
        sdkconfig.nativeBannerId = config.nativeBannerId
        sdkconfig.extension = config.extension
        this.platform.init(callBack, adconfig, cf)
    }

    agreePrivacy(): boolean {
        if (this.isRun(cc.sys.ANDROID) || this.isRun(12)) {
            return true
        }
        return StorageUtils.getStringData(this.privacyKey) == 'agree'
    }

    showPolicy(node: cc.Node, callBack: PrivacyListener): void {
        console.log("ycsdk showPolicy")
        this.gameNode = node
        this.platform.showPolicy(node, callBack)
    }

    login(callBack?: Function): void {
        console.log("ycsdk login")
        this.platform.login(callBack)
    }

    pay(params: PayParams, callBack: Function): void {
        this.platform.pay(params.toJSonString(), callBack)
    }

    showBanner(position: BannerType = BannerType.Bottom): void {
        console.log("ycsdk show banner, type:", position)
        this.platform.showBanner(position)
    }

    hideBanner(): void {
        this.platform.hideBanner()
    }

    random(max: number): number {
        max = Math.floor(max)
        return Math.floor(Math.random() * max) + 1
    }

    showInters(type?: InterstitialType): void {
        console.log("ycsdk show interstitial, type:", type)
        this.platform.showInters(type)
    }

    hideInters(type: InterstitialType = InterstitialType.Native): void {
        this.platform.hideInters(type)
    }

    showVideo(callback: Function): boolean {
        return this.platform.showVideo(callback)
    }

    customFunc(methodName: string, params: any[], callBack: Function) {
        this.platform.customFunc(methodName, params, callBack)
    }

    setAdStateListener(state: AdState) {
        if (!state) {
            console.log('state is null, can not add to list')
            return
        }
        if (this.states.includes(state)) {
            console.log("setAdStateListener interface is called")
            return
        }
        this.states.push(state)
    }

    vertical(): boolean {
        let winSize = cc.view.getDesignResolutionSize()
        console.log('vertical:', winSize.height > winSize.width)
        return winSize.height > winSize.width
    }

    setGameNode(node: cc.Node) {
        this.gameNode = node
    }

    getGameNode(): cc.Node {
        return this.gameNode
    }

    onLoad(type: AdType) {
        if (!this.states.length) {
            return
        }
        this.states.forEach(state => {
            state.onLoad && state.onLoad(type)
        })
    }

    onError(type: AdType, callback?: Function) {
        if (!this.states.length) {
            return
        }
        this.states.forEach(state => {
            state.onError && state.onError(type, callback)
        })
    }

    onShow(type: AdType) {
        if (!this.states.length) {
            return
        }
        this.states.forEach(state => {
            state.onShow && state.onShow(type)
        })
    }

    onClick(type: AdType) {
        if (!this.states.length) {
            return
        }
        this.states.forEach(state => {
            state.onClick && state.onClick(type)
        })
    }

    onClose(type: AdType) {
        if (!this.states.length) {
            return
        }
        this.states.forEach(state => {
            state.onClose && state.onClose(type)
        })
    }

    onReward() {
        if (!this.states.length) {
            return
        }
        this.states.forEach(state => {
            state.onReward && state.onReward()
        })
    }
}