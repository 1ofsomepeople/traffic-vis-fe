import axios from 'axios';
import {message} from 'antd';

const service = axios.create({
    // baseURL: 'http://39.105.49.28:5000/',  // 线上环境
    baseURL: 'http://127.0.0.1:5000/',  // 本地测试环境
    timeout: 120*1000,
    withCredentials:true, // 允许携带cookies
})

service.interceptors.response.use(
    response => {
        // console.log(response)
        return response.data
    },
    error => {
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