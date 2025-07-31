import { AdState } from "./AdState"
import { AdType } from "./AdType"
import { BannerType } from "./minigame/BannerType"
import { InterstitialType } from "./minigame/InterstitialType"
import { sdkconfig } from "./SDKConfig"
import { YCSDK } from "./YCSDK"

export class AdTactics implements AdState {

    private bannerIndex: number = 0
    private bannerLoaded: string[] = []
    private intersIndex: number = 0
    private intersLoaded: string[] = []
    private nativeIndex: number = 0
    private nativeLoaded: string[] = []
    private videoIndex: number = 0
    private videoLoaded: string[] = []
    private nativeBannerIndex: number = 0
    private nativeBanerLoaded: string[] = []
    private timerBigPic: number = 0

    onLoad(type: AdType): void {
        console.log("on load: ", type)
        this.refreshId(type)//加载广告成功后换id
        switch (type) {
            case AdType.Banner:
                this.bannerLoaded = []
                break
            case AdType.NativeBanner:
                this.nativeBanerLoaded = []
                break
            case AdType.Inters:
                this.intersLoaded = []
                break
            case AdType.Native:
                this.nativeLoaded = []
                break
            case AdType.Video:
                this.videoLoaded = []
                break
        }
    }

    onError(type: AdType, callBack?: Function): void {
        console.log("on error: ", type)
        if (YCSDK.ins.isRun(cc.sys.OPPO_GAME)) {
            this.reLoadAd(type, callBack)
        }
    }

    onShow(type: AdType): void {
        console.log("on show: ", type)
    }

    onClick(type: AdType): void {
        console.log("on click: ", type)
    }

    onClose(type: AdType, callBack?: Function): void {
        console.log("on close: ", type)
    }

    onReward(): void {
        console.log("on reward")
    }

    reLoadAd(type: AdType, callback): void {
        console.log("reLoadAd: ", type)
        switch (type) {
            case AdType.Banner:
                this.reshowBanner()
                break
            case AdType.NativeBanner:
                this.reshowNativeBanner()
                break
            case AdType.Inters:
                this.reshowInterstitial()
                break
            case AdType.Native:
                this.reshowNative()
                break
            case AdType.Video:
                this.reshowVideo(callback)
                break
        }
    }

    reshowBanner() {
        const length = sdkconfig.bannerId.length
        if (length == 0 || length == 1) {
            console.log("re show banner need more than 1 id")
            return
        }
        if (this.bannerLoaded.includes(sdkconfig.ycBannerId)) {
            console.log("reshowBanner1: ", sdkconfig.ycBannerId, " already loaded")
            this.bannerLoaded = []
            return
        }
        this.bannerLoaded.push(sdkconfig.ycBannerId)
        this.refreshId(AdType.Banner)
        if (this.bannerLoaded.includes(sdkconfig.ycBannerId)) {
            console.log("reshowBanner2: ", sdkconfig.ycBannerId, " already loaded")
            this.bannerLoaded = []
            return
        }
        YCSDK.ins.showBanner()
    }

    reshowNativeBanner() {
        const length = sdkconfig.nativeBannerId.length
        if (length == 0 || length == 1) {
            console.log("re show native banner need more than 1 id")
            return
        }
        if (this.nativeBanerLoaded.includes(sdkconfig.ycNativeBannerId)) {
            console.log("reshow native Banner1: ", sdkconfig.ycNativeBannerId, " already loaded")
            this.nativeBanerLoaded = []
            return
        }
        this.nativeBanerLoaded.push(sdkconfig.ycNativeBannerId)
        this.refreshId(AdType.Banner)
        if (this.nativeBanerLoaded.includes(sdkconfig.ycNativeBannerId)) {
            console.log("reshow native Banner2: ", sdkconfig.ycNativeBannerId, " already loaded")
            this.nativeBanerLoaded = []
            return
        }
        YCSDK.ins.showBanner(BannerType.Native)
    }

    reshowNative() {
        const length = sdkconfig.nativeId.length
        if (length == 0 || length == 1) {
            console.log("re show native need more than 1 id")
            return
        }
        if (this.nativeLoaded.includes(sdkconfig.ycNativeId)) {
            console.log("reshowNative1: ", sdkconfig.ycNativeId, " already loaded")
            this.nativeLoaded = []
            return
        }
        this.nativeLoaded.push(sdkconfig.ycNativeId)
        this.refreshId(AdType.Native)
        if (this.nativeLoaded.includes(sdkconfig.ycNativeId)) {
            console.log("reshowNative2: ", sdkconfig.ycNativeId, " already loaded")
            this.nativeLoaded = []
            return
        }
        YCSDK.ins.showInters(InterstitialType.Native)
    }

    reshowInterstitial() {
        const length = sdkconfig.intersId.length
        if (length == 0 || length == 1) {
            console.log("re show inters need more than 1 id")
            return
        }
        if (this.intersLoaded.includes(sdkconfig.ycIntersId)) {
            console.log("reshowInterstitial1: ", sdkconfig.ycIntersId, " already loaded")
            this.intersLoaded = []
            return
        }
        this.intersLoaded.push(sdkconfig.ycIntersId)
        this.refreshId(AdType.Inters)
        if (this.intersLoaded.includes(sdkconfig.ycIntersId)) {
            console.log("reshowInterstitial2: ", sdkconfig.ycIntersId, " already loaded")
            this.intersLoaded = []
            return
        }
        YCSDK.ins.showInters(InterstitialType.Initial)
    }

    reshowVideo(callback) {
        const length = sdkconfig.videoId.length
        if (length == 0 || length == 1) {
            console.log("re show video need more than 1 id")
            callback && callback(false)
            return
        }
        if (this.videoLoaded.includes(sdkconfig.ycVideoId)) {
            console.log("reshowVideo1: ", sdkconfig.ycVideoId, " already loaded")
            callback && callback(false)
            this.videoLoaded = []
            return
        }
        this.videoLoaded.push(sdkconfig.ycVideoId)
        this.refreshId(AdType.Video)
        if (this.videoLoaded.includes(sdkconfig.ycVideoId)) {
            console.log("reshowVideo2: ", sdkconfig.ycVideoId, " already loaded")
            callback && callback(false)
            this.videoLoaded = []
            return
        }
        YCSDK.ins.showVideo(callback)
    }

    refreshAll() {
        const keys = Object.keys(AdType) as AdType[]
        for (const type of keys) {
            this.refreshId(type)
        }
        console.log("refreshAll")
    }

    checkBannerId() {
        var id = sdkconfig.bannerId
        if (!id) {
            console.log("bannerId is not config")
            return
        }
        if (!Array.isArray(id)) {
            console.log("bannerId is only one")
            sdkconfig.ycBannerId = id
            return
        }
        if (id.length == 1) {
            if (!id[0]) {
                console.log("id[0] config is empty string")
                return
            }
            sdkconfig.ycBannerId = id[0]
            return
        }
        if (id.length == 0) {
            console.log("bannerId config is empty")
            return
        }
        sdkconfig.ycBannerId = id[this.bannerIndex]
        this.bannerIndex += 1
        if (this.bannerIndex >= id.length) {
            this.bannerIndex = 0
        }
    }

    checkNativeBannerId() {
        var id = sdkconfig.nativeBannerId
        if (!id) {
            console.log("native banner id is not config")
            return
        }
        if (!Array.isArray(id)) {
            console.log("native banner id is only one")
            sdkconfig.ycNativeBannerId = id
            return
        }
        if (id.length == 1) {
            if (!id[0]) {
                console.log("id[0] config is empty string")
                return
            }
            sdkconfig.ycNativeBannerId = id[0]
            return
        }
        if (id.length == 0) {
            console.log("native banner id  config is empty")
            return
        }
        sdkconfig.ycNativeBannerId = id[this.nativeBannerIndex]
        this.nativeBannerIndex += 1
        if (this.nativeBannerIndex >= id.length) {
            this.nativeBannerIndex = 0
        }
    }

    checkIntersId() {
        var id = sdkconfig.intersId
        if (!id) {
            console.log("intersId is not config")
            return
        }
        if (!Array.isArray(id)) {
            console.log("intersId is only one")
            sdkconfig.ycIntersId = id
            return
        }
        if (id.length == 1) {
            if (!id[0]) {
                console.log("id[0] config is empty string")
                return
            }
            sdkconfig.ycIntersId = id[0]
            return
        }
        if (id.length == 0) {
            console.log("intersId config is empty")
            return
        }
        sdkconfig.ycIntersId = id[this.intersIndex]
        this.intersIndex += 1
        if (this.intersIndex >= id.length) {
            this.intersIndex = 0
        }
    }

    checkNativeId() {
        var id = sdkconfig.nativeId
        if (!id) {
            console.log("nativeId is not config")
            return
        }
        if (!Array.isArray(id)) {
            console.log("nativeId is only one")
            sdkconfig.ycNativeId = id
            return
        }
        if (id.length == 1) {
            if (!id[0]) {
                console.log("id[0] config is empty string")
                return
            }
            sdkconfig.ycNativeId = id[0]
            return
        }
        if (id.length == 0) {
            console.log("nativeId config is empty")
            return
        }
        sdkconfig.ycNativeId = id[this.nativeIndex]
        this.nativeIndex += 1
        if (this.nativeIndex >= id.length) {
            this.nativeIndex = 0
        }
    }

    checkVideoId() {
        var id = sdkconfig.videoId
        if (!id) {
            console.log("videoId is not config")
            return
        }
        if (!Array.isArray(id)) {
            console.log("videoId is only one")
            sdkconfig.ycVideoId = id
            return
        }
        if (id.length == 1) {
            console.log("videoId length is 1")
            if (!id[0]) {
                console.log("id[0] config is empty string")
                return
            }
            sdkconfig.ycVideoId = id[0]
            return
        }
        if (id.length == 0) {
            console.log("videoId config is empty")
            return
        }
        sdkconfig.ycVideoId = id[this.videoIndex]
        this.videoIndex += 1
        if (this.videoIndex >= id.length) {
            this.videoIndex = 0
        }
    }

    refreshId(type: AdType) {
        console.log("refresh id, type: ", type)
        switch (type) {
            case AdType.Banner:
                this.checkBannerId()
                break
            case AdType.NativeBanner:
                this.checkNativeBannerId()
                break
            case AdType.Inters:
                this.checkIntersId()
                break
            case AdType.Native:
                this.checkNativeId()
                break
            case AdType.Video:
                this.checkVideoId()
                break
        }
    }

    random(max: number): number {
        max = Math.floor(max)
        return Math.floor(Math.random() * max)
    }

}

