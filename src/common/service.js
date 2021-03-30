/**
 * 什么是axios？
 * Axios 是一个基于 promise 的 HTTP 库，可以用在浏览器和 node.js 中。
 */

import { message } from 'antd';
import axios from 'axios';

/**
 * 使用自定义配置新建一个 axios 实例
 * `method` 是创建请求时使用的方法，如果没有指定 method，请求将默认使用 get 方法。
 * !`baseURL` 将自动加在 `url` 前面，除非 `url` 是一个绝对 URL。
 * 它可以通过设置一个 `baseURL` 便于为 axios 实例的方法传递相对 URL
 * `timeout` 指定请求超时的毫秒数(0 表示无超时时间)
 * 如果请求话费了超过 `timeout` 的时间，请求将被中断
 * `withCredentials` 表示跨域请求时是否需要使用凭证
 */
const service = axios.create({
    // baseURL: 'http://39.105.230.32:5000/',  // 线上环境
    baseURL: 'http://127.0.0.1:5000/',  // 本地测试环境
    timeout: 120*1000,
    withCredentials:true, // 允许携带cookies
})

/**
 * 拦截器:在请求或响应被 then 或 catch 处理前拦截它们。
 * 可以为自定义 axios 实例添加拦截器
 * const instance = axios.create();
 * instance.interceptors.request.use();
 */
// 添加响应拦截器
service.interceptors.response.use(
    response => {
        // 对响应数据做点什么
        // console.log(response)
        return response.data
    },
    error => {
        // 对响应错误做点什么
        console.log('error', error, error.response)
        let response = error.response;
        if(response === undefined){
            message.error('undefined 加载后台数据出错');
        }
        else{
            let errmessage = [response.status,response.statusText].join(',')
            message.error('错误信息:' + errmessage)
        }
    }
)

export default service