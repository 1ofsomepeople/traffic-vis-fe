import {action, observable} from 'mobx';
import {message} from 'antd';
import request from '../common/service'
import {processJsonData} from '../common/apis'


class AnalysisStore {
    // @observable historyGtDataList = [];
    @observable dataGt = []; // 历史真实数据
    @observable dataPred = []; // 历史预测数据

    // @observable dataGtRTName = ''; // 实时数据名
    @observable dataGtRT = []; // 实时数据
     
    @observable dataPredLr = [];  // 预测数据 LR方法
    @observable dataPredSage = []; // 预测数据 Sage方法

    // 加载实时拥堵数据
    @action async getRealTimeData(param){
        const res = await request.get('data')
        // 初始化数据结构
        let data = {
            data: [],
            datatime: ''
        }
        if(res === undefined){
            message.error('数据 undefined')
        }
        else{
            let resData = res.data
            resData = processJsonData(resData)      
            data.data = resData
            data.datatime = res.jsonName
            this.dataGt = data
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


const analysisStore = new AnalysisStore();
export default analysisStore;