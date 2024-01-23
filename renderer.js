const plugin_path = LiteLoader.plugins['animate'].path.plugin

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

function log (...args) {
  console.log(`[animate]`, ...args)
  // animate.logToMain(...args)
}

function observeElement (selector, callback, callbackEnable = true, interval = 100) {
  const timer = setInterval(function () {
    const element = document.querySelector(selector)
    if (element) {
      if (callbackEnable) {
        callback()
        log('已检测到', selector)
      }
      clearInterval(timer)
    }
  }, interval)
}

const insertAnimateCss = () => {
  const animateCssLinkElement = document.createElement('link')
  animateCssLinkElement.rel = 'stylesheet'
  animateCssLinkElement.href = `local:///${plugin_path}/src/animate.css`
  document.head.appendChild(animateCssLinkElement)
}
try {
  // 页面加载完成时触发
  const element = document.createElement('style')
  document.head.appendChild(element)
  
  animate.updateStyle((event, message) => {
    element.textContent = message
  })
  
  animate.rendererReady()
  
  // 判断操作系统类型
  var osType = ''
  if (LiteLoader.os.platform === 'win32') {
    osType = 'windows'
  } else if (LiteLoader.os.platform === 'linux') {
    osType = 'linux'
  } else if (LiteLoader.os.platform === 'darwin') {
    osType = 'mac'
  }
  document.documentElement.classList.add(osType)
  observeElement('body', function () { insertAnimateCss() })
} catch (error) {
  log('[渲染进程错误]', error)
}

// 打开设置界面时触发
export const onSettingWindowCreated = async view => {
  try {
    const html_file_path = `local:///${plugin_path}/src/settings.html`
    
    view.innerHTML = await (await fetch(html_file_path)).text()
    
    // 获取设置
    const settings = await animate.getSettings()
    
    const contextEnterTypePicker = view.querySelector('.context-entrances')
    const contextEntrancesDurationPicker = view.querySelector('.pick-context-entrances-duration')
    if (contextEnterTypePicker) {
      contextEnterTypePicker.innerHTML = entrances.map(entrance => `<setting-option data-value="${entrance}">${entrance}</setting-option>`).join('')
      contextEnterTypePicker.value = settings.contextEnterType
      contextEnterTypePicker.addEventListener('change', (event) => {
        // 修改settings的contextEnterType值
        settings.contextEnterType = event.target.value
        // 将修改后的settings保存到settings.json
        animate.setSettings(settings)
      })
    }
    if (contextEntrancesDurationPicker) {
      contextEntrancesDurationPicker.value = settings.contextEntrancesDuration
      contextEntrancesDurationPicker.addEventListener('change', (event) => {
        // 修改settings的contextEntrancesDuration值
        settings.contextEntrancesDuration = event.target.value
        // 将修改后的settings保存到settings.json
        animate.setSettings(settings)
      })
    }
    /*todo 其他设置的值反写到页面,并且监听*/
  } catch (error) {
    log('[设置页面错误]', error)
  }
}
