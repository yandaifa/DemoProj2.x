import { GameInterface } from "../../GameInterface";
import { BannerType } from "../../minigame/BannerType";
import { InterstitialType } from "../../minigame/InterstitialType";
import { PrivacyListener } from "../../minigame/PrivacyListener";
import { SubornNativeConfig } from "../../minigame/SubornNativeConfig";
import { SubornVideoConfig } from "../../minigame/SubornVideoConfig";

export class IOSGame implements GameInterface {

    init(callBack?: Function, adconfig?: SubornVideoConfig, config?: SubornNativeConfig): void {

    }
    showPolicy?(node, callBack: PrivacyListener): void {

    }
    login?(callBack?: Function): void {

    }
    pay?(params: string, callBack: Function): void {

    }
    showBanner(position: BannerType): void {

    }
    hideBanner(): void {

    }
    showInters(type: InterstitialType): void {
        // jsb.bridge.sendToNative("showInters")
    }

    hideInters(type: InterstitialType): void {

    }
    showVideo(callBack: Function): boolean {
        // jsb.bridge.onNative = (arg0: string, arg1: string): void => {
        //     if (arg0 == 'close') {
        //         if (arg1 == "finished") {
        //             callBack(true)
        //         }
        //         else {
        //             callBack(false)
        //         }
        //     }
        //     return;
        // }
        // jsb.bridge.sendToNative("showVideo")
        return true

    }

    customFunc?(methodName: string, params: any[], callBack: Function) {

    }
}