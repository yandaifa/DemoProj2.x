import { AdType } from "../../AdType"
import { GameInterface } from "../../GameInterface"
import { sdkconfig } from "../../SDKConfig"
import { YCSDK } from "../../YCSDK"
import { BannerType } from "../BannerType"
import { InterstitialType } from "../InterstitialType"

export class OppoGame implements GameInterface {

    private qg = window['qg']
    private bannerAd
    private nativeAd
    private count: number = 0

    constructor() {
        console.log("current channel is oppo")
    }

    init(callback?): void {
        if (sdkconfig.subornUserTest) {
            sdkconfig.subornUser = true
            this.config()
            callback && callback()
            return
        }
        const info = this.qg.getEnterOptionsSync()
        console.log("oppo init: ", info)
        if (info) {
            const type = info.type
            const query = info.query
            const referrerInfo = info.referrerInfo
            if (query && query.key1 && query.key2) {
                sdkconfig.subornUser = true
                this.config()
            }
        }
        callback && callback()
    }

    config(): void {
        this.loadVideoAdlast()
    }

    login(callBack?: Function): void {

    }

    pay(params: string, callBack: Function): void {

    }

    showBanner(position: BannerType = BannerType.Bottom): void {
        if (!sdkconfig.ycBannerId) {
            console.log('banner广告参数没有配置')
            return
        }
        if (position == BannerType.Native) {
            this.showNativeBanner()
            return
        }
        this.hideBanner()
        this.createBannerAd(position)
    }

    createBannerAd(position: BannerType) {
        // const params = { adUnitId: sdkconfig.ycBannerId, style: position == BannerType.Top ? { top: 0, left: 0 } : {} }
        if (this.bannerAd) {
            this.bannerAd.destroy()
            this.bannerAd = null
        }
        this.bannerAd = this.qg.createBannerAd({ adUnitId: sdkconfig.ycBannerId })
        this.bannerAd.onResize((obj) => {
            console.log("banner 宽度：" + obj.width + ", banner 高度：" + obj.height)
        })
        this.bannerAd.onLoad(() => {
            console.log('[Banner广告] 广告加载成功')
            YCSDK.ins.onLoad(AdType.Banner)
            YCSDK.ins.onShow(AdType.Banner)
        })
        this.bannerAd.onHide(() => {
            console.log("banner广告隐藏")
            YCSDK.ins.onClose(AdType.Banner)
            if (this.bannerAd) {
                this.bannerAd.destroy()
                this.bannerAd = null
            }
            this.refreshBanner()
        })
        this.bannerAd.onError(err => {
            console.log("banner错误监听: ", JSON.stringify(err))
            if (this.bannerAd) {
                this.bannerAd.destroy()
                this.bannerAd = null
            }
            if (!sdkconfig.nativeBannerId || sdkconfig.nativeBannerId.length <= 0) {
                YCSDK.ins.onError(AdType.Banner)
                return
            }
            YCSDK.ins.onLoad(AdType.Banner)
            this.showNativeBanner()
        })
        this.bannerAd.onClick(obj => {
            console.log(`开启Banner广告点击回调: code: ${obj.code},msg: '${obj.msg}'`)
        })
        this.bannerAd.show()
    }

    hideBanner(): void {
        console.log("oppo hide banner")
        if (this.bannerAd) {
            this.bannerAd.hide()
        }
    }

    private timerBanner

    private refreshBanner() {
        if (this.timerBanner) {
            clearTimeout(this.timerBanner)
            this.timerBanner = 0
        }
        this.timerBanner = setTimeout(() => {
            this.createBannerAd(BannerType.Normal)
        }, 30 * 1000)
    }

    showInters(type: InterstitialType = InterstitialType.Initial): void {
        if (!type) {
            this.showInitialType()
            return
        }
        switch (type) {
            case InterstitialType.Initial:
                this.showInitialType()
                break
            case InterstitialType.Native:
                this.showNativeType()
                break
            case InterstitialType.Video:
                this.showVideo(() => {
                    console.log("oppo video ad show success")
                })
                break
        }
    }

    showInitialType() {
        if (!sdkconfig.ycIntersId) {
            console.log("插屏广告id未配置")
            return
        }
        if (this.qg.getSystemInfoSync().platformVersionCode < 1061) {
            console.log("快应用平台版本号低于1061,暂不支持插屏广告相关 API")
            return
        }
        var interstitialAd = this.qg.createInterstitialAd({
            adUnitId: sdkconfig.ycIntersId,
        })
        interstitialAd.onLoad(function () {
            console.log('插屏广告加载成功')
            YCSDK.ins.onLoad(AdType.Inters)
            interstitialAd.show()
        })
        interstitialAd.onClose(function () {
            console.log('插屏广告关闭')
            YCSDK.ins.onClose(AdType.Inters)
        })
        interstitialAd.onError(function (err) {
            console.log("插屏广告出错: ", err)
            interstitialAd.destroy()
            interstitialAd = null
            YCSDK.ins.onError(AdType.Inters)
        })
        interstitialAd.load()
    }

    showNativeType() {
        if (!sdkconfig.ycNativeId) {
            console.log('原生模板广告参数没有配置')
            return
        }
        const { windowHeight, windowWidth, platformVersionCode, screenWidth, screenHeight } = this.qg.getSystemInfoSync()
        if (platformVersionCode < 1094) {
            console.log("快应用平台版本号低于1094,暂不支持原生模板广告相关API")
            return
        }
        if (this.nativeAd) {
            this.nativeAd.destroy()
            this.nativeAd = null
        }
        let style
        if (YCSDK.ins.vertical()) {
            style = {
                top: windowHeight * 0.4,
                left: (windowWidth - windowWidth * 0.6) / 2,
                width: windowWidth * 0.6,
            }
        } else {
            style = {
                top: 0,
                left: screenWidth / 2 - screenHeight / 2,
                width: screenWidth,
            }
        }
        this.nativeAd = this.qg.createCustomAd({
            adUnitId: sdkconfig.ycNativeId,
            style: style
        })
        this.nativeAd.onLoad(() => {
            console.log('[原生模板广告] 广告加载成功')
            YCSDK.ins.onLoad(AdType.Native)
        })
        this.nativeAd.onClick((obj) => {
            console.log(`原生模板广告点击回调: code: ${obj.code},msg: '${obj.msg}'`);
            YCSDK.ins.onClick(AdType.Native)
        })
        this.nativeAd.onHide(() => {
            console.log("原生模板广告隐藏")
            if (this.nativeAd) {
                this.nativeAd.destroy()
                this.nativeAd = null
            }
            YCSDK.ins.onClose(AdType.Native)
        })
        this.nativeAd.onError(err => {
            console.log("原生模板广告错误监听：", JSON.stringify(err))
            if (this.nativeAd) {
                this.nativeAd.destroy()
                this.nativeAd = null
            }
            YCSDK.ins.onError(AdType.Native)
        })
        this.nativeAd.show().then(() => {
            console.log('原生模板广告promise 回调：展示成功')
            YCSDK.ins.onShow(AdType.Native)
        }).catch(err => {
            console.log(`原生模板广告promise 回调：展示失败 ${JSON.stringify(err)}`)
        })
    }

    hideInters(type: InterstitialType): void {
        if (type = InterstitialType.Native) {
            if (!!this.nativeAd) {
                this.nativeAd.hide()
            }
        }
    }

    showVideo(callBack: Function): boolean {
        console.log("oppo video ad start show")
        this.loadVideoAd(callBack)
        return false
    }

    loadVideoAd(videoCallBack) {
        if (!sdkconfig.ycVideoId) {
            console.log('视频广告参数没有配置')
            videoCallBack && videoCallBack(false)
            return
        }
        const videoAd = this.qg.createRewardedVideoAd({
            adUnitId: sdkconfig.ycVideoId
        })
        videoAd.onLoad(() => {
            console.log("oppo video load success")
            YCSDK.ins.onLoad(AdType.Video)
            videoAd.show()
            YCSDK.ins.onShow(AdType.Video)
        })
        videoAd.onError(err => {
            console.log('onError:' + JSON.stringify(err))
            videoAd.destroy()
            YCSDK.ins.onError(AdType.Video, videoCallBack)
        })
        videoAd.onClick(function (obj) {
            console.log(`on click: code: ${obj.code}, msg: '${obj.msg}'`)
            YCSDK.ins.onClick(AdType.Video)
        })
        videoAd.onClose((res) => {
            YCSDK.ins.onClose(AdType.Video)
            console.log('==> oppoRewardVideoAd onClose', res)
            if (res == undefined) {
                videoCallBack && videoCallBack(true)
                YCSDK.ins.onReward()
            } else {
                if (res.isEnded) {
                    videoCallBack && videoCallBack(true)
                    YCSDK.ins.onReward()
                } else {
                    console.log('广告没看完')
                    videoCallBack && videoCallBack(false)
                }
            }
        })
        videoAd.load()
    }

    loadVideoAdNoCallBack(later) {
        if (!sdkconfig.ycVideoId) {
            console.log('视频广告参数没有配置')
            return
        }
        const videoAd = this.qg.createRewardedVideoAd({
            adUnitId: sdkconfig.ycVideoId
        })
        videoAd.onLoad(() => {
            console.log("oppo video load success")
            YCSDK.ins.onLoad(AdType.Video)
            videoAd.show()
        })
        videoAd.onError(err => {
            console.log('onError:' + JSON.stringify(err))
            YCSDK.ins.onError(AdType.Video)
            if (!later) {
                return
            }
            setTimeout(() => {
                this.loadVideoAdlast()
            }, 60 * 1000)
            videoAd.destroy()
        })
        videoAd.onClose((res) => {
            if (!later) {
                return
            }
            setTimeout(() => {
                this.loadVideoAdlast()
            }, 60 * 1000)
            videoAd.destroy()
        })
        videoAd.load()
    }

    loadVideoAdlast() {
        if (!sdkconfig.ycVideoId) {
            console.log('视频广告参数没有配置')
            return
        }
        const videoAd = this.qg.createRewardedVideoAd({
            adUnitId: sdkconfig.ycVideoId
        })
        videoAd.onLoad(() => {
            console.log("oppo video load success")
            YCSDK.ins.onLoad(AdType.Video)
            videoAd.show()
        })
        videoAd.onError(err => {
            console.log('onError:' + JSON.stringify(err))
            YCSDK.ins.onError(AdType.Video)
        })
        videoAd.onClose((res) => {
            this.count++
            if (this.count >= 3) {
                return
            }
            this.loadVideoAdlast()
        })
        videoAd.load()
    }

    customFunc(methodName: string, params: any[], callBack: Function) {
        console.log("oppo custom function name:", methodName)

    }

    showNativeBanner() {
        if (this.qg.getSystemInfoSync().platformVersionCode < 1144) {
            console.log("快应用平台版本号低于1144，暂不支持原生2.0相关API")
            return
        }
        const { windowHeight, windowWidth } = this.qg.getSystemInfoSync()
        const bannerHeight = windowWidth / 5
        const nativeAdvanceAd = this.qg.createNativeAdvanceAd({
            adUnitId: sdkconfig.ycNativeBannerId,
            style: {
                top: windowHeight - bannerHeight,
                left: 0,
                width: windowWidth,
                height: bannerHeight
            }
        })
        nativeAdvanceAd.load().then(() => {
            console.log("promise 回调：加载成功")
        }).catch((err) => {
            console.log(`promise 回调：加载失败 ${JSON.stringify(err)}`)
        })
        nativeAdvanceAd.onLoad(function (res) {
            console.log(`原生广告2.0加载回调, code: ${res.code}, msg: ${res.msg}, adList:${JSON.stringify(res.adList)}`)
            YCSDK.ins.onLoad(AdType.NativeBanner)
            if (res.code === 0 && res.adList && res.adList.length > 0) {
                let _adId = res.adList[0].adId;
                console.log("获取广告id: " + _adId);
                if (_adId) {
                    try {
                        let nativeAdvanceAdRect = nativeAdvanceAd.createComponent({
                            adId: _adId,
                            componentType: "Rect",
                            style: {
                                color: "#FFFFFFFF",
                                borderRadius: 20,
                                borderWidth: 4,
                                borderColor: "#89FFFFFF",
                                opacity: 1,
                                left: 0,
                                top: 0,
                                width: windowWidth,
                                height: bannerHeight,
                            },
                        });
                        console.log("尝试创建组件 Rect, 获取组件ID： ", nativeAdvanceAdRect.getComponentId()
                        );
                    } catch (error) {
                        console.log("尝试创建组件 Rect 异常,请检查参数");
                    }
                    try {
                        let nativeAdvanceAdImage = nativeAdvanceAd.createComponent({
                            adId: _adId,
                            componentType: "AdImage",
                            style: {
                                imageStyle: "icon",
                                width: windowWidth / 5 - 30,
                                height: bannerHeight - 30,
                                borderRadius: 20,
                                left: 15,
                                top: 15,
                            },
                        });
                        console.log("尝试创建组件 AdImage, 获取组件ID： ", nativeAdvanceAdImage.getComponentId());
                    } catch (error) {
                        console.log("尝试创建组件 AdImage 异常,请检查参数");
                    }
                    try {
                        let adTextComponent = nativeAdvanceAd.createComponent({
                            adId: _adId,
                            componentType: "AdText",
                            style: {
                                textStyle: "title",
                                color: "#000000",
                                fontSize: 18,
                                top: bannerHeight / 4,
                                left: windowWidth / 5 + 20,
                                width: windowWidth / 2,
                                height: bannerHeight / 2
                            }
                        })
                        console.log("尝试创建组件 AdText, 获取组件ID： ", adTextComponent.getComponentId())
                    } catch {
                        console.log("尝试创建组件 AdText 异常,请检查参数");
                    }
                    try {
                        let nativeAdvanceAdButton = nativeAdvanceAd.createComponent({
                            adId: _adId,
                            componentType: "AdButton",
                            style: {
                                left: windowWidth - windowWidth / 3,
                                top: bannerHeight / 3,
                                opacity: 1,
                            },
                        });
                        console.log("尝试创建组件 AdButton, 获取组件ID： ", nativeAdvanceAdButton.getComponentId()
                        );
                    } catch (error) {
                        console.log("尝试创建组件 AdButton 异常,请检查参数");
                    }
                    try {
                        let nativeAdvanceAdCloseButton = nativeAdvanceAd.createComponent({
                            adId: _adId,
                            componentType: "AdCloseButton",
                            style: {
                                closeStyle: "topRight",
                            },
                        });
                        console.log("尝试创建组件 AdCloseButton, 获取组件ID： ", nativeAdvanceAdCloseButton.getComponentId()
                        );
                    } catch (error) {
                        console.log("尝试创建组件 AdCloseButton 异常,请检查参数");
                    }
                    try {
                        let nativeAdvanceAdLogo = nativeAdvanceAd.createComponent({
                            adId: _adId,
                            componentType: "AdLogo",
                            style: {
                                left: windowWidth - 80,
                                top: bannerHeight - 30,
                            },
                        });
                        console.log("尝试创建组件 AdLogo, 获取组件ID： ", nativeAdvanceAdLogo.getComponentId()
                        );
                    } catch (error) {
                        console.log("尝试创建组件 AdLogo 异常,请检查参数")
                    }

                    try {
                        let nativeAdvanceAdPrivacy = nativeAdvanceAd.createComponent({
                            adId: _adId,
                            componentType: "AdPrivacy",
                            style: {
                                privacyStyle: "light",
                                fontSize: 12,
                            },
                        });
                        console.log("尝试创建组件 AdPrivacy, 获取组件ID： ", nativeAdvanceAdPrivacy.getComponentId())

                    } catch (error) {
                        console.log("尝试创建组件 AdPrivacy 异常,请检查参数")
                    }
                    nativeAdvanceAd.show({ adId: _adId, })
                        .then(() => {
                            console.log("promise 回调：展示成功")
                        })
                        .catch((err) => {
                            console.log(`promise 回调：展示失败 ${JSON.stringify(err)}`)
                            nativeAdvanceAd.destroy()
                        })
                }
            }
        });
        nativeAdvanceAd.onCreateComponentSucc(function (res) {
            console.log(`创建原生广告2.0组件成功回调, code: ${res.code}, msg: ${res.msg},adId: ${res.adId}, 组件ID: ${res.componentId}`);
        })
        nativeAdvanceAd.onShow(function (res) {
            console.log(`原生广告2.0展示回调, code: ${res.code}, msg: ${res.msg}`)
            YCSDK.ins.onShow(AdType.NativeBanner)
        })
        nativeAdvanceAd.onError(function (err) {
            console.log(`原生广告2.0错误回调 : ${JSON.stringify(err)}`)
            YCSDK.ins.onError(AdType.NativeBanner)
        })
        nativeAdvanceAd.onClose((res) => {
            console.log(`原生广告2.0关闭回调, code: ${res.code}, msg: ${res.msg}`)
            YCSDK.ins.onClose(AdType.NativeBanner)
            nativeAdvanceAd.destroy()
            this.refreshBanner()

        })
    }

}