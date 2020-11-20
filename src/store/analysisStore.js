import {action, observable} from 'mobx';
import {message} from 'antd';
import request from '../common/service'
import {processJsonData} from '../common/apis'


class AnalysisStore {
    @observable dataGt = []; // 实时的真实数据
    @observable loading = false; // loading状态

    // 加载实时拥堵数据
    @action async getRealTimeData(param){
        this.loading = true
        const res = await request.get('data')
        this.loading = false
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
            this.dataGt = data
            console.log(res)
        }
    }

    // 清理数据 
    @action async clearAll(){
        this.dataGt = [];
    }
}


const analysisStore = new AnalysisStore();
export default analysisStore;