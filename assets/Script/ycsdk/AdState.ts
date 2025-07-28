import { AdType } from "./AdType"

export interface AdState {

    onLoad(type: AdType): void

    onError(type: AdType, callBack?: Function): void

    onShow(type: AdType): void

    onClick(type: AdType): void

    onClose(type: AdType): void

    onReward(): void
}