export interface Config {
    pkgName: string
    bannerId: string[]
    intersId: string[]
    videoId: string[]
    nativeId: string[]
    nativeBannerId: string[]
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
    ratio: { inters: number, native: number, video: number }
    customFunc?: {}
}

export let sdkconfig: SDKConfig = {
    open: true,
    subornUser: false,
    subornUserTest: false,
    version: "1536",
    pkgName: "",
    bannerId: [],
    intersId: [],
    videoId: [],
    nativeId: [],
    nativeBannerId: [],
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