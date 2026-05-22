import { AdType } from "../../AdType";
import { GameInterface } from "../../GameInterface";
import { sdkconfig } from "../../SDKConfig";
import { YCSDK } from "../../YCSDK";
import { BannerType } from "../BannerType";
import { InterstitialType } from "../InterstitialType";

export class WeChatGame implements GameInterface {

    constructor(){
        console.log('current platfrom is wechat')
    }

    private wx = window['wx']
    private bannerAd

    init(callBack?: any): void {
        callBack && callBack()
    }

    login(callBack?: Function): void {

    }

    pay(params: string, callBack: Function): void {

    }

    showBanner(position: BannerType): void {
        if (this.bannerAd) {
            this.bannerAd.destroy()
            this.bannerAd = null
        }
        const { screenWidth, screenHeight } = this.wx.getSystemInfoSync()
        this.bannerAd = this.wx.createBannerAd({
            adUnitId: sdkconfig.ycBannerId,
            style: {
                left: 0,
                top: 0,
                width: screenWidth
            }
        })
        this.bannerAd.onResize((size) => {
            this.bannerAd.style.top = screenHeight - size.height
        })
        this.bannerAd.onLoad(() => {
            console.log('banner 广告加载成功')
            YCSDK.ins.onLoad(AdType.Banner)
            YCSDK.ins.onShow(AdType.Banner)
        })
        this.bannerAd.onError(err => {
            console.log('banner 广告加载失败:', err)
            YCSDK.ins.onError(AdType.Banner)
            this.showNativeBanner()
        })
        this.bannerAd.show()
    }

    showNativeBanner() {
        const { screenWidth, screenHeight } = this.wx.getSystemInfoSync()
        const customAd = this.wx.createCustomAd({
            adUnitId: sdkconfig.ycNativeId,
            style: {
                left: (screenWidth - 360) / 2,
                top: screenHeight - 106,
                width: 360,
                height: 106
            }
        })
        customAd.onResize((res) => {
            console.log('on resize:', res)
            customAd.style.top = screenHeight - res.height
            customAd.style.left = (screenWidth - res.width) / 2
        })
        customAd.onLoad(() => {
            console.log('原生模板广告加载成功')
            YCSDK.ins.onLoad(AdType.Native)
        })
        customAd.onError(err => {
            console.log('原生广告加载失败', err)
            YCSDK.ins.onError(AdType.Native)
        })
        customAd.onClose(() => {
            console.log('原生模板广告关闭')
            YCSDK.ins.onClose(AdType.Native)
        })
        customAd.show().then(() => {
            console.log('原生模板广告显示')
            YCSDK.ins.onShow(AdType.Native)
        })
    }

    hideBanner(): void {
        if (this.bannerAd) {
            this.bannerAd.hide()
            this.bannerAd.destroy()
            this.bannerAd = null
        }
    }

    showInters(type: InterstitialType): void {
        let interstitialAd = this.wx.createInterstitialAd({ adUnitId: sdkconfig.ycIntersId })
        interstitialAd.onLoad(() => {
            console.log('插屏 广告加载成功')
            YCSDK.ins.onLoad(AdType.Inters)
            YCSDK.ins.onShow(AdType.Inters)
        })
        interstitialAd.onError(err => {
            console.log('插屏广告加载失败：', err)
            YCSDK.ins.onError(AdType.Inters)
        })
        interstitialAd.onClose(res => {
            console.log('插屏 广告关闭')
            YCSDK.ins.onClose(AdType.Inters)
        })
        interstitialAd.show().catch((err) => {
            console.error('插屏广告展示失败：', err)
            YCSDK.ins.onError(AdType.Inters)
        })
    }

    hideInters(type: InterstitialType): void {

    }

    showVideo(callBack: Function): boolean {
        let rewardedVideoAd = this.wx.createRewardedVideoAd({ adUnitId: sdkconfig.ycVideoId })
        rewardedVideoAd.onLoad(() => {
            console.log('激励视频 广告加载成功')
            YCSDK.ins.onLoad(AdType.Video)
        })
        rewardedVideoAd.onError(err => {
            console.log('激励视频 广告加载失败：', err)
            YCSDK.ins.onError(AdType.Video, callBack)
        })
        rewardedVideoAd.onClose(res => {
            YCSDK.ins.onClose(AdType.Video)
            if (res && res.isEnded || res === undefined) {
                // 正常播放结束，可以下发游戏奖励
                YCSDK.ins.onReward()
                callBack && callBack(true)
            } else {
                callBack && callBack(false)
            }
        })
        rewardedVideoAd.show()
            .catch(err => {
                rewardedVideoAd.load()
                    .then(() => {
                        rewardedVideoAd.show()
                        YCSDK.ins.onShow(AdType.Video)
                    })
            })
        return false
    }

    customFunc(methodName: string, params: any[], callBack: Function) {
        console.log("custom func method name : ", methodName, " parmas: ", params)
        // 创建 原生模板 广告实例，提前初始化
        // const { screenWidth, screenHeight } = this.wx.getSystemInfoSync()
        // let CustomAd = this.wx.createCustomAd({
        //     adUnitId: sdkconfig.ycBigPicId,
        //     style: {
        //         left: 0,
        //         top: (screenHeight - screenWidth) / 2,
        //         width: screenWidth
        //     }
        // })
        // CustomAd.onResize((res) => {
        //     console.log('on resize:', res)
        //     CustomAd.style.top = screenHeight - res.height
        //     CustomAd.style.left = (screenWidth - res.width) / 2
        // })
        // CustomAd.onError(err => {
        //     console.error('矩阵广告加载失败：', err.errMsg)
        // })
        // // 在适合的场景显示 原生模板 广告
        // CustomAd.show()
        if (methodName == 'vibrate') {
            if (params && params[0] == 'long') {
                this.wx.vibrateLong()
            } else {
                this.wx.vibrateShort('medium')
            }
        }

    }

}