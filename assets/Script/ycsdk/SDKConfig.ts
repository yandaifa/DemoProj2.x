export interface Config {
    pkgName: string
    appId: string
    company?:string
    bannerId?: string[]
    intersId?: string[]
    videoId?: string[]
    nativeId?: string[]
    nativeBannerId?: string[],
    extension?:string[]
}

interface SDKConfig extends Config {
    open: boolean
    version: string
    subornUser: boolean
    subornUserTest: boolean
    ycBannerId: string
    ycNativeId: string
    ycVideoId: string
    ycIntersId: string
    ycBigPicId: string
    ycNativeBannerId: string
    ratio?: { inters: number, native: number, video: number }
    subornVideoConfig?: { switch?: boolean, count?: number, delay?: number }
    subornNativeConfig?: { switch?: boolean, type?: number, loop?: number }
    customFunc?: {}
}

export let sdkconfig: SDKConfig = {
    open: true,
    subornUser: false,
    subornUserTest: false,
    version: "1536",
    company: 'tl',
    pkgName: "",
    appId: "",
    bannerId: [],
    intersId: [],
    videoId: [],
    nativeId: [],
    nativeBannerId: [],
    extension:[],
    ratio: {
        inters: 50,
        native: 50,
        video: 0
    },

    ycBannerId: "",
    ycNativeId: "",
    ycVideoId: "",
    ycIntersId: "",
    ycBigPicId: "",
    ycNativeBannerId: "",
    customFunc: {}
}

export interface GameConfig {
    channel: number
    appId: number
    appKey: string
    pkgVer: string
    sdkVer: string
    asId: number
}

export let gameconfig: GameConfig = {
    channel: 31,
    appId: 281,
    appKey: 'O134sJSO1tkjj3NI',
    pkgVer: '1.5.36',
    sdkVer: '1.5.36',
    asId: 0
}