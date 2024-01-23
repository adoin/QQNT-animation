const fs = require('fs')
const path = require('path')
const { BrowserWindow, ipcMain } = require('electron')
// 加载插件时触发
const pluginDataPath = LiteLoader.plugins["animate"].path.data;
const settingsPath = path.join(pluginDataPath, "settings.json");
const animatePrefix = 'animate__'
const entrances = [
  'backInDown',
  'backInLeft',
  'backInRight',
  'backInUp',
  'bounceIn',
  'bounceInDown',
  'bounceInLeft',
  'bounceInRight',
  'bounceInUp',
  'fadeIn',
  'fadeInDown',
  'fadeInDownBig',
  'fadeInLeft',
  'fadeInLeftBig',
  'fadeInRight',
  'fadeInRightBig',
  'fadeInUp',
  'fadeInUpBig',
  'fadeInTopLeft',
  'fadeInTopRight',
  'fadeInBottomLeft',
  'fadeInBottomRight',
  'lightSpeedInRight',
  'lightSpeedInLeft',
  'rotateIn',
  'rotateInDownLeft',
  'rotateInDownRight',
  'rotateInUpLeft',
  'rotateInUpRight',
  'jackInTheBox',
  'rollIn',
  'zoomIn',
  'zoomInDown',
  'zoomInLeft',
  'zoomInRight',
  'zoomInUp',
  'slideInDown',
  'slideInLeft',
  'slideInRight',
  'slideInUp',
]
const exits = [
  'backOutDown',
  'backOutLeft',
  'backOutRight',
  'backOutUp',
  'bounceOut',
  'bounceOutDown',
  'bounceOutLeft',
  'bounceOutRight',
  'bounceOutUp',
  'fadeOut',
  'fadeOutDown',
  'fadeOutDownBig',
  'fadeOutLeft',
  'fadeOutLeftBig',
  'fadeOutRight',
  'fadeOutRightBig',
  'fadeOutUp',
  'fadeOutUpBig',
  'fadeOutTopLeft',
  'fadeOutTopRight',
  'fadeOutBottomRight',
  'fadeOutBottomLeft',
  'lightSpeedOutRight',
  'lightSpeedOutLeft',
  'rotateOut',
  'rotateOutDownLeft',
  'rotateOutDownRight',
  'rotateOutUpLeft',
  'rotateOutUpRight',
  'rollOut',
  'zoomOut',
  'zoomOutDown',
  'zoomOutLeft',
  'zoomOutRight',
  'zoomOutUp',
  'slideOutDown',
  'slideOutLeft',
  'slideOutRight',
  'slideOutUp',
]
const highlights = [
  'bounce',
  'flash',
  'pulse',
  'rubberBand',
  'shakeX',
  'shakeY',
  'headShake',
  'swing',
  'tada',
  'wobble',
  'jello',
  'heartBeat',
  'flip',
  'flipInX',
  'flipInY',
  'flipOutX',
  'flipOutY',
]

function log (...args) {
  console.log(`[animate]`, ...args)
}

const getConfig = () => {
  let config = {}
  try {
    const data = fs.readFileSync(settingsPath, 'utf-8')
    config = JSON.parse(data)
  } catch (e) {
    log(e)
  }
  return config
}

// 防抖函数
function debounce (fn, time) {
  let timer = null
  return function (...args) {
    timer && clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, time)
  }
}

// 更新样式
function updateStyle (webContents, settingsPath) {
  const config = getConfig()
  const csspath = path.join(__dirname, 'src/dynamic.css')
  fs.readFile(csspath, 'utf-8', (err, data) => {
    if (err) {
      return
    }
    /* todo 不同的选择器 不同的var*/
    let preloadString = `:root {
        
        }
        div.two-col-layout__main {
          --animate-duration: ${config.contextEntrancesDuration || 1}s;
        }
        `
    
    webContents.send(
      'LiteLoader.animate.updateStyle',
      // 将主题色插入到dynamic.css中
      preloadString + '\n\n' + data
    )
  })
}

// 监听CSS修改-开发时候用的
function watchCSSChange (webContents, settingsPath) {
  const filepath = path.join(__dirname, 'src/dynamic.css')
  fs.watch(filepath, 'utf-8', debounce(() => {
    updateStyle(webContents, settingsPath)
  }, 100))
}

// 监听配置文件修改
function watchSettingsChange (webContents, settingsPath) {
  fs.watch(settingsPath, 'utf-8', debounce(() => {
    updateStyle(webContents, settingsPath)
  }, 100))
}

const initSettingFile = ()=>{
// fs判断插件路径是否存在，如果不存在则创建（同时创建父目录（如果不存在的话））
  if (!fs.existsSync(pluginDataPath)) {
    fs.mkdirSync(pluginDataPath, { recursive: true })
  }
// 判断settings.json是否存在，如果不存在则创建
  if (!fs.existsSync(settingsPath)) {
    fs.writeFileSync(settingsPath, JSON.stringify({
      contextEntrancesDuration: 1,
      contextEnterType: 'fadeIn',
    }))
  }
}
initSettingFile()
ipcMain.on(
  'LiteLoader.animate.rendererReady',
  (event, message) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    updateStyle(window.webContents, settingsPath)
  }
)

// 监听渲染进程的updateStyle事件
ipcMain.on(
  'LiteLoader.animate.updateStyle',
  (event, settingsPath) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    updateStyle(window.webContents, settingsPath)
  })

// 监听渲染进程的watchCSSChange事件
ipcMain.on(
  'LiteLoader.animate.watchCSSChange',
  (event, settingsPath) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    watchCSSChange(window.webContents, settingsPath)
  })

// 监听渲染进程的watchSettingsChange事件
ipcMain.on(
  'LiteLoader.animate.watchSettingsChange',
  (event, settingsPath) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    watchSettingsChange(window.webContents, settingsPath)
  })

ipcMain.handle(
  'LiteLoader.animate.getSettings',
  (event, message) => {
    try {
      return getConfig()
    } catch (error) {
      log(error)
      return {}
    }
  }
)

ipcMain.handle(
  'LiteLoader.animate.setSettings',
  (event, content) => {
    try {
      const new_config = JSON.stringify(content)
      fs.writeFileSync(settingsPath, new_config, 'utf-8')
    } catch (error) {
      log(error)
    }
  }
)

/*ipcMain.handle(
  'LiteLoader.animate.logToMain',
  (event, ...args) => {
    log(...args)
  }
)*/
/*ipcMain.on(
  'LiteLoader.animate.contextEnter',
  (event, ...args) => {
    return
    const config = getConfig()
    const duration = config.contextEntrancesDuration || 1
    const window = BrowserWindow.fromWebContents(event.sender)
    const el = window.document.querySelector('.two-col-layout__main')
    console.log('el', el)
    el.classList.add('animate__animated', animatePrefix + config.contextEnterType)
    setTimeout(() => {
      el.classList.remove('animate__animated', animatePrefix + config.contextEnterType)
    }, duration * 1000)
  }
)
ipcMain.on(
  'LiteLoader.animate.contextLeave',
  (event, ...args) => {
    /!*todo*!/
  }
)
ipcMain.on(
  'LiteLoader.animate.windowActive',
  (event, ...args) => {
    /!*todo*!/
  }
)
ipcMain.on(
  'LiteLoader.animate.windowInactive',
  (event, ...args) => {
    /!*todo*!/
  }
)*/
// 创建窗口时触发
module.exports.onBrowserWindowCreated = window => {
  const settingsPath = path.join(pluginDataPath, 'settings.json')
  window.on('ready-to-show', () => {
    const url = window.webContents.getURL()
    if (url.includes('app://./renderer/index.html')) {
      watchCSSChange(window.webContents, settingsPath)
      watchSettingsChange(window.webContents, settingsPath)
    }
  })
  const original_send = window.webContents.send
  const patched_send = (channel, ...args) => {
    if (args?.[1]?.[0]?.cmdName === 'onFocus') {
      window.webContents.send('new_message-main', args)
    }
    /*todo 其他多能好傻*/
    if (!channel.includes('LiteLoader')) {
      if (args?.[1]?.account?.length > 0 && account == '0') {
        window.webContents.send('user-login-main', args[1])
      }
      // output(channel, JSON.stringify(args));
    }
    if (args[0]?.callbackId) {
      const id = args[0].callbackId
      if (id in pendingCallbacks) {
        window.webContents.send(pendingCallbacks[id], args[1])
        delete pendingCallbacks[id]
      }
    }
    return original_send.call(window.webContents, channel, ...args)
  }
  window.webContents.send = patched_send
}
