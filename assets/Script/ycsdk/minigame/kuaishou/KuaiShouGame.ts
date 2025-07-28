import { AdType } from "../../AdType";
import { GameInterface } from "../../GameInterface";
import { sdkconfig } from "../../SDKConfig";
import { YCSDK } from "../../YCSDK";
import { BannerType } from "../BannerType";
import { InterstitialType } from "../InterstitialType";

export class KuaiShouGame implements GameInterface {

    private bannerAd

    init(callBack?: any): void {
        callBack && callBack()
    }

    login(callBack?: Function): void {

    }

    pay(params: string, callBack: Function): void {

    }

    showBanner(position: BannerType): void {
        const ks = window['ks']
        const { screenWidth, screenHeight, windowWidth, windowHeight } = ks.getSystemInfoSync()
        this.bannerAd = ks.createBannerAd({ adUnitId: sdkconfig.ycBannerId, adIntervals: 30, style: { left: 0, top: 0, width: screenWidth, height: 100 } })
        this.bannerAd.onResize((size) => {
            console.log("ks banner on resize:", size.width, size.height)
            this.bannerAd.top = screenHeight - size.height
        })
        this.bannerAd.onClose(() => {
            console.log("ks banner close")
            YCSDK.ins.onClose(AdType.Banner)
        })
        this.bannerAd.onError((err) => {
            console.log("ks banner on error", err)
            console.log("ks banner on error", JSON.parse(err))
            YCSDK.ins.onError(AdType.Banner)
        })
        this.bannerAd.onLoad(() => {
            console.log("ks banner on load")
            YCSDK.ins.onLoad(AdType.Banner)
        })
        this.bannerAd.show().then(() => {
            console.log("ks banner on show")
            YCSDK.ins.onShow(AdType.Banner)
        }).catch((err) => {
            console.log("ks banner show fail:", err)
        })
    }

    hideBanner(): void {
        if (this.bannerAd) {
            this.bannerAd.hide()
        }
    }

    showInters(type: InterstitialType): void {
        const ks = window['ks']
        let interstitialAd = ks.createInterstitialAd({ adUnitId: sdkconfig.ycIntersId })
        if (interstitialAd) {
            interstitialAd.onClose(() => {
                // 插屏广告关闭事件
                interstitialAd.destroy()
                YCSDK.ins.onClose(AdType.Inters)
            })
            interstitialAd.onError(res => {
                // 插屏广告Error事件
                console.log('ks inters error: ', res)
                console.log('ks inters error: ', JSON.parse(res))
                YCSDK.ins.onError(AdType.Inters)
            })
            let p = interstitialAd.show()
            p.then(function (result) {
                // 插屏广告展示成功  
                console.log(`show interstitial ad success, result is ${result}`)
                YCSDK.ins.onShow(AdType.Inters)
            }).catch(function (error) {
                // 插屏广告展示失败  
                console.log(`show interstitial ad failed, error is ${error}`)
                if (error.code === -10005) {
                    // 表明当前app版本不支持插屏广告，可以提醒用户升级app版本  
                }
            })
        } else {
            console.log("创建插屏广告组件失败")
            YCSDK.ins.onError(AdType.Inters)
        }
    }

    hideInters(type: InterstitialType): void {

    }

    showVideo(callBack: Function): boolean {
        const ks = window['ks']
        let rewardedVideoAd = ks.createRewardedVideoAd({ adUnitId: sdkconfig.ycVideoId });
        if (rewardedVideoAd) {
            rewardedVideoAd.onClose(res => {
                YCSDK.ins.onClose(AdType.Video)
                // 用户点击了【关闭广告】按钮  
                if (res && res.isEnded) {
                    // 正常播放结束，可以下发游戏奖励
                    callBack && callBack(true)
                    YCSDK.ins.onReward()
                }
                else {
                    // 播放中途退出，不下发游戏奖励  
                    callBack && callBack(false)
                }
            })
            rewardedVideoAd.onError(res => {
                // 激励视频广告Error事件
                console.log("ks video error: ", res)
                YCSDK.ins.onError(AdType.Video)
                callBack && callBack(false)
            })
            let p = rewardedVideoAd.show()
            p.then(function (result) {
                // 激励视频展示成功  
                YCSDK.ins.onShow(AdType.Video)
                console.log(`ks show rewarded video ad success, result is ${result}`)
            }).catch(function (error) {
                // 激励视频展示失败
                console.log(`ks show rewarded video ad failed, error is ${error}`)
            })
        } else {
            console.log("创建激励视频组件失败")
            YCSDK.ins.onError(AdType.Video)
            callBack && callBack(false)
        }
        return false
    }

    customFunc(methodName: string, params: any[], callBack: Function) {

    }

}