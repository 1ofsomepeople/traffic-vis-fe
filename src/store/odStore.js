import {action, observable} from 'mobx';
import {message} from 'antd';
import request from '../common/service'
import qs from 'qs';
import {processJsonData} from '../common/apis'

class OdStore {
  // MobX 为现有的数据结构(如对象，数组和类实例)添加了可观察的功能。
  // 通过使用 @observable 装饰器(ES.Next)来给你的类属性添加注解就可以简单地完成这一切。
  @observable dataLeft = []; // 左边热力图数据
  @observable dataRight = []; // 右边热力图的数据
  @observable loading = false; // loading状态
  @observable scoreMAE = 0; // 平均绝对误差
  @observable scoreRMSE = 0; // 均方根误差

  // 可弃置
  // 根据本地json数据的路径加载history的gt和pred数据
  // async & await
  @action async loaddata(jsonPath, type) {
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

  // 向后端请求历史OD数据
  @action async getOdGt(param){
    this.loading = true;
    //...
    const res = await request.get('data/od/history/' + '?' + qs.stringify(param))
    this.loading = false;
    //...
    if(res === undefined){
      message.error('后端数据 undefined')
    }
    //...
    else{
      let data = {
        data1D: [],
        data3D: [],
        datatime: ''
      }
      let resData = res.data
      // resData = processJsonData(resData)
      data.data1D = resData.data1D
      data.data3D = resData.data3D
      data.datatime = res.jsonName //NOTE: 预测时间设置
      this.dataLeft = data
      console.log(res)
    }
  }

  // 向后端请求预测OD数据
  @action async getOdPred(param){
    this.loading = true;
    // qs.stringify()作用是将对象或者数组序列化成URL的格式
    // 所以get()里面是一个url，并且下一行是在接收数据
    const res = await request.get('data/od/pred' + '?' + qs.stringify(param))
    this.loading = false;
    //...
    if(res === undefined){
      message.error('后端数据 undefined')
    }
    //...
    else{
      let data = {
        data1D: [],
        data3D:[],
        datatime: ''
      }
      let resData = res.data
      // resData = processJsonData(resData) //FIXME: 无需对数据做离散化处理
      data.data1D = resData.data1D
      data.data3D = resData.data3D
      data.datatime = res.jsonName
      this.dataRight = data
      this.scoreMAE = res.scoreMAE //TODO: 后端没有返回数据！
      this.scoreRMSE = res.scoreRMSE
      console.log(res)
    }
  }


  // 清理数据
  @action async clearAll(){
    this.dataLeft = []; // 左图数据
    this.dataRight = []; // 右图数据
  }
}


const odStore = new OdStore();
export default odStore;