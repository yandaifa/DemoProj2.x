import { AdType } from "../../AdType";
import { GameInterface } from "../../GameInterface";
import { sdkconfig } from "../../SDKConfig";
import { YCSDK } from "../../YCSDK";
import { BannerType } from "../BannerType";
import { InterstitialType } from "../InterstitialType";

export class VivoGame implements GameInterface {

    private qg = window['qg']
    private bannerAd
    private customAd
    private rewardedAd
    private callback
    private platformVersionCode
    private boxBannerAd
    private boxPortalAd
    private bannerShowing = false

    init(): void {
        this.platformVersionCode = this.qg.getSystemInfoSync().platformVersionCode
        console.log("vivo platformVersionCode: ", this.platformVersionCode)
    }

    login(callBack?: Function): void {

    }

    pay(params: string, callBack: Function): void {

    }

    showBanner(position: BannerType): void {
        if (this.platformVersionCode < 1031) {
            console.log("platformVersionCode below 1031, can't show banner")
            return
        }
        if (!sdkconfig.ycBannerId) {
            console.log('banner广告参数没有配置')
            return
        }
        if (this.bannerShowing ) {
            console.log("banner广告展示中")
            return
        }
        this.hideBanner()
        this.bannerShowing = true
        this.bannerAd = this.qg.createBannerAd({
            posId: sdkconfig.ycBannerId,
            adIntervals: 35,
            style: {

            }
        })
        this.bannerAd.onLoad(() => {
            console.log("banner load")
            this.bannerShowing = true
            YCSDK.ins.onLoad(AdType.Banner)
        })
        this.bannerAd.onClose(() => {
            console.log("banner close")
            this.bannerShowing = false
            YCSDK.ins.onClose(AdType.Banner)
        })
        this.bannerAd.onError(err => {
            console.log("banner广告加载失败:", err)
            this.bannerShowing = false
            YCSDK.ins.onError(AdType.Banner)
        })
        this.bannerAd.show().then(() => {
            console.log('banner广告展示完成')
            YCSDK.ins.onShow(AdType.Banner)
            this.bannerShowing = true
        }).catch((err) => {
            this.bannerShowing = false
            console.log('banner广告展示失败:', JSON.stringify(err))
            YCSDK.ins.onError(AdType.Banner)
        })
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
            case InterstitialType.Native:
                this.showNative()
                break
            case InterstitialType.Initial:
            case InterstitialType.Video:
                this.showInitial()
                break
        }
    }

    showInitial() {
        if (this.platformVersionCode < 1031) {
            console.log("platformVersionCode below 1031, can't show interstitialAd")
            return
        }
        if (!sdkconfig.ycIntersId) {
            console.log("插屏广告id未配置")
            return
        }
        let interstitialAd = this.qg.createInterstitialAd({
            posId: sdkconfig.ycIntersId
        })
        interstitialAd.onError(err => {
            console.log("插屏广告加载失败", err)
            YCSDK.ins.onError(AdType.Inters)
        })
        interstitialAd.onLoad(() => {
            console.log("插屏广告加载成功")
            YCSDK.ins.onLoad(AdType.Inters)
        })
        interstitialAd.onClose(() => {
            console.log("插屏广告关闭")
            YCSDK.ins.onClose(AdType.Inters)
        })
        interstitialAd.show().then(() => {
            console.log('插屏广告展示完成')
            YCSDK.ins.onShow(AdType.Inters)
        }).catch((err) => {
            console.log('插屏广告展示失败', JSON.stringify(err))
            YCSDK.ins.onError(AdType.Inters)
        })
    }

    hideNative() {
        if (this.customAd) {
            this.customAd.hide()
            this.customAd.destroy()
            this.customAd = null
        }
    }

    showNative() {
        if (this.platformVersionCode < 1091) {
            console.log("platformVersionCode below 1091, can't show custom ad")
            return
        }
        if (!sdkconfig.ycNativeId) {
            console.log('原生模板广告参数没有配置')
            return
        }
        if (this.customAd && this.customAd.isShow()) {
            console.log("native ad is show ing")
            this.hideNative()
        }
        this.customAd = this.qg.createCustomAd({
            posId: sdkconfig.ycNativeId,
            style: {
                width: cc.winSize.width,
                gravity: "center"
            }
        })
        this.customAd.onClose(() => {
            console.log("原生模板广告关闭close")
            YCSDK.ins.onClose(AdType.Native)
        })
        this.customAd.onHide(() => {
            console.log("原生模板广告关闭hide")
            YCSDK.ins.onClose(AdType.Native)
        })
        this.customAd.onLoad(() => {
            console.log("原生模板广告加载成功")
            YCSDK.ins.onLoad(AdType.Native)
        })
        this.customAd.onError(err => {
            console.log("原生模板广告加载失败", err)
            YCSDK.ins.onError(AdType.Native)
        })
        this.customAd.show().then(() => {
            console.log('原生模板广告展示完成')
            YCSDK.ins.onShow(AdType.Native)
        }).catch((err) => {
            console.log('原生模板广告展示失败', JSON.stringify(err))
            YCSDK.ins.onError(AdType.Native)
        })
    }

    hideInters(type: InterstitialType): void {
        this.hideNative()
    }

    showVideo(callBack: Function): boolean {
        this.callback = callBack
        if (this.rewardedAd) {
            this.rewardedAd.load()
        } else {
            this.loadVideo()
        }
        return false
    }

    loadVideo() {
        if (this.platformVersionCode < 1041) {
            console.log("platformVersionCode below 1041, can't show video ad")
            return
        }
        if (!sdkconfig.ycVideoId) {
            console.log('激励视频广告参数没有配置')
            return
        }
        this.rewardedAd = this.qg.createRewardedVideoAd({
            posId: sdkconfig.ycVideoId
        })
        this.rewardedAd.onLoad(res => {
            if (res == 'localAdVideo') {
                console.log('激励视频 兜底广告-onload触发 ', res);
            } else {
                console.log('激励视频广告加载完成-onload触发 ', res);
            }
            YCSDK.ins.onLoad(AdType.Video)
            this.rewardedAd.show().then(() => {
                console.log('激励视频广告展示完成')
                YCSDK.ins.onShow(AdType.Video)
            }).catch((err) => {
                console.log('激励视频广告展示失败', JSON.stringify(err))
                this.callback && this.callback(false)
                this.showNative()
                YCSDK.ins.onError(AdType.Video)
            })
        })
        this.rewardedAd.onError(err => {
            console.log("激励视频广告加载失败: ", JSON.stringify(err))
            this.callback && this.callback(false)
            YCSDK.ins.onError(AdType.Video)
        })
        this.rewardedAd.onClose((res) => {
            console.log("激励视频关闭")
            YCSDK.ins.onClose(AdType.Video)
            if (res && res.isEnded) {
                console.log("正常播放结束，可以下发游戏奖励")
                this.callback && this.callback(true)
                YCSDK.ins.onReward()
            } else {
                YCSDK.ins.onClose(AdType.Video, this.callback)
                console.log("播放中途退出，不下发游戏奖励")
            }
        })
        // this.rewardedAd.load()
    }

    customFunc(methodName: string, params: any[], callBack: Function) {
        
    }
}
