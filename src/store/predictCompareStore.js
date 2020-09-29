import {action, observable} from 'mobx';
import {message} from 'antd';

class PredictCompareStore {
    // @observable historyGtDataList = [];
    @observable data = 'test';
}


const predictCompareStore = new PredictCompareStore();
export default predictCompareStore;