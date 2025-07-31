export interface PrivacyListener {

    //用户已经同意过了，执行游戏逻辑
    userAgree?(): void

    //找不到节点，弹窗展示需要在绑定节点，请传入合适的节点名字
    nodeError?(): void

    //用户点击了同意按钮，执行游戏逻辑
    onAgree?(): void

    //用户点击了不同意，结束游戏
    onDisAgree?(): void
}