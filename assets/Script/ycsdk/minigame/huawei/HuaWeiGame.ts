import { AdType } from "../../AdType";
import { GameInterface } from "../../GameInterface";
import { sdkconfig } from "../../SDKConfig";
import { YCSDK } from "../../YCSDK";
import { BannerType } from "../BannerType";
import { InterstitialType } from "../InterstitialType";

export class HuaWeiGame implements GameInterface {

    private qg = window['qg']

    hideInters(type: InterstitialType): void {

    }

    customFunc(methodName: string, params: any[], callBack: Function) {

    }

    init(callback): void {
        callback && callback()
        this.loadVideo(false)
    }

    login(callBack?: Function): void {
        this.qg.gameLoginWithReal({
            forceLogin: 1,
            appid: sdkconfig.version,
            success: function (data) {
                // 登录成功后，可以存储账号信息。
                callBack && callBack(true)
                console.log(" game login with real success:" + JSON.stringify(data))
            },
            fail: function (data, code) {
                console.log("game login with real fail:" + data + ", code:" + code)
                //根据状态码处理游戏的逻辑。
                //状态码为7004或者2012，表示玩家取消登录。
                //此时，建议返回游戏界面，可以让玩家重新进行登录操作。
                if (code == 7004 || code == 2012) {
                    console.log("玩家取消登录，返回游戏界面让玩家重新登录。")
                    callBack && callBack(false, 7004)
                }
                //状态码为7021表示玩家取消实名认证。
                //在中国大陆的情况下，此时需要禁止玩家进入游戏。
                if (code == 7021) {
                    callBack && callBack(false, 7021)
                    console.log("玩家取消实名认证，禁止进入游戏")
                }
            }
        })
    }

    pay(params: string, callBack: Function): void {
        // this.qg.isEnvReady({
        //     isEnvReadyReq: {
        //         // 替换为真实有效的APP ID
        //         "applicationID": "101***751"
        //     },
        //     success: function (data) {
        //         console.log("isEnvReady data =", JSON.stringify(data));
        //         //环境监测通过，可以调用支付接口
        //         this.createPurchaseIntent(params, callBack)
        //     },
        //     fail: function (data, code) {
        //         console.log("isEnvReady fail data =" + data, "code =" + code);
        //     }
        // })
    }

    createPurchaseIntent(params, callBack): void {
        // this.qg.createPurchaseIntent({
        //     purchaseIntentReq: {
        //         // 替换为真实有效的APP ID
        //         "applicationID": "101***751",
        //         "productId": "dmy001",
        //         "priceType": 0,
        //         "developerPayload": "testPurchase",
        //         // 替换为真实有效的支付公钥
        //         "publicKey": "MIIBojANBgkqh******************aZWT7PzVAeGidLcEeKlAgMBAAE"
        //     },
        //     success: function (data) {
        //         console.log("createPurchaseIntent success =" + JSON.stringify(data));
        //         if (data.purchaseState == 0) {
        //             //支付成功，对结果验签后下发商品
        //             this.doCheck()
        //             //下发后消耗该商品，可继续购买该商品
        //             this.consumeOwnedPurchase()
        //         }
        //     },
        //     fail: function (data, code) {
        //         console.log("createPurchaseIntent fail data =" + data, "code =" + code);

        //     }
        // })
    }

    doCheck(content: string, sign: string, publicKey: string): boolean {
        // 检查输入参数
        if (!sign || !publicKey) {
            return false;
        }
    }

    consumeOwnedPurchase() {
        // this.qg.consumeOwnedPurchase({
        //     consumeOwnedPurchaseReq: {
        //         // 替换为真实有效的APP ID
        //         "applicationID": "101***751",
        //         "developerPayload": "testPurchase",
        //         // 替换为真实有效的购买令牌
        //         "purchaseToken": "0000017297d6a4faa**************3d0x434e.1.101315751",
        //         // 替换为真实有效的支付公钥
        //         "publicKey": "MIIBojANBgkqhkiG9w0*************************EeKlAgMBAAE"
        //     },
        //     success: function (data) {
        //         console.log("consumeOwnedPurchase data =", JSON.stringify(data));
        //     },
        //     fail: function (data, code) {
        //         console.log("consumeOwnedPurchase fail data =" + JSON.stringify(data), "code =" + code);
        //     }
        // })
    }

    private bannerAd: any

    showBanner(position: BannerType): void {
        if (!sdkconfig.ycBannerId) {
            console.log('banner广告参数没有配置')
            return
        }
        this.hideBanner()
        if (this.bannerAd) {
            this.bannerAd.destroy()
            this.bannerAd = null
        }
        var sysInfo = this.qg.getSystemInfoSync()
        var bannerTop = sysInfo.safeArea.height
        this.bannerAd = this.qg.createBannerAd({
            adUnitId: sdkconfig.ycBannerId,
            adIntervals: 45,    //刷新时间
            style: {
                top: bannerTop - 60,
                left: 0,
                height: 60,
                width: 360,
            }
        })
        this.bannerAd.onError((err) => {
            console.log("huawei banner error: ", JSON.stringify(err))
            if (this.bannerAd) {
                this.bannerAd.destroy()
                this.bannerAd = null
            }
            YCSDK.ins.onError(AdType.Banner)
        })
        this.bannerAd.onLoad(() => {
            console.log("huawei banner on load")
            YCSDK.ins.onLoad(AdType.Banner)
            YCSDK.ins.onShow(AdType.Banner)
        })
        this.bannerAd.onClose(() => {
            console.log("huawei banner on close")
            if (this.bannerAd) {
                this.bannerAd.destroy()
                this.bannerAd = null
            }
            YCSDK.ins.onClose(AdType.Banner)
        })
        setTimeout(() => {
            this.bannerAd.show()
        }, 1000)
    }

    hideBanner(): void {
        if (!this.bannerAd) {
            console.log("huawei banner ad is hide")
            return
        }
        this.bannerAd.hide()
    }

    showInters(type: InterstitialType): void {
        if (!type) {
            const odds = YCSDK.ins.random(100)
            if (odds >= 50 && sdkconfig.intersId.length >= 1) {
                this.showIntersVideo()
            } else if (sdkconfig.nativeId.length >= 1) {
                this.showNative()
            }
            return
        }
        switch (type) {
            case InterstitialType.Initial:
            case InterstitialType.Video:
                this.showIntersVideo()
                break
            case InterstitialType.Native:
                this.showNative()
                break
        }
    }

    showNative() {
        if (!sdkconfig.ycNativeId) {
            console.log('原生模板广告参数没有配置')
            return
        }
        let nativeAd = this.qg.createNativeAd({
            adUnitId: sdkconfig.ycNativeId,
            success: (code) => {
                console.log("loadNativeAd success: ", code);
            },
            fail: (data, code) => {
                console.log("loadNativeAd fail: " + data + "," + code);
                nativeAd.destroy()
            }
        })
        nativeAd.offLoad()
        nativeAd.onLoad((data) => {
            // console.info('ad data loaded: ' + JSON.stringify(data))
            YCSDK.ins.onLoad(AdType.Native)
            let ad = data.adList[0]
            //六要素（应用名，开发者信息，版本号，隐私，权限，介绍）
            // console.log("source:", ad.source)
            // console.log("developerName:", ad.developerName)
            // console.log("versionName:", ad.versionName)
            // console.log("privacyUrl:", ad.privacyUrl)
            // console.log("permissionUrl:", ad.permissionUrl)
            // console.log("appDetailUrl:", ad.appDetailUrl)
            // console.log("imgUrlList:", ad.imgUrlList[0])
            // console.log("adId:", ad.adId)
            // console.log("creativeType:", ad.creativeType)
            this.renderNative(ad, nativeAd)
        })
        nativeAd.offError()
        nativeAd.onError((e) => {
            console.error('load ad error:' + JSON.stringify(e))
            nativeAd.destroy()
            YCSDK.ins.onError(AdType.Native)
        })
        nativeAd.load()
    }

    renderNative(adItem, nativeAd) {
        cc.resources.load('Privacy/bg', cc.Prefab, (err, prefab: cc.Prefab) => {
            if (err) {
                console.error('加载Prefab失败:', err)
                YCSDK.ins.onError(AdType.Native)
                return
            }
            const node = cc.instantiate(prefab)
            const native = node.getChildByName('native')
            const close = native.getChildByName('close')
            const title = native.getChildByName('title').getComponent(cc.Label)
            title.string = adItem.appName
            const source = native.getChildByName('source').getComponent(cc.Label)
            source.string = adItem.source
            const company = native.getChildByName('company').getComponent(cc.Label)
            company.string = adItem.developerName
            const pic = native.getChildByName('pic')
            const info = native.getChildByName('info')
            const version = info.getChildByName('verison')
            version.on(cc.Node.EventType.TOUCH_END, () => {
                console.log('change version')
                version.getComponent(cc.Label).string = adItem.versionName
            })
            const description = info.getChildByName('description')
            description.on(cc.Node.EventType.TOUCH_END, () => {
                console.log('open description')
                this.qg.openDeeplink({ uri: adItem.appDetailUrl })
            })
            const privacy = info.getChildByName('privacy')
            privacy.on(cc.Node.EventType.TOUCH_END, () => {
                console.log('open privacy')
                this.qg.openDeeplink({ uri: adItem.privacyUrl })
            })
            const permission = info.getChildByName('permission')
            permission.on(cc.Node.EventType.TOUCH_END, () => {
                console.log('open permission')
                this.qg.openDeeplink({ uri: adItem.permissionUrl })
            })
            pic.on(cc.Node.EventType.TOUCH_END, () => {
                console.log("native click")
                YCSDK.ins.onClick(AdType.Native)
                nativeAd.reportAdClick({ adId: adItem.adId, })
            })
            close.on(cc.Node.EventType.TOUCH_END, () => {
                console.log('close native')
                nativeAd.destroy()
                node.destroy()
                YCSDK.ins.getGameNode().removeChild(node)
                nativeAd.hideDownloadButton({
                    adId: adItem.adId,
                    success: (code) => {
                        console.log("hideDownloadButton: success")
                    },
                    fail: (data, code) => {
                        console.log(" hideDownloadButton fail: " + data + "," + code)
                    }
                })
                YCSDK.ins.onClose(AdType.Native)
            })
            cc.assetManager.loadRemote<cc.Texture2D>(adItem.imgUrlList[0], (err, image) => {
                if (err) {
                    console.error('加载远程图片失败:', err)
                    YCSDK.ins.onError(AdType.Native)
                    return
                }
                let spriteFrame = new cc.SpriteFrame(image)
                pic.getComponent(cc.Sprite).spriteFrame = spriteFrame
                YCSDK.ins.getGameNode().addChild(node)
                YCSDK.ins.onShow(AdType.Native)
                this.showNativeDownload(adItem, nativeAd, node)
                nativeAd.reportAdShow({ adId: adItem.adId })
            })
        })
    }

    showNativeDownload(adItem, nativeAd, node) {
        const { screenWidth, screenHeight } = this.qg.getSystemInfoSync()
        nativeAd.showDownloadButton({
            adId: adItem.adId,
            style: {
                left: node.width / 2,
                top: node.height - 600,
                // left: 300,
                // top: 500,
                heightType: 'normal',
                width: screenWidth / 2,
                fixedWidth: true
                // minWidth: 400,
                // maxWidth: 600,
                // textSize: 50,
                // horizontalPadding: 50,
                // cornerRadius: 22,
                // normalTextColor: '#FFFFFF',
                // normalBackground: '#5291FF',
                // pressedColor: '#0A59F7',
                // normalStroke: 5,
                // normalStrokeCorlor: '#FF000000',
                // processingTextColor: '#5291FF',
                // processingBackground: '#0F000000',
                // processingColor: '#000000',
                // processingStroke: 10,
                // processingStrokeCorlor: '#0A59F7',
                // installingTextColor: '#000000',
                // installingBackground: '#FFFFFF',
                // installingStroke: 15,
                // installingStrokeCorlor: '#5291FF'
            },
            success: (code) => {
                console.log("showDownloadButton: success")
            },
            fail: (data, code) => {
                console.log("showDownloadButton fail: " + data + "," + code)
            }
        })
    }

    showIntersVideo() {
        if (!sdkconfig.ycIntersId) {
            console.log("插屏广告id未配置")
            return
        }
        let interstitialAd = this.qg.createInterstitialAd({
            adUnitId: sdkconfig.ycIntersId
        })
        interstitialAd.onLoad(function (data) {
            YCSDK.ins.onLoad(AdType.Inters)
            console.log('huawei inters onLoad data ' + JSON.stringify(data))
            interstitialAd.show()
            YCSDK.ins.onShow(AdType.Inters)
        })
        interstitialAd.onError((err) => {
            interstitialAd.destroy()
            console.log("huawei inters on error: ", JSON.stringify(err))
            YCSDK.ins.onError(AdType.Inters)
        })
        interstitialAd.onClose(() => {
            console.log('huawei interstitialAd closed')
            interstitialAd.destroy()
            YCSDK.ins.onClose(AdType.Inters)
        })
        interstitialAd.load()
    }

    private rewardedVideoAd
    private callback

    showVideo(callBack: Function): boolean {
        this.callback = callBack
        let lastCallTime = 0
        let nowCallTime = new Date().getTime()
        if (lastCallTime != 0 && nowCallTime - lastCallTime < 400) {
            console.log("show video time too many")
            return
        }
        lastCallTime = nowCallTime
        if (this.rewardedVideoAd && this.callback) {
            this.show()
            return
        }
        this.loadVideo(true)
        return false
    }

    loadVideo(show) {
        if (!sdkconfig.ycVideoId) {
            console.log('激励视频广告参数没有配置')
            this.callback && this.callback(false)
            return
        }
        this.rewardedVideoAd = this.qg.createRewardedVideoAd({
            adUnitId: sdkconfig.ycVideoId,
            success: (code) => {
                console.log("loadVideoAd createRewardedVideoAd success" + code)
            },
            fail: (data, code) => {
                console.log("loadVideoAd createRewardedVideoAd fail: " + data + "," + code)
            }
        })
        this.rewardedVideoAd.onLoad(() => {
            console.log('loadVideoAd: ad loaded.')
            YCSDK.ins.onLoad(AdType.Video)
            if (show) {
                this.show()
            }
        })
        this.rewardedVideoAd.onError((e) => {
            console.error('load ad error:' + JSON.stringify(e))
            this.callback && this.callback(false)
            YCSDK.ins.onError(AdType.Video, this.callback)
        })
        this.rewardedVideoAd.onClose((res) => {
            console.log('ad onClose: ' + res.isEnded)
            YCSDK.ins.onClose(AdType.Video)
            if (res && res.isEnded || res === undefined) {
                console.log('播放激励视频结束，给予奖励')
                this.callback && this.callback(true)
                YCSDK.ins.onReward()
            } else {
                this.callback && this.callback(false)
                console.log('播放没结束，不给予奖励')
            }
            this.rewardedVideoAd.load()
        })
        this.rewardedVideoAd.load()
    }

    show() {
        if (this.rewardedVideoAd) {
            this.rewardedVideoAd.show()
            YCSDK.ins.onShow(AdType.Video)
        }
    }
}