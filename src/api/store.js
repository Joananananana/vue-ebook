import axios from 'axios'
import {
  setLocalForage
} from '../utils/localForage'

export function home() {
  return axios({
    method: 'get',
    url: `${process.env.VUE_APP_BASE_URL}/book/home`
  })
}
export function shelf() {
  return axios({
    method: 'get',
    url: `${process.env.VUE_APP_BASE_URL}/book/shelf`
  })
}
// 请求在线数据
export function detail(book) {
  return axios({
    method: 'get',
    url: `${process.env.VUE_APP_BOOK_URL}/book/detail`,
    params: {
      fileName: book.fileName
    }
  })
}
// 请求mock模拟数据
export function list() {
  return axios({
    method: 'get',
    url: `${process.env.VUE_APP_BASE_URL}/book/list`
  })
}
// 下载书籍到离线缓存
/**
 * @param {*} book 需要缓存的book对象
 * @param {*} onSuccess 成功的回调函数
 * @param {*} onError 失败的回调函数
 * @param {*} onProgress 下载进度回调函数 能获取实时下载进度
 */
export function download(book, onSuccess, onError, onProgress) {
  if (!onProgress) {
    onProgress = onError
    onError = null
  }
  return axios.create({
      baseURL: process.env.VUE_APP_EPUB_URL,
      method: 'get',
      responseType: 'blob',
      timeout: 180 * 1000,
      // 下载进度
      onDownloadProgress: ProgressEvent => {
        if (onProgress) onProgress(ProgressEvent)
      }
    }).get(`${book.categoryText}/${book.fileName}.epub`)
    .then(res => {
      // console.log(res)
      // res  data: Blob, status: 200, statusText: "OK"...
      // 请求的电子书为blob类型 在res.data中
      const blob = new Blob([res.data])
      // 将下载的电子书 存储到localForage
      setLocalForage(book.fileName, blob, () => {
        if (onSuccess) {
          onSuccess(book)
        }
      }, err => {
        if (onError) onError(err)
      })
    }).catch(err => {
      if (onError) {
        onError(err)
      }
    })
}
