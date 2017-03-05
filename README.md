# Thera package

**This package enables running WEEX in thera.**. It handles run, debug weex event and status.   
It communicates with `Dumplings` server agent, to modify WEEX script ON THE FLY.

It's main status work like this.  
![_E7_B2_98_E8_B4_B4_E5_9B_BE_E7_89_87](http://git.cn-hangzhou.oss.aliyun-inc.com/uploads/project-falcon/Thera/8271fd7ee055e9f0ab7f0831b65a0546/%E7%B2%98%E8%B4%B4%E5%9B%BE%E7%89%87.png)

## Usage

It doesn't depend on any UI package.  But require a sever agent like `Dumplings`, which supervise and transform WEEX file on real time.

But works well with [package console-panel](http://gitlab.alibaba-inc.com/xiaoshu.wb/console-panel) which displays debuging sonsole,   
and [package main-window](http://gitlab.alibaba-inc.com/xiaoshu.wb/mainwindow) which dispatch debuging related UI events.

Activate WeexRuner on start up. It will search local simulator (iOS ONLY for now), generate a device list.

```
    let runner = new WeexRuner()
    runner.activate()
```

Setup server and the simulator, start to preview.

```
    runner.start()
```

Shutdown server and the simulator, stop previewing.

```
    runner.stop()
```

Display the QR code of the local ip address, in order to build ws connection with real device.

```
    runner.stop()
```



## TODO

* Add Android Support
* Customize Notification Window.

