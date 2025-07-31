import { BannerType } from "./minigame/BannerType"
import { InterstitialType } from "./minigame/InterstitialType"
import { PrivacyListener } from "./minigame/PrivacyListener"

export interface GameInterface {

  /**
   * 初始化，在游戏开始前调用
   * @param callBack sdk初始化完成回调
   */
  init(callBack?): void

  /**
   * 登录
   * @param callBack 登录结果回调
   */
  login(callBack?: Function): void

  showPolicy?(node: cc.Node, callBack: PrivacyListener)
  /**
   * 支付
   * @param params 支付参数
   * @param callBack 支付回调
   */
  pay?(params: string, callBack: Function): void

  /**
   * 展示banner广告
   * 
   * @param position banner展示位置
   */
  showBanner(position: BannerType): void

  /**
   * 隐藏banner广告
   */
  hideBanner(): void

  /**
   * 展示插屏
   * @param type 插屏类型
   */
  showInters(type: InterstitialType): void

  /**
   * 隐藏插屏广告
   */
  hideInters(type: InterstitialType): void

  /**
   * 展示激励视频
   * @param callBack 广告播放结果回调，true为播放成功，下发奖励，false为其他情况，如播放失败，播放未完成等，不下发奖励
   * @returns 广告加载结果，true为成功，false为未加载或加载失败
   */
  showVideo(callBack: Function): boolean

  /**
   * 渠道特有的方法调用此处实现
   * @param methodName 方法名
   * @param params 入参
   * @param callBack 回调
   */
  customFunc(methodName: string, params: any[], callBack: Function): any
}
