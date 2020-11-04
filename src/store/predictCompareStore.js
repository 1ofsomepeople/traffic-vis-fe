import {action, observable} from 'mobx';
import {message} from 'antd';
import request from '../common/service'

class PredictCompareStore {
    // @observable historyGtDataList = [];
    @observable dataGt = []; // 历史真实数据
    @observable dataPred = []; // 历史预测数据

    @observable dataGtRTName = ''; // 实时数据名
    @observable dataGtRT = []; // 实时数据
     
    @observable dataPredLr = [];  // 预测数据 LR方法
    @observable dataPredSage = []; // 预测数据 Sage方法

    processJsonData(data){
        // 数据处理
        for (let i = 0, len = data.length; i < len; i++) {
            // 数据映射 1->1 3->150 7-175 10->200
            switch (data[i][2]) {
                case 3:
                    data[i][2] = 150;
                    break;
                case 7:
                    data[i][2] = 175;
                    break;
                case 10:
                    data[i][2] = 200;
                    break;
                default:
                    break;
            }
        }
        return data
    }

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
            resData = this.processJsonData(resData)
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

    // 加载实时拥堵数据
    @action async getRealTimeData(param){
        const res = await request.get('data')
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
            resData = this.processJsonData(resData)      
            data.data = resData
            data.datatime = res.jsonName
            this.dataGt = data
            console.log(res)
        }
    }

    // 清理数据 
    @action async clearAll(){
        this.dataGt = []
        this.dataPred = []
        this.dataGtRTName = ''; // 实时数据名
        this.dataGtRT = []; // 实时数据
        this.dataPredLr = [];  // 预测数据 LR方法
        this.dataPredSage = []; // 预测数据 Sage方法
    }
}


const predictCompareStore = new PredictCompareStore();
export default predictCompareStore;