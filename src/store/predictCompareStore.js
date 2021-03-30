import {action, observable} from 'mobx';
import {message} from 'antd';
import request from '../common/service'
import qs from 'qs';
import {processJsonData} from '../common/apis'

class PredictCompareStore {
    //MobX 为现有的数据结构(如对象，数组和类实例)添加了可观察的功能。 
    //通过使用 @observable 装饰器(ES.Next)来给你的类属性添加注解就可以简单地完成这一切。
    @observable dataLeft = []; // 左边地图数据
    @observable dataRight = []; // 右边地图的数据
    @observable loading = false; // loading状态
    @observable scorePrecision = 0; // 准确率
    @observable scoreMAE = 0; // 平均绝对误差
    @observable scoreMAPE = 0; // 平均绝对百分比误差
    @observable precisionClear = 0; // 通畅准确率
    @observable precisionSlow = 0; // 缓行准确率
    @observable precisionJam = 0; // 拥堵准确率
    @observable precisionSlowJam = 0; // 缓行和拥堵的准确率
    
    // 可弃置
    // 根据本地json数据的路径加载history的gt和pred数据 
    //async & await
    @action async loaddata(jsonPath,type) {
        // 初始化数据结构
        let data = {
            data: [],
            datatime: ''
        }
        //请求数据
        let response = await fetch(jsonPath)
        let resData = await response.json();
        resData = resData.data
        //如果没拿到
        if (resData === undefined) {
            message.warning('获取数据失败');
        }
        //如果拿到了
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
        //...
        const res = await request.get('data/history/gt' + '?' + qs.stringify(param))
        this.loading = false;
        //...
        if(res === undefined){
            message.error('后端数据 undefined')
        }
        //...
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
        //qs.stringify()作用是将对象或者数组序列化成URL的格式
        //所以get()里面是一个url，并且下一行是在接收数据
        const res = await request.get('data/history/pred' + '?' + qs.stringify(param))
        this.loading = false;
        //...
        if(res === undefined){
            message.error('后端数据 undefined')
        }
        //...
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
            this.scorePrecision = res.scorePrecision
            this.scoreMAE = res.scoreMAE
            this.scoreMAPE = res.scoreMAPE
            this.precisionClear = res.precisionClear
            this.precisionSlow = res.precisionSlow
            this.precisionJam = res.precisionJam
            this.precisionSlowJam = res.precisionSlowJam
            console.log(res)
        }
    }
    
    // 向后端请求数据，并加载
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