ycsdk使用注意事项：
1，init初始化接口变动，原来的init只需要传入callback或者不传，现在需要在init接口传入参数，类型为Conifg。其中的具体参数没有可以传默认值。
2，隐私接口变动，游戏自带隐私时不建议使用。新版本改用prefab，需要将npm安装的包中的assets/resources/Privacy目录复制到游戏相对应的目录，并且打开检查属性是否正常，所有背景均使用panelBg.png
3，由于之前是源码复制，现在改为npm安装，sdk导入方式发生变化，调用sdk接口的地方需要重新导包。