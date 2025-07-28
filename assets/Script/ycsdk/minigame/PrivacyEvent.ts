import { YCSDK } from "../YCSDK"

export class PrivacyEvent extends cc.Component {

    private yinsiUI: cc.Node

    onLoad(): void {
        cc.resources.load('Privacy/yinsiUI', cc.Prefab, (err, prefab: cc.Prefab) => {
            if (err) {
                console.error('加载Prefab失败:', err)
                return
            }
            this.yinsiUI = cc.instantiate(prefab)
            const close = this.yinsiUI.getChildByName('window').getChildByName('closeBtn')
            close.on(cc.Node.EventType.TOUCH_END, () => {
                this.yinsiUI.active = false
            }, this)
            YCSDK.ins.getGameNode().addChild(this.yinsiUI)
            console.log('on PrivacyEvent add')
        })
    }

    openPrivacyPolicy(event) {
        console.log("点击隐私政策")
        if (YCSDK.ins.isRun(cc.sys.HUAWEI_GAME)) {
            this.hwOpen()
            return
        }
        this.open()
    }

    hwOpen() {
        const qg = window['qg']
        if (!qg) {
            console.log('qg is null')
            return
        }
        qg.openDeeplink({
            uri: 'https://ds.rhino-times.com/tl/docs/m_privateprotocol.html'
        })
    }

    open() {
        this.yinsiUI.active = true
    }
}