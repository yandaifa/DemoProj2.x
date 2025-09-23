import { AdType } from "../../AdType";
import { GameInterface } from "../../GameInterface";
import { sdkconfig } from "../../SDKConfig";
import { YCSDK } from "../../YCSDK";
import { BannerType } from "../BannerType";
import { InterstitialType } from "../InterstitialType";

export class DouYinGame implements GameInterface {

    private bannerAd = null
    private videoAd = null
    private callBack: Function = null

    init(): void {
        this.initViedoAd(false)
    }

    login(callBack?: Function): void {
    }

    pay(params: string, callBack: Function): void {
    }

    showBanner(position: BannerType): void {
        if (!sdkconfig.open) {
            console.log("广告未开启")
            return
        }
        this.hideBanner()
        this.bannerAd = window['tt'].createBannerAd({
            adUnitId: sdkconfig.ycBannerId,
        });
        this.bannerAd.onLoad(() => {
            YCSDK.ins.onLoad(AdType.Banner)
            this.bannerAd.show().then(() => {
                YCSDK.ins.onLoad(AdType.Banner)
                YCSDK.ins.onShow(AdType.Banner)
                console.log("广告显示成功")
            }).catch((err) => {
                YCSDK.ins.onError(AdType.Banner)
                console.log("广告组件出现问题", err)
            })
        })
        this.bannerAd.onError(({ errorCode, errMsg }) => {
            YCSDK.ins.onError(AdType.Banner)
            console.log(errorCode, errMsg)
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
        const interstitialAd = window['tt'].createInterstitialAd({
            adUnitId: sdkconfig.ycIntersId,
        });
        interstitialAd.onLoad(() => {
            console.log('interstitialAd load')
            YCSDK.ins.onLoad(AdType.Inters)
            interstitialAd.show()
            YCSDK.ins.onShow(AdType.Inters)
        })

        interstitialAd.onError(({ errCode, errMsg }) => {
            YCSDK.ins.onError(AdType.Inters)
            console.log('监听到错误', errCode, errMsg)
        })
        interstitialAd.onClose(() => {
            console.log("interstitialAd on close")
            interstitialAd.destroy()
            YCSDK.ins.onClose(AdType.Inters)
        })
        interstitialAd.load()
        // interstitialAd.load().then(() => {
        //     interstitialAd.show().then(() => {
        //         YCSDK.ins.onShow(AdType.Inters)
        //         console.log("插屏广告展示成功")
        //     })
        // }).catch((err) => {
        //     YCSDK.ins.onError(AdType.Inters)
        //     console.log(err)
        // })
    }

    hideInters(type: InterstitialType): void {
    }

    initViedoAd(show): void {
        this.videoAd = window['tt'].createRewardedVideoAd({
            adUnitId: sdkconfig.ycVideoId,
        })
        this.videoAd.onLoad(() => {
            YCSDK.ins.onLoad(AdType.Video)
            console.log("广告加载完成")
        })
        this.videoAd.onError((errMsg) => {
            YCSDK.ins.onError(AdType.Video)
            console.log("广告加载失败", errMsg)
        })
        this.videoAd.onClose((res) => {
            if (res && res.isEnded || res === undefined) {
                console.log("广告播放完成")
                this.callBack && this.callBack(true)
            } else {
                console.log("广告播放未完成")
                this.callBack && this.callBack(false)
            }
        })
        if (show) {
            this.videoAd.load()
                .then(() => {
                    this.videoAd.show()
                        .then(() => {
                            YCSDK.ins.onShow(AdType.Video)
                            console.log("激励视频广告展示成功")
                        })
                        .catch((err) => {
                            YCSDK.ins.onError(AdType.Video)
                            console.log("激励视频广告展示失败", err)
                        })
                })
        } else {
            this.videoAd.load()
        }
    }

    showVideo(callBack: Function): boolean {
        this.callBack = callBack
        if (!sdkconfig.ycVideoId) {
            console.log("请配置激励视频广告ID")
            callBack && callBack(false)
            YCSDK.ins.onError(AdType.Video)
            return false
        }
        if (this.videoAd) {
            this.videoAd.show()
                .then(() => {
                    YCSDK.ins.onShow(AdType.Video)
                    console.log("激励视频广告展示成功")
                })
                .catch((err) => {
                    YCSDK.ins.onError(AdType.Video)
                    console.log("激励视频广告展示失败", err)
                })
            return true
        }
        this.initViedoAd(true)
        return false
    }

    customFunc(methodName: string, params: any[], callBack: Function) {
        if (methodName == 'vibrate') {
            window['tt'].vibrateShort({
                success(res) {
                    console.log(`${res}`);
                },
                fail(res) {
                    console.log(`vibrateShort调用失败`);
                },
            });
        }
    }

}