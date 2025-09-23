import { GameInterface } from "../../GameInterface";
import { BannerType } from "../../minigame/BannerType";
import { InterstitialType } from "../../minigame/InterstitialType";
import { PrivacyListener } from "../../minigame/PrivacyListener";
import { SubornNativeConfig } from "../../minigame/SubornNativeConfig";
import { SubornVideoConfig } from "../../minigame/SubornVideoConfig";
import HarmonySdk from "./HarmonySdk";

const TAG = 'HarmonyGame'
export class HarmonyGame implements GameInterface {

    init(callBack?: Function, adconfig?: SubornVideoConfig, config?: SubornNativeConfig): void {
        HarmonySdk.getInstance().initSDK({}, (phases: string, res: object) => {
            console.log(TAG, "phases:", phases, "res:", JSON.stringify(res))
            callBack && callBack()
        });
    }

    login(callBack?: Function): void {

    }

    showPolicy?(node: cc.Node, callBack: PrivacyListener) {

    }

    pay?(params: string, callBack: Function): void {

    }

    showBanner(position: BannerType): void {

    }

    hideBanner(): void {

    }

    showInters(type: InterstitialType): void {
        HarmonySdk.getInstance().showInters()
    }

    hideInters(type: InterstitialType): void {

    }

    showVideo(callBack: Function): boolean {
        HarmonySdk.getInstance().showVideo({}, (phases: string, res: object) => {
            console.log(TAG, "showVideo, phases:" + phases + ";res:" + JSON.stringify(res));
            if(phases == 'videoPlayFinish'){
                callBack && callBack(true)
            }else{
                callBack && callBack(false)
            }
        });
        return true
    }

    customFunc(methodName: string, params: any[], callBack: Function) {
        
    }

}