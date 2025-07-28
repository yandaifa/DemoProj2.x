interface payParamsProps {
  productId: string       //产品ID
  productName: string     //产品名称
  productDesc: string     //产品描述
  price: number           //价格，单位：元
  coinNum?: number        //当前余额
  serverId?: string       //大区ID
  serverName?: string     //大区名臣
  roleId?: string         //角色ID
  roleName?: string       //角色名称
  roleLevel?: number      //角色等级
  vip?: string            //VIP等级
  extension?: string      //扩展参数
}

export class PayParams {

  constructor(props: payParamsProps) {
    const keys = Object.keys(props)
    keys.map(k => {
      this[k] = props[k]
    })
  }

  toJSonString(): string {
    return JSON.stringify(this)
  }

}

