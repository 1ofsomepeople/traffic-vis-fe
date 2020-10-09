import {action, observable} from 'mobx';
import {message} from 'antd';

class PredictCompareStore {
    // @observable historyGtDataList = [];
    @observable dataGt = [];
    @observable dataPred = [];

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
            // 数据处理
            for (let i = 0, len = resData.length; i < len; i++) {
                // 数据映射 1->1 3->150 7-175 10->200
                switch (resData[i][2]) {
                    case 3:
                        resData[i][2] = 150;
                        break;
                    case 7:
                        resData[i][2] = 175;
                        break;
                    case 10:
                        resData[i][2] = 200;
                        break;
                    default:
                        break;
                }
            }
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
}


const predictCompareStore = new PredictCompareStore();
export default predictCompareStore;