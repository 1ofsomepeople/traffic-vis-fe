import {action, observable} from 'mobx';
import {message} from 'antd';
import request from '../common/service'
import qs from 'qs';
import {processJsonData} from '../common/apis'

class PredictCompareStore {

    @observable dataLeft = []; // 左边地图数据
    @observable dataRight = []; // 右边地图的数据
    @observable loading = false; // loading状态
    
    // 可弃置
    // 根据本地json数据的路径加载history的gt和pred数据 
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
            this.dataLeft = data
        }
        else if(type === 'pred'){
            this.dataRight = data
        }
        else{
            message.warning('loaddata param error');
        }
    }

    // 加载history的拥堵GroundTruth数据
    @action async getHistoryGt(param){
        this.loading = true;
        const res = await request.get('data/history/gt' + '?' + qs.stringify(param))
        this.loading = false;
        if(res === undefined){
            message.error('后端数据 undefined')
        }
        else{
            let data = {
                data: [],
                datatime: ''
            } 
            let resData = res.data
            resData = processJsonData(resData) 
            data.data = resData
            data.datatime = res.jsonName
            this.dataLeft = data
            console.log(res)
        }

    }
    // 加载history的拥堵预测数据
    @action async getHistoryPred(param){
        this.loading = true;
        const res = await request.get('data/history/pred' + '?' + qs.stringify(param))
        this.loading = false;
        if(res === undefined){
            message.error('后端数据 undefined')
        }
        else{
            let data = {
                data: [],
                datatime: ''
            } 
            let resData = res.data
            resData = processJsonData(resData) 
            data.data = resData
            data.datatime = res.jsonName
            this.dataRight = data
            console.log(res)
        }
    }
    
    // 加载实时的拥堵预测数据
    // Lr方法
    @action async getPredLr(param){
        this.loading = true;
        const res = await request.get('data/predict/lr')
        this.loading = false;
        // 初始化数据结构
        let data = {
            data: [],
            datatime: ''
        }
        if(res === undefined){
            message.error('后端数据 undefined')
        }
        else{
            let resData = res.data
            resData = processJsonData(resData)      
            data.data = resData
            data.datatime = res.jsonName
            this.dataLeft = data
            console.log(res)
        }
    }
    // Sage方法
    @action async getPredSage(param){
        this.loading = true;
        const res = await request.get('data/predict/sage')
        this.loading = false;
        // 初始化数据结构
        let data = {
            data: [],
            datatime: ''
        }
        if(res === undefined){
            message.error('后端数据 undefined')
        }
        else{
            let resData = res.data
            resData = processJsonData(resData)      
            data.data = resData
            data.datatime = res.jsonName
            this.dataRight = data
            console.log(res)
        }
    }

    // 清理数据 
    @action async clearAll(){
        this.dataLeft = []; // 左边地图数据
        this.dataRight = []; // 右边地图的数据
    }
}


const predictCompareStore = new PredictCompareStore();
export default predictCompareStore;