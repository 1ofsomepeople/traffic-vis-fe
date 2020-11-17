import {action, observable} from 'mobx';
import {message} from 'antd';
import request from '../common/service'
import {processJsonData} from '../common/apis'

class PredictCompareStore {
    // @observable historyGtDataList = [];
    @observable dataGt = []; // 历史真实数据
    @observable dataPred = []; // 历史预测数据

    // @observable dataGtRTName = ''; // 实时数据名
    @observable dataGtRT = []; // 实时数据
     
    @observable dataPredLr = [];  // 预测数据 LR方法
    @observable dataPredSage = []; // 预测数据 Sage方法

    // 加载数据
    @action async loaddata(jsonPath,type) {
        // 初始化数据结构
        let data = {
            data: [],
            datatime: ''
        }
        let response = await fetch(jsonPath)
        let resData = await response.json();
        resData = resData.data
        if (resData === undefined) {
            message.warning('获取数据失败');
        }
        else {
            resData = processJsonData(resData)
            data.data = resData
            data.datatime = jsonPath.split('/')[jsonPath.split('/').length - 1].split('.')[0]
        }
        
        if(type === 'gt'){
            this.dataGt = data
        }
        else if(type === 'pred'){
            this.dataPred = data
        }
        else{
            message.warning('loaddata param error');
        }
    }

    // 加载拥堵预测数据
    // Lr方法
    @action async getPredLr(param){
        const res = await request.get('data/predict/lr')
        // 初始化数据结构
        let data = {
            data: [],
            datatime: ''
        }
        let resData = res.data
        if(res === undefined){
            message.error('数据 undefined')
        }
        else{
            resData = processJsonData(resData)      
            data.data = resData
            data.datatime = res.jsonName
            this.dataPredLr = data
            console.log(res)
        }
    }
    // Sage方法
    @action async getPredSage(param){
        const res = await request.get('data/predict/sage')
        // 初始化数据结构
        let data = {
            data: [],
            datatime: ''
        }
        let resData = res.data
        if(res === undefined){
            message.error('数据 undefined')
        }
        else{
            resData = processJsonData(resData)      
            data.data = resData
            data.datatime = res.jsonName
            this.dataPredSage = data
            console.log(res)
        }
    }

    // 清理数据 
    @action async clearAll(){
        this.dataGt = [];
        this.dataPred = [];
        // this.dataGtRTName = ''; // 实时数据名
        this.dataGtRT = []; // 实时数据
        this.dataPredLr = [];  // 预测数据 LR方法
        this.dataPredSage = []; // 预测数据 Sage方法
    }
}


const predictCompareStore = new PredictCompareStore();
export default predictCompareStore;