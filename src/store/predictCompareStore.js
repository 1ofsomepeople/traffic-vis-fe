import {action, observable} from 'mobx';
import {message} from 'antd';

class PredictCompareStore {
    // @observable historyGtDataList = [];
    @observable data = [];
}


const predictCompareStore = new PredictCompareStore();
export default predictCompareStore;