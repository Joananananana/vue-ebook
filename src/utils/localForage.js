import localForage from 'localforage'
// localforage 所有操作都是异步 存储的形式 key：value

// 向localForage中存入 cb:操作成功的回调函数 cb2:操作失败的回调函数
export function setLocalForage(key, data, cb, cb2) {
  localForage.setItem(key, data).then((value) => {
    if (cb) cb(value)
  }).catch(function (err) {
    if (cb2) cb2(err)
  })
}
// 根据key获取localForage中的数据  cb:
export function getLocalForage(key, cb) {
  localForage.getItem(key, (err, value) => {
    cb(err, value)
  })
}
// 根据key从localForage中移除数据 cb:操作成功的回调函数 cb2:操作失败的回调函数
export function removeLocalForage(key, cb, cb2) {
  localForage.removeItem(key).then(function () {
    if (cb()) cb()
  }).catch(function (err) {
    if (cb2()) cb2(err)
  })
}
// 情况localForage中数据 cb:操作成功的回调函数 cb2:操作失败的回调函数
export function clearLocalForage(cb, cb2) {
  localForage.clear().then(function () {
    if (cb) cb()
  }).catch(function (err) {
    if (cb2) cb2(err)
  })
}

// 获取localForage 长度
export function lengthLocalForage(cb) {
  localForage.length().then(
    numberOfKeys => {
      if (cb) cb(numberOfKeys)
      // console.log(numberOfKeys)
    // eslint-disable-next-line handle-callback-err
    }).catch(function (err) {
    // console.log(err)
  })
}

export function iteratorLocalForage() {
  localForage.iterate(function (value, key, iterationNumber) {
    // console.log([key, value])
  }).then(function () {
    // console.log('Iteration has completed')
  // eslint-disable-next-line handle-callback-err
  }).catch(function (err) {
    // console.log(err)
  })
}

// 检测是否支持indexedDB
export function support() {
  const indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || null
  if (indexedDB) {
    return true
  } else {
    return false
  }
}
