import { AdType } from "../../AdType";
import { GameInterface } from "../../GameInterface";
import { sdkconfig } from "../../SDKConfig";
import { YCSDK } from "../../YCSDK";
import { BannerType } from "../BannerType";
import { InterstitialType } from "../InterstitialType";

export class XiaoMiGame implements GameInterface {

    private qg = window['qg']
    private platformVersionCode
    private callback
    private bannerAd
    private lastBanner
    private lastInters
    private rewardedVideoAd
    private nextVideoAd
    private lastReward
    private customAd
    private lastNative
    private lastGameBanner

    init(): void {
        this.platformVersionCode = this.qg.getSystemInfoSync().platformVersionCode
        // this.loadVideo(false)
    }

    login(callBack?: Function): void {
        // this.qg.login({
        //     success: function (res) {
        //         console.log("mi login suc: ", res)
        //         let num = this.qg.getProvider()
        //         console.log("厂商代号：", num)
        //         const shortcut = this.qg.getShortcut()
        //         console.log("桌面图标: ", shortcut)
        //         if (shortcut) {
        //             shortcut.hasInstalled({
        //                 message: "保存桌面图标，进入游戏更快捷",
        //                 success: function (res) {
        //                     console.log('handling success:', res)
        //                     shortcut.install({ success: function () { console.log('handling success') } })
        //                 }, fail: function () {
        //                     console.log("handling fail")
        //                 }
        //             })
        //         }
        //     },
        //     fail: function (res) {
        //         console.log("mi login fail: ", res)
        //     }
        // })
    }

    pay(params: string, callBack: Function): void {
        console.log("mi pay not support")
    }

    private bannerShowing: boolean = false

    showBanner(position: BannerType): void {
        if (!sdkconfig.ycBannerId) {
            console.log('banner广告参数没有配置')
            return
        }
        let timeTag = Date.now()
        if (timeTag - this.lastBanner < 30 * 1000) {
            console.log("30秒内不得再次展示---banner")
            return
        }
        if (this.bannerShowing) {
            console.log("banner already showing")
            return
        }
        this.hideBanner()
        this.bannerShowing = true
        this.bannerAd = this.qg.createBannerAd({
            adUnitId: sdkconfig.ycBannerId,
            adIntervals: 35
            // style: {
            //     left: 0,
            //     top: 0,
            //     width: 1080
            // }
        })
        this.bannerAd.onLoad(() => {
            console.log("mi banner on load")
            this.bannerShowing = true
            YCSDK.ins.onLoad(AdType.Banner)
            YCSDK.ins.onShow(AdType.Banner)
        })
        this.bannerAd.onError((err) => {
            console.log("mi banner error: ", err)
            this.bannerShowing = false
            YCSDK.ins.onError(AdType.Banner)
        })
        this.bannerAd.onClose(() => {
            console.log("mi banner on close")
            this.bannerShowing = false
            this.lastBanner = Date.now()
            YCSDK.ins.onClose(AdType.Banner)
        })
        this.bannerAd.show()
        console.log("mi banner load")
    }

    hideBanner(): void {
        this.bannerShowing = false
        if (this.bannerAd) {
            this.bannerAd.hide()
            this.bannerAd.destroy()
            this.bannerAd = null
        }
    }

    showInters(type: InterstitialType): void {
        switch (type) {
            case InterstitialType.Initial:
            case InterstitialType.Video:
                this.showInitial()
                break
            case InterstitialType.Native:
                this.showNative()
                break
        }
    }

    showNative() {
        if (this.platformVersionCode < 1110) {
            console.log("platformVersionCode below 1110, current code: ", this.platformVersionCode)
            return
        }
        if (!sdkconfig.ycNativeId) {
            console.log('原生模板广告参数没有配置')
            return
        }
        let timeTag = Date.now()
        if (timeTag - this.lastNative < 30 * 1000) {
            console.log("30秒内不得再次展示---native")
            return
        }
        this.hideInters(InterstitialType.Native)
        this.customAd = this.qg.createCustomAd({
            adUnitId: sdkconfig.ycNativeId,
            style: {
                left: 0,
                top: 300,
                width: 1080
            }
        })
        this.customAd.onLoad(() => {
            console.log("mi native on load")
            YCSDK.ins.onLoad(AdType.Native)
        })
        this.customAd.onClose(() => {
            console.log("mi native on close")
            YCSDK.ins.onClose(AdType.Native)
            this.lastNative = Date.now()
        })
        this.customAd.onShow(() => {
            console.log("mi native show")
            YCSDK.ins.onShow(AdType.Native)
        })
        this.customAd.onError((err) => {
            console.log("mi native error: ", err)
            YCSDK.ins.onError(AdType.Native)
        })
        this.customAd.show()
    }

    showInitial() {
        if (!sdkconfig.ycIntersId) {
            console.log("插屏广告id未配置")
            return
        }
        let timeTag = Date.now()
        if (timeTag - this.lastInters < 30 * 1000) {
            console.log("30秒内不得再次展示---inters")
            return
        }
        let interstitialAd = this.qg.createInterstitialAd({
            adUnitId: sdkconfig.ycIntersId
        })
        interstitialAd.onLoad(() => {
            console.log("mi插屏广告加载成功")
            YCSDK.ins.onLoad(AdType.Inters)
            interstitialAd.show()
            YCSDK.ins.onShow(AdType.Inters)
        })
        interstitialAd.onClose(() => {
            console.log("mi innters on close")
            YCSDK.ins.onClose(AdType.Inters)
            this.lastInters = Date.now()
        })
        interstitialAd.onError((err) => {
            console.log("mi inters error: ", err)
            YCSDK.ins.onError(AdType.Inters)
            interstitialAd.destroy()
        })
    }

    hideInters(type: InterstitialType): void {
        if (this.customAd && type == InterstitialType.Native) {
            this.customAd.hide()
            this.customAd.destroy()
            this.customAd = null
        }
    }

    showVideo(callBack: Function): boolean {
        this.callback = callBack
        let timeTag = Date.now()
        if (timeTag - this.lastReward < 30 * 1000) {
            console.log("30秒内不得再次展示---video")
            this.callback && this.callback(false)
            return
        }
        this.loadVideo(true)
        return false
    }

    loadVideo(show): void {
        if (!sdkconfig.ycVideoId) {
            console.log('视频广告参数没有配置')
            this.callback && this.callback(false)
            this.callback = null
            return
        }
        if (this.rewardedVideoAd) {
            this.rewardedVideoAd = this.qg.createRewardedVideoAd({
                adUnitId: sdkconfig.ycVideoId
            })
            console.log("reload video, ad id: ", sdkconfig.ycVideoId)
            this.rewardedVideoAd.load()
            return
        }
        this.rewardedVideoAd = this.qg.createRewardedVideoAd({
            adUnitId: sdkconfig.ycVideoId
        })
        console.log("create video, ad id: ", sdkconfig.ycVideoId)
        this.rewardedVideoAd.onLoad(() => {
            console.log("mi video on load")
            YCSDK.ins.onLoad(AdType.Video)
            if (show) {
                setTimeout(() => {
                    this.rewardedVideoAd.show()
                    YCSDK.ins.onShow(AdType.Video)
                }, 100)
            }
        })
        this.rewardedVideoAd.onClose((isEnded) => {
            console.log("mi video on close: ", isEnded)
            this.lastReward = Date.now()
            YCSDK.ins.onClose(AdType.Video)
            if (isEnded.isEnded) {
                YCSDK.ins.onReward()
                this.callback && this.callback(isEnded.isEnded)
            } else {
                YCSDK.ins.onClose(AdType.Video, this.callback)
            }
        })
        this.rewardedVideoAd.onError((err) => {
            console.log("mi video error: ", err)
            YCSDK.ins.onError(AdType.Video)
        })
        this.rewardedVideoAd.load()
    }

    customFunc(methodName: string, params: any[], callBack: Function) {
        console.log("custom function name:", methodName)

    }

}