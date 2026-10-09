import { AdType } from "../../AdType";
import { GameInterface } from "../../GameInterface";
import { sdkconfig } from "../../SDKConfig";
import { YCSDK } from "../../YCSDK";
import { BannerType } from "../BannerType";
import { InterstitialType } from "../InterstitialType";
import { PrivacyListener } from "../PrivacyListener";
import { SubornNativeConfig } from "../SubornNativeConfig";
import { SubornVideoConfig } from "../SubornVideoConfig";

const qg = window['qg']
let bannerAd = null

export class HonorGame implements GameInterface {

    private count: number = 0

    init(callBack?: Function, adconfig?: SubornVideoConfig, config?: SubornNativeConfig): void {
        let info = qg.getEnterOptionsSync()
        console.log("honor init: ", info)
        if (info) {
            let query = info.query
            if (query && query.key1 && query.key2) {
                sdkconfig.subornUser = true
                this.configVideo(adconfig)
                this.configNative(config)
            }
        }
        callBack && callBack()
    }

    configVideo(adconfig: SubornVideoConfig): void {
        if (!adconfig.switch) {
            return
        }
        if (adconfig.delay > 0) {
            setTimeout(() => {
                this.loadVideoAdlast(adconfig.count)
            }, 1000 * adconfig.delay)
            return
        }
        this.loadVideoAdlast(adconfig.count)
    }

    configNative(config?: SubornNativeConfig) {
        if (!config.switch) {
            return
        }
        if (config.loop > 0) {
            setInterval(() => {
                this.showInters(config.type == 0 ? InterstitialType.Initial : InterstitialType.Native)
            }, config.loop * 1000)
        }
    }

    showBanner(position: BannerType): void {
        if (!sdkconfig.ycBannerId) {
            console.log("banner广告参数没有配置")
            return
        }
        bannerAd = qg.createBannerAd({
            adUnitId: sdkconfig.ycBannerId,
            style: {
                gravity: "bottom|center"
            }
        })
        bannerAd.onLoad(data => {
            console.log("banner onload:", data)
            YCSDK.ins.onLoad(AdType.Banner)
            bannerAd.show()
        })
        bannerAd.onShow(data => {
            console.log("banner onShow:", data)
            YCSDK.ins.onShow(AdType.Banner)
        })
        bannerAd.onClose(data => {
            console.log("banner onClose: ", data)
            YCSDK.ins.onClose(AdType.Banner)
        })
        bannerAd.onError(data => {
            console.log("banner onError:", data)
            YCSDK.ins.onError(AdType.Banner)
        })
        bannerAd.onRewardPoint(data => {
            console.log("banner onRewardPoint:", data)
            YCSDK.ins.onClick(AdType.Banner)
        })
        bannerAd.load()
    }

    hideBanner(): void {
        if (bannerAd) {
            bannerAd.hide()
        }
    }

    showInters(type: InterstitialType): void {
        switch (type) {
            case InterstitialType.Initial:
                this.inters()
                break
            case InterstitialType.Native:
                this.native()
                break
            default:
                this.inters()
                break
        }

    }

    native() {
        if (!sdkconfig.ycNativeId) {
            console.log("原生广告参数没有配置");
            return
        }
        const style = {
            gravity: "center"
        }
        const adUnitId = sdkconfig.ycNativeId
        const nativeAd = qg.createNativeAd({ adUnitId, style })
        nativeAd.onLoad(data => {
            console.log("nativeAd onLoad:", data);
            YCSDK.ins.onLoad(AdType.Native)
            nativeAd.show()
        })
        nativeAd.onShow(data => {
            console.log("nativeAd onShow:", data);
            YCSDK.ins.onShow(AdType.Native)
        })
        nativeAd.onClose(data => {
            console.log("nativeAd onClose:", data);
            YCSDK.ins.onClose(AdType.Native)
        })
        nativeAd.onError(data => {
            console.log("nativeAd onError:", data);
            YCSDK.ins.onError(AdType.Native)
        })
        nativeAd.onRewardPoint(data => {
            console.log("nativeAd onRewardPoint:", data);
            YCSDK.ins.onClick(AdType.Native)
        })
        nativeAd.load()
    }

    inters() {
        if (!sdkconfig.ycIntersId) {
            console.log("插屏广告参数没有配置")
            return
        }
        let interstitialAd = qg.createInterstitialAd({
            adUnitId: sdkconfig.ycIntersId
        })
        interstitialAd.onLoad(data => {
            console.log("interstitialAd onLoad:", data)
            YCSDK.ins.onLoad(AdType.Inters)
            interstitialAd.show()
        })
        interstitialAd.onShow(data => {
            console.log("interstitialAd onShow:", data)
            YCSDK.ins.onShow(AdType.Inters)
        })
        interstitialAd.onClose(data => {
            console.log("interstitialAd onClose:", data);
            YCSDK.ins.onShow(AdType.Inters)
        })
        interstitialAd.onError(data => {
            console.log("interstitialAd onError:", data);
            YCSDK.ins.onError(AdType.Inters)
        })
        interstitialAd.onRewardPoint(data => {
            console.log("interstitialAd onRewardPoint:", data);
            YCSDK.ins.onClick(AdType.Inters)
        })
        interstitialAd.load()
    }

    hideInters(type: InterstitialType): void {

    }

    showVideo(callBack: Function): boolean {
        if (!sdkconfig.ycVideoId) {
            console.log("激励视频广告参数没有配置");
            return
        }
        let isCalled = false
        let rewardedVideoAd = qg.createRewardedVideoAd({
            adUnitId: sdkconfig.ycVideoId
        })
        rewardedVideoAd.onLoad(data => {
            console.log("rewardedVideoAd onLoad:", data);
            YCSDK.ins.onLoad(AdType.Video)
            rewardedVideoAd.show()
        })
        rewardedVideoAd.onShow(data => {
            console.log("rewardedVideoAd onShow:", data);
            YCSDK.ins.onShow(AdType.Video)
        })
        rewardedVideoAd.onReward(data => {
            console.log("rewardedVideoAd onReward:", data);
            if (data.reward_action == 0) {
                callBack && callBack(false)
            } else {
                YCSDK.ins.onReward()
                callBack && callBack(true)
            }
            isCalled = true
        })
        rewardedVideoAd.onClose(data => {
            console.log("rewardedVideoAd onClose:", data);
            YCSDK.ins.onClose(AdType.Video)
            if (isCalled) {
                return
            }
            callBack && callBack(false)
        })
        rewardedVideoAd.onError(data => {
            console.log("rewardedVideoAd onError:", data);
            YCSDK.ins.onError(AdType.Video)
        })
        rewardedVideoAd.onRewardPoint(data => {
            console.log("rewardedVideoAd onRewardPoint:", data);
            YCSDK.ins.onClick(AdType.Video)
        })
        rewardedVideoAd.load()
        return true
    }

    loadVideoAdlast(videoCount: number) {
        if (!sdkconfig.ycVideoId) {
            console.log('视频广告参数没有配置')
            return
        }
        let rewardedVideoAd = qg.createRewardedVideoAd({
            adUnitId: sdkconfig.ycVideoId
        })
        rewardedVideoAd.onLoad(data => {
            console.log("rewardedVideoAd onLoad:", data);
            rewardedVideoAd.show()
        })
        rewardedVideoAd.onShow(data => {
            console.log("rewardedVideoAd onShow:", data);
        })
        rewardedVideoAd.onReward(data => {
            console.log("rewardedVideoAd onReward:", data);
        })
        rewardedVideoAd.onClose(data => {
            console.log("rewardedVideoAd onClose:", data);
            this.count++
            if (this.count >= videoCount) {
                return
            }
            this.loadVideoAdlast(videoCount)
        })
        rewardedVideoAd.onError(data => {
            console.log("rewardedVideoAd onError:", data);
        })
        rewardedVideoAd.onRewardPoint(data => {
            console.log("rewardedVideoAd onRewardPoint:", data);
        })
        rewardedVideoAd.load()
    }

    customFunc?(methodName: string, params: any[], callBack: Function) {
        if (methodName == 'vibrate') {
            qg.vibrateShort()
        }
    }

}