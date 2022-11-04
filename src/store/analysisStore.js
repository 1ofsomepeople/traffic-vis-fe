import {message} from 'antd';
import {action, observable} from 'mobx';
import request from '../common/service'
import {processJsonData} from '../common/apis'


class AnalysisStore {
  @observable dataGt = []; // 实时的真实数据
  @observable loading = false; // loading状态

  /**
   * action是一个工厂函数，可以接受name和fn两个参数，name是String，主要描述action的作用，
   * fn是Function，是这个action的具体逻辑。action执行后返回一个函数，调用这个函数就会执行
   * action，其实就是调用fn参数。
   */
  @action('加载实时拥堵数据')
  async getRealTimeData(param){
    this.loading = true
    const res = await request.get('data') // get()方法里的参数是用于请求的服务器 URL
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
      this.dataGt = data //! 这一行的作用是什么，this指向了谁
      console.log(res)
    }
  }


  @action('清理数据')
  async clearAll(){
    this.dataGt = [];
  }
}


const analysisStore = new AnalysisStore();
export default analysisStore;