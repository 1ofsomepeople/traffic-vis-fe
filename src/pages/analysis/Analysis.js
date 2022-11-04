import * as d3 from 'd3';
import echarts from 'echarts';
import mapboxgl from 'mapbox-gl';
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { ArrowUpOutlined, ArrowDownOutlined, AlertOutlined } from '@ant-design/icons';
import { Row, Col, Button, PageHeader, message, Statistic, Progress, Card, Timeline, Descriptions, Popover } from 'antd';
import './Analysis.css'
import Pie from '../../common/basicCharts/Pie';
import Line from '../../common/basicCharts/Line';
import EchartsMapBoxVis from '../../common/EchartsMapBoxVis';
import JamScoreDash from '../../common/basicCharts/JamScoreDash';
import { dataStr_dataObj, dataObj_dataStr, loadDataList, throttle, debounce } from '../../common/apis';

// 修饰器（Decorator）是一个函数，用来修改类的行为
// 修饰器函数的第一个参数，就是所要修饰的目标类

// mobx立足于react的context实现了inject语法，通过简洁的api，可以在
// 任何想要使用全局状态的地方注入变量。为了方便进行全局的状态管理，往往
// 设定一个全局的store,其中定义一些全局都会使用到的变量，进行状态控制
// 相当于Provider 的高阶组件。可以用来从 React 的context中挑选 store 作为 prop 传递给目标组件。
// 这里使用装饰器语法，通过字符串的方式注入全局store，组件的this上将会添加属性store
@inject('store')

// MobX 为现有的数据结构(如对象，数组和类实例)添加了可观察的功能。
// 通过使用 @observable 装饰器(ES.Next)来给你的类属性添加注解就可以简单地完成这一切
@observer

// 仅定义一个名为“Analysis”的类组件
class Analysis extends Component {
  constructor(props) {
    super(props)
    //AnalysisStore类的实例analysisStore，查看./store/analysisStore.js
    this.store = props.store.analysisStore
    this.state = {
      // 模拟数据
      data: {
        data: [
          [116.368608, 39.901744, 150],
          [116.378608, 39.901744, 350],
          [116.388608, 39.901744, 500],
        ],
        datatime: ''
      },
      dataType: 'history',
      chartsParam: {
        // titleText: "交通拥堵情况三维柱状图",
      },
      titleText: "",
      // 展示额外信息的组件的显示和隐藏
      // 0 默认 不展示
      // 1 城市级
      // 2 道路级
      // 3 节点级
      extraInfoSwitch: 0, // 额外信息
      extraInfoLineData: '', // 额外信息折线图数据数组
      extraInfoLineDataxAxis: '', // 额外信息折线图数据横坐标轴数组
      pointLineTitle: "" , // 节点折线图标题
      pointLineData: '', // 节点折线图数据数组
      pointLineDataxAxis: '', // 节点折线图数据 横坐标轴数组
    }
    window.mapboxgl = mapboxgl;
    this.DataNameList = null // 轮播的数据name list
    this.dataListIndex = 0 // 遍历数据list的index，在intervalPlay()和onClickBtn6()中被使用
    this.isplaying = false // 数据是否正在轮播
    this.mapRef = React.createRef(); // ref
    this.mapbox = null // mapbox实例
    // window.mapboxgl = mapboxgl;

    // 为了在回调中使用 `this`，这个绑定是必不可少的，https://blog.csdn.net/AiHuanhuan110/article/details/106424812
    this.loaddata = this.loaddata.bind(this)
    this.onClickBtn1 = this.onClickBtn1.bind(this)
    this.onClickBtn2 = this.onClickBtn2.bind(this)
    this.onClickBtn3 = this.onClickBtn3.bind(this)
    this.onClickBtn4 = this.onClickBtn4.bind(this)
    this.onClickBtn5 = this.onClickBtn5.bind(this)
    this.onClickBtn6 = this.onClickBtn6.bind(this)
    this.onClickBtn7 = this.onClickBtn7.bind(this)
    this.resizeAllCharts = this.resizeAllCharts.bind(this)
  };


  /**
   * async作为一个关键字放在函数的前面，表示该函数是一个异步函数，意味
   * 着该函数的执行不会阻塞后面代码的执行异步函数的调用跟普通函数一样。
   * loaddata()修改状态返回一个data对象，包含属性data与datatime。但是
   * 目前未使用过返回值。
   * 但是loaddata()修改了状态state，这会引起render的重新渲染
   */
  async loaddata(jsonPath) {
    // 初始化数据结构
    let data = {
      data: [],
      datatime: ''
    }
    /**
     * Fetch API 提供了一个获取资源的接口（包括跨域请求）
     * fetch()必须接受一个参数——资源的路径。无论请求成功与否，它都返回一个Promise对象
     * Promise 对象代表了未来将要发生的事件，用来传递异步操作的消息。
     * 最简单的用法是只提供一个参数用来指明想 fetch() 到的资源路径，
     * 然后返回一个包含响应结果的promise（一个 Response 对象）。
     * 当然它只是一个 HTTP 响应，而不是真的JSON。为了获取JSON的内容，我们需要使用 .json() 方法
     */
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
    this.setState({
      data: data,
      dataType: 'history',
      titleText: "交通拥堵情况三维柱状图",//点击“测试数据”按钮后出现在地图左上方的标题
    })
    return data
  }

  // 调用loaddata()，并且每次loaddata()的参数（文件路径）都不一样。修改了属性intervalID
  intervalPlay(DataNameList) {
    /**
     * setInterval()主要包含两个参数，第一个参数就是定时器需要定时执行的函数
     * 第二参数是一个单位为毫秒的数值。
     * 该方法表示每隔由第二个参数设定的毫秒数，就执行第一个参数指定的操作。
     * setInterval() 执行后将返回一个唯一的数值ID
     * setInterval() 方法会不停地调用函数，直到 clearInterval() 被调用或窗口被关闭。
     * 由 setInterval() 返回的 ID 值可用作 clearInterval() 方法的参数。
     */
    // this.dataListIndex的值会陷入循环，直到被重置
    this.intervalID = setInterval(() => {
      let path = './testDataList/' + DataNameList[this.dataListIndex > DataNameList.length ? this.dataListIndex = 0 : this.dataListIndex++]
      this.loaddata(path)
    }, 500)
  }


  // 重置地图，更新摄像机视角，被“onClickBtn6()”调用，没有返回值
  resetCamera = () => {
    this.setState({
      ...this.state,
      flyActionParam: [116.368608, 39.901744, 10, 60, -30, 1000],//此参数出现在地图组件“EchartsMapBoxVis”中
    })
  }


  // 调整charts大小，没有返回值
  resizeAllCharts() {
    this.echartsMapContainer = echarts.init(document.getElementById("mapContainer"))
    this.echartsMapContainer.resize();
    echarts.init(document.getElementById("pie1")).resize();
    echarts.init(document.getElementById("line1")).resize();
    echarts.init(document.getElementById("dash1")).resize();
    echarts.init(document.getElementById("line2")).resize();
    echarts.init(document.getElementById("linePoint")).resize();
    echarts.init(document.getElementById("pointLineInfo")).resize();
  }


  //!(1) 测试数据
  // 更改状态，调整图表大小，没有返回值
  onClickBtn1() {
    let hourData = [38, 40, 46, 46, 38, 55, 36, 30, 22, 26, 38, 34,
            74, 47, 15, 31, 47, 32, 23, 28, 64, 28, 38, 46]

    // X轴刻度线数组 24小时,["00:00","01:00",...,"23:00"]
    let timeStrList = []
    for (let index = 0; index < 24; index++) {
      let strHour = index.toString()
      if (index < 10) {
        strHour = '0' + strHour
      }
      let strMinute = '00'
      let strTime = strHour + ':' + strMinute
      timeStrList.push(strTime)
    }

    // 调用loaddata()函数后，this的状态发生变化
    this.loaddata("./2019-04-02_09-00.json")

    //! setState()函数接受两个参数，第一个参数接受一个对象，就是设置的状态，
    //! 第二个接受一个回调函数，它在设置状态成功之后执行。我们可以通过回调函数拿到最新的state值。
    this.setState({
      ...this.state,
      extraInfoSwitch: 1,
      extraInfoLineData: hourData, // 额外信息折线图数据数组
      extraInfoLineDataxAxis: timeStrList, // 额外信息折线图数据横坐标轴数组
    }, () => {
      this.resizeAllCharts()
      console.log(this.state.extraInfoLineData)
    })
  }


  //!(2) 数据轮播
  // 通过在button按钮的回调函数中使用防抖函数，实现周期性设置、清除定时器
  //! 当状态发生改变后，是怎么渲染在地图上的？哪个组件？哪个节点？
  onClickBtn2() {
    // this.setState({
    //   ...this.state,
    //   flyActionParam: null
    // })
    if (this.intervalID) {
      clearInterval(this.intervalID);
      clearTimeout(this.timeoutID)
      this.intervalID = null
      this.isplaying = false
    }
    else {
      this.isplaying = true
      let startTimeStr = "2019-04-02_08-30"
      let endTimeStr = "2019-04-02_09-30"
      this.DataNameList = loadDataList(startTimeStr, endTimeStr)
      this.intervalPlay(this.DataNameList)
    }
  }


  //!(3) 加载实时交通数据
  //
  onClickBtn3() {
    this.store.getRealTimeData() // analysisStore的类方法
    this.setState({
      ...this.state,
      dataType: 'realtime',
      titleText: "交通实时拥堵情况三维柱状图",
      extraInfoSwitch: 0,
    }, () => {
      this.resizeAllCharts()
    })
  }


  //!(4) 局部展示
  onClickBtn4() {
    if (this.intervalID) {
      clearInterval(this.intervalID);
      this.intervalID = null
    }

    this.setState({
      ...this.state,
      flyActionParam: [116.360163, 40.001514, 14, 60, -45, 1000]
    }, () => {
      if (this.DataNameList && this.isplaying) {
        //setTimeout() 方法用于在指定的毫秒数后调用函数或计算表达式。
        //setTimeout() 只执行 code 一次。
        //使用clearTimeout() 方法来阻止函数运行
        this.timeoutID = setTimeout(() => {
          this.intervalPlay(this.DataNameList)
          this.setState({
            ...this.state,
            flyActionParam: null
          })
        }, 2000)
      }
    })
  }


  //!(5) 全局展示
  onClickBtn5() {
    if (this.intervalID) {
      clearInterval(this.intervalID);
      this.intervalID = null
    }

    this.setState({
      ...this.state,
      flyActionParam: [116.420608, 39.851744, 11.5, 60, -30, 1000]
    }, () => {
      if (this.DataNameList && this.isplaying) {
        this.timeoutID = setTimeout(() => {
          this.intervalPlay(this.DataNameList)
          this.setState({
            ...this.state,
            flyActionParam: null
          })
        }, 2000)
      }
    })
  }


  //!(6) 地图重置
  onClickBtn6() {
    this.store.clearAll()
    this.setState({
      data: {
        data: [],
        datatime: ''
      },
      titleText: "",
      // flyActionParam: [116.368608, 39.901744, 10, 60, -30, 1000],
      extraInfoSwitch: 0,
    }, () => {
      this.resizeAllCharts()
      this.resetCamera()
    })

    clearInterval(this.intervalID);
    clearTimeout(this.timeoutID)
    this.timeoutID = null
    this.intervalID = null
    this.DataNameList = null
    this.dataListIndex = 0

    // 清除mapbox图层和数据源
    if (this.mapbox.getLayer('line')) {
      this.mapbox.removeLayer('line')
      this.mapbox.removeSource('line')
      this.mapbox.removeLayer('linePoint')
      this.mapbox.removeSource('linePoint')
    }
    if (this.mapbox.getLayer('points')) {
      this.mapbox.removeLayer('points')
      this.mapbox.removeSource('points')
    }
  }


  //!(7) 线路分析
  onClickBtn7() {
    // 清除mapbox图层和数据源
    if (this.mapbox.getLayer('line')) {
      this.mapbox.removeLayer('line')
      this.mapbox.removeSource('line')
      this.mapbox.removeLayer('linePoint')
      this.mapbox.removeSource('linePoint')
    }
    if (this.mapbox.getLayer('points')) {
      this.mapbox.removeLayer('points')
      this.mapbox.removeSource('points')
    }

    let color = [
      '#ff0000', // red
      '#feb64d', // yello
      '#369674', // green
    ]

    // 中关村东路工作日每分钟的数据 1440个
    let daySpeedData1440 = [43, 35, 26, 27, 35, 41, 41, 41,
      41, 41, 41, 41, 41, 40, 33, 29, 22, 22, 22, 22, 34, 34, 34, 34, 34, 68, 68, 68, 68, 68, 68, 68, 54, 54, 54, 54, 54, 54, 54, 34, 24, 28, 28, 40, 36, 56, 56, 56, 56, 56, 56, 56, 56, 56, 56, 50, 50, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 36, 41, 43, 29, 41, 41, 41, 31, 31, 31, 31, 31, 31, 31, 31, 33, 31, 40, 36, 28, 28, 25, 27, 27, 28, 28, 28, 28, 28, 27, 41, 28, 28, 28, 24, 40, 40, 40, 30, 30, 55, 55, 55, 55, 55, 55, 55, 46, 46, 47, 47, 47, 36, 34, 34, 35, 35, 35, 35, 35, 35, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 28, 40, 28, 28, 28, 34, 34, 34, 34, 56, 28, 28, 28, 28, 28, 31, 50, 47, 41, 41, 28, 28, 28, 28, 28, 28,
      28, 28, 28, 38, 38, 38, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 50, 50, 27, 30, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 30, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 30, 35, 41, 41, 41, 41, 41, 41, 39, 35, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 31, 37, 37, 35, 35, 28, 55, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 29, 21, 55, 41, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 25, 31, 31, 31, 31, 31, 40, 29, 29, 29, 29, 29, 29, 29, 29, 29, 28, 28, 28, 28, 28, 28, 28, 30, 34, 34, 34, 34, 51, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 27, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 43, 43, 43, 39, 36, 36, 36, 36, 35, 35, 35,
      40, 40, 40, 40, 40, 40, 17, 41, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 13, 56, 35, 36, 36, 31, 31, 28, 35, 18, 14, 14, 14, 19, 22, 19, 18, 22, 21, 25, 25, 25, 5, 5, 5, 5, 34, 17, 28, 28, 28, 28, 28, 28, 28, 35, 35, 15, 15, 15, 15, 34, 55, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 31, 31, 31, 31, 32, 40, 27, 8, 14, 14, 16, 16, 16, 15, 80, 80, 31, 29, 29, 29, 29, 29, 29, 29, 29, 20, 21, 68, 68, 28, 28, 29, 29, 34, 34, 15, 15, 17, 25, 25, 25, 25, 35, 31, 70, 70, 27, 38, 36, 36, 28, 28, 28, 17, 27, 12, 12, 40, 17, 31, 31, 29, 29, 29, 28, 10, 10, 10, 10, 10, 10, 10, 10, 30, 43, 40, 36, 29, 32, 29, 29, 35, 10, 26, 26, 26, 26, 23, 29, 23, 23, 21, 17, 41, 41, 41, 41, 40, 54, 30, 30, 40, 40, 40, 20, 20, 22, 21, 40, 40, 31, 37, 37, 37, 16, 31, 31, 31, 35, 8, 22, 25, 29, 43, 34, 29, 36, 27, 22, 16, 40, 43, 46, 33, 46, 14, 34, 31, 34, 32, 31, 31, 31, 27, 15, 20, 12, 22, 23, 31, 31, 15, 26, 29, 15, 31, 35, 24, 31, 23, 32, 32, 31, 14, 17, 17, 20, 12, 25, 24, 25, 32, 16, 24, 20, 26, 27, 32, 68, 20, 27, 43, 40, 11, 21, 31, 21, 55, 7, 38, 25, 40, 28, 40, 47, 47, 51, 56, 40, 46, 35, 32, 39, 28, 26, 43, 40, 40, 28, 28, 34, 16, 36, 34, 31, 31, 40, 56, 56, 31, 27, 27, 27, 28, 21, 28, 38, 38, 31, 28, 16, 20, 20, 27, 27, 27, 29, 29, 22, 35, 38, 38, 38, 38, 29, 14, 26, 25, 25, 28, 28, 46, 32, 32, 70, 21, 21, 28, 50, 50, 50, 50, 46, 46, 18, 18, 43, 43, 43, 31, 31, 35, 35, 35, 35, 35, 35, 22, 24, 32, 34, 29, 40, 25, 34, 15, 46, 18, 40, 27, 28, 28, 92, 92, 37, 40, 40, 40, 40, 91, 40, 40, 40, 33, 10, 29, 35, 22, 24, 24, 25, 36, 50, 43, 40, 37, 25, 22, 22, 22, 68, 47, 26, 26, 26, 26, 26, 43,
      43, 43, 33, 29, 59, 54, 54, 40, 33, 32, 50, 50, 23, 30, 32, 34, 34, 34, 50, 91, 34, 24, 26, 29, 28, 36, 36, 36, 21, 54, 46, 37, 37, 27, 27, 28, 27, 16, 29, 31, 26, 21, 22, 31, 26, 50, 50, 36, 38, 28, 28, 35, 35, 39, 30, 35, 47, 37, 94, 40, 21, 21, 29, 29, 35, 40, 31, 41, 54, 46, 40, 40, 35, 32, 32, 31, 50, 32, 32, 43, 43, 43, 38, 38, 81, 25, 28, 30, 17, 17, 46, 46, 35, 33, 33, 17, 31, 31, 31, 34, 5, 13, 13, 22, 21, 17, 35, 25, 21, 21, 25, 5, 5, 5, 35, 36, 33, 34, 32, 32, 29, 29, 37, 46, 46, 33, 22, 22, 30, 30, 30, 30, 30, 35, 35, 37, 27, 17, 17, 64, 29, 38, 38, 32, 29, 28, 28, 34, 34, 38, 46, 46, 46, 16, 28, 28, 28, 28, 28, 26, 31, 31, 31, 22, 29, 35, 35, 35, 22, 28, 28, 23, 41, 32, 33, 38, 36, 34, 37, 40, 40, 31, 38, 38, 31, 31, 29, 26, 29, 33, 33, 31, 31, 30, 43, 31, 31, 28, 23, 8, 26, 56, 47, 47, 47, 34, 27, 19, 18, 18, 24, 25, 26, 20, 18, 17, 34, 31, 14, 14, 14, 14, 29, 40, 40, 40, 46, 46, 13, 10, 8, 8, 21, 31, 27, 30, 27, 27, 34, 34, 34, 34, 26, 26, 35, 29, 13, 18, 32, 23, 5, 12, 20, 20, 20, 20, 39, 30, 29, 29, 29, 29, 17, 29, 29, 29, 29, 17, 17, 17, 6, 6, 13, 28, 28, 28, 28, 28, 20, 14, 14, 14, 22, 17, 37, 32, 28, 28, 40, 27, 32, 28, 28, 30, 15, 26, 35, 36, 36, 36, 27, 11, 11, 11, 11, 11, 11, 31, 25, 40, 32, 25, 25, 27, 36, 25, 25, 39, 32, 32, 32, 32, 32, 22, 21, 40, 34, 34, 34, 29, 29, 40, 31, 17, 17, 17, 17, 39, 56, 8, 32, 32, 37, 30, 24, 22, 22, 33, 33, 33, 33, 40, 40, 27, 25, 20, 59, 56, 62, 51, 26, 38, 38, 38, 38, 62, 26, 35, 29, 27, 29, 28, 28, 27, 25, 25, 25, 22, 29, 24, 24, 24, 36, 36, 39, 21, 21, 36, 36, 36, 34, 25, 30, 30, 28, 28, 28, 23, 23, 23,
      31, 32, 43, 18, 31, 31, 15, 15, 30, 26, 28, 28, 17, 27, 50, 50, 50, 36, 29, 20, 20, 46, 38, 38, 38, 28, 91, 91, 40, 19, 28, 54, 27, 27, 27, 27, 27, 46, 46, 46, 46, 46, 18, 18, 43, 38, 38, 34, 34, 34, 34, 36, 27, 46, 25, 29, 29, 26, 26, 26, 26, 26, 43, 32, 30, 31, 19, 20, 28, 91, 91, 35, 46, 10, 34, 46, 46, 46, 23, 26, 26, 26, 26, 26, 46, 31, 17, 17, 21, 36, 32, 34, 37, 37, 37, 37, 31, 22, 22, 22, 22, 22, 40, 40, 40, 31, 35, 26, 26, 64, 31, 36, 35, 35, 28, 28, 37, 26, 26, 26, 37, 37, 37, 37, 37, 37, 26, 26, 35, 43, 43, 40, 47, 47, 47, 47, 47, 47, 47, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 34, 34, 31, 37, 80, 80, 80, 33, 33, 40, 40, 40, 40, 43, 53, 53, 72, 72, 72, 40, 40, 37, 32, 41, 29, 40, 64, 22, 21, 21, 21, 21, 21, 21, 35, 36, 40, 43, 37, 31, 31, 31, 32, 40, 40, 40, 40, 40, 40, 40, 51, 36, 36, 36, 36, 38, 41, 37, 37, 37, 37, 37, 37, 46, 37, 34, 36, 36, 36, 36, 36,
      38, 38, 47, 40, 40, 34, 34, 50, 50, 29, 37, 27, 43]

    // 24小时交通数据
    let hourData = []
    for (let index = 0; index < daySpeedData1440.length; index += 60) {
      hourData.push(daySpeedData1440[index])
    }

    // X轴刻度线数组 ['00:00','01:00',...,'23:00']
    let timeStrList = []
    for (let index = 0; index < 24; index++) {
      let strHour = index.toString()
      if (index < 10) {
        strHour = '0' + strHour
      }
      let strMinute = '00'
      let strTime = strHour + ':' + strMinute
      timeStrList.push(strTime)
    }

    this.setState({
      ...this.state,
      titleText: "道路拥堵情况",
      extraInfoSwitch: 2,
      extraInfoLineData: hourData, // 额外信息折线图数据数组
      extraInfoLineDataxAxis: timeStrList, // 额外信息折线图数据横坐标轴数组
    }, () => {
      this.resizeAllCharts()
    })

    let speedValue = [20, 59, 34, 40, 27, 39, 41] // 暂未使用的变量

    // 道路测试数据
    let geojson = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {
            'color': color[0]
          },
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [116.326534, 39.993866],
              [116.326624, 39.991486],
            ],
          }
        },
        {
          "type": "Feature",
          "properties": {
            'color': color[2]
          },
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [116.326624, 39.991486],
              [116.326964, 39.984936],
            ],
          }
        },
        {
          "type": "Feature",
          "properties": {
            'color': color[1]
          },
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [116.326964, 39.984936],
              [116.327105, 39.982096],
            ],
          }
        },
        {
          "type": "Feature",
          "properties": {
            'color': color[1]
          },
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [116.327105, 39.982096],
              [116.327225, 39.979745],
            ],
          }
        },
        {
          "type": "Feature",
          "properties": {
            'color': color[1]
          },
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [116.327225, 39.979745],
              [116.327405, 39.975575],
            ],
          }
        },
        {
          "type": "Feature",
          "properties": {
            'color': color[1]
          },
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [116.327405, 39.975575],
              [116.327585, 39.972785],
            ],
          }
        },
        {
          "type": "Feature",
          "properties": {
            'color': color[2]
          },
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [116.327585, 39.972785],
              [116.327895, 39.966405]
            ],
          }
        },
      ]
    };

    // 道路路段中点点测试数据
    let roadPointsgeojson = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>双清路 至 成府路</strong><p>拥堵，时速20公里</p>",
            "icon": "bar"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.326579, 39.992676]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>成府路 至 北四环西路辅路</strong><p>畅通，时速59公里</p>",
            "icon": "bar"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.326794, 39.988151]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>北四环西路辅路 至 中关村南一条</strong><p>缓慢，时速34公里</p>",
            "icon": "bar"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.3270595, 39.983146]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>中关村南一条 至 中关村南路</strong><p>缓慢，时速40公里</p>",
            "icon": "bar"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.327185, 39.98055]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>中关村南路 至 知春路</strong><p>缓慢，时速27公里</p>",
            "icon": "bar"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.327315, 39.97766]
          }
        },
      ]
    };

    let centerPoint = geojson.features[geojson.features.length >> 1].geometry.coordinates[0]
    // setup the viewport
    this.mapbox.jumpTo({
      'center': centerPoint,
      'zoom': 13,
      'pitch': 0,
      'bearing': 0,
    });

    if (this.mapbox.getLayer('line')) {
      console.log('mapbox line layer exist')
    }
    else {
      // addSource(id, source),为地图的样式添加数据源
      // id(string)添加数据源的ID。不能和存在的数据源冲突
      // source(Object)数据源对象，遵从Mapbox样式说明的 数据源定义 或 CanvasSourceOptions
      // returns: Map:this
      // https://docs.mapbox.com/mapbox-gl-js/example/geojson-markers/
      this.mapbox.addSource('line', {
        type: 'geojson',
        lineMetrics: true,
        data: geojson
      });
      // addLayer(layer, beforeId?),添加一个 Mapbox 样式的图层到地图样式。
      // 图层为来自特定数据源的数据定义样式。
      // layer((Object | CustomLayerInterface))需要添加的样式图层，符合 Mapbox 样式规范的 图层定义 。
      // beforeId(string?)用来插入新图层的现有图层 ID。 如果该参数（argument）被省略，
      // 该图层将会被添加到图层数组的末尾。
      // returns: Map:this
      // https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/
      // the layer must be of type 'line'
      this.mapbox.addLayer({
        type: 'line',
        source: 'line',
        id: 'line',
        paint: {
          // 'line-gap-width': 1,
          'line-opacity': 0.8,
          'line-color': ['get', 'color'],
          'line-width': 8,
        },
        layout: {
          'line-cap': 'butt',
          'line-join': 'miter',
        }
      });


      this.mapbox.addSource('linePoint', {
        type: 'geojson',
        lineMetrics: true,
        data: roadPointsgeojson
      });
      // 添加路段注释点图层
      this.mapbox.addLayer({
        type: 'symbol',
        id: 'linePoint',
        source: 'linePoint',
        "layout": {
          "icon-image": "{icon}-15",
          "icon-allow-overlap": true
        }
      });


      //on(type,layerId,listener)
      //为发生在特定样式图层要素上的特定事件添加监听器。
      //type(string)监听的事件类型
      //layerId(string)样式层的ID。只有事件发生在图层可见要素上时才会触发监听器
      //listener(Function)事件被触发时调用的函数
      //returns: Map:this
      this.mapbox.on('click', 'linePoint', (e) => {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties.description;
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        // Populate the popup and set its coordinates
        // based on the feature found.
        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(description)
          .addTo(this.mapbox);
      });
      // Change the cursor to a pointer when the mouse is over the places layer.
      // 回调函数要用箭头函数，否则会改变this的指向
      this.mapbox.on('mouseenter', 'linePoint', () => {
        //getCanvas():返回地图的 <canvas> 元素。
        this.mapbox.getCanvas().style.cursor = 'pointer';
      });
      this.mapbox.on('mouseleave', 'linePoint', () => {
        this.mapbox.getCanvas().style.cursor = '';
      });
    }
  }


  //!(8) 节点分析
  onClickBtn8 = () => {
    // 清除mapbox图层和数据源
    if (this.mapbox.getLayer('line')) {
      this.mapbox.removeLayer('line')
      this.mapbox.removeSource('line')
      this.mapbox.removeLayer('linePoint')
      this.mapbox.removeSource('linePoint')
    }
    if (this.mapbox.getLayer('points')) {
      this.mapbox.removeLayer('points')
      this.mapbox.removeSource('points')
    }

    // 三元桥工作日
    let testData1 = [42, 47, 48, 46, 47, 34, 45, 30, 43, 48, 44, 49, 40, 46, 41, 38, 41,
      43, 48, 47, 34, 47, 47, 41, 34, 46, 47, 37, 46, 49, 48, 42, 43, 62, 48, 41, 49, 48, 43, 42, 35, 49, 32, 36, 40, 46, 45, 49, 47, 44, 31, 49, 53, 48, 48, 44, 60, 54, 50, 43, 43, 43, 42, 58, 36, 50, 47, 54, 39, 43, 76, 57, 48, 33, 40, 47, 70, 51, 47, 51, 43, 41, 45, 30, 35, 40, 51, 36, 64, 65, 39, 39, 66, 43, 45, 62, 65, 39, 63, 66, 44, 34, 47, 56, 55, 40, 45, 53, 34, 51, 42, 41, 34, 32, 52, 35, 36, 92, 51, 55, 61, 55, 37, 46, 37, 60, 45, 34, 47, 51, 52, 32, 38, 57, 60, 54, 59, 49, 47, 60, 44, 41, 53, 68, 52, 76, 36, 68, 60, 60, 61, 71, 52, 55, 37, 37, 52, 55, 41, 45, 73, 37, 43, 43, 65, 59, 58, 75, 74, 62,
      52, 33, 44, 33, 33, 34, 57, 58, 64, 64, 64, 32, 64, 64, 46, 48, 59, 64, 37, 38, 45, 45, 57, 43, 31, 89, 80, 75, 67, 67, 45, 45, 40, 43, 33, 36, 36, 67, 67, 30, 42, 42, 42, 42, 42, 42, 42, 51, 51, 92, 56, 58, 41, 41, 70, 70, 70, 40, 42, 45, 33, 47, 44, 47, 28, 41, 39, 64, 45, 71, 33, 82, 62, 62, 38, 74, 74, 55, 40, 43, 40, 40, 40, 33, 63, 69, 60, 60, 52, 73, 42, 54, 63, 41, 42, 49, 55, 41, 39, 41, 42, 52, 55, 39, 41, 42, 42, 40, 60, 41, 63, 64, 41, 41, 34, 44, 65, 40, 44, 45, 63, 49, 58, 47, 44, 67, 49, 36, 52, 46, 57, 40, 51, 46, 41, 39, 37, 38, 49, 41, 37, 39, 44, 39, 33, 47, 79, 45, 63, 45, 41, 36, 51, 48, 51, 43, 46, 49, 49, 41, 45, 52, 47, 53, 32, 39, 46, 48, 51, 43, 46, 44, 42, 64, 51, 55, 52, 48, 54, 43, 42, 39, 41, 43, 44, 45, 44, 33, 40, 39, 33, 26, 20, 42, 39, 40, 27, 38, 41, 28, 35, 34, 48, 53, 44, 34, 21, 35, 39, 50, 33, 34, 33, 20, 29, 45, 45, 42, 34, 32, 47, 42, 36, 31, 34, 34, 34,
      45, 33, 43, 27, 26, 47, 47, 38, 31, 35, 41, 38, 33, 48, 41, 44, 26, 30, 28, 30, 39, 40, 35, 38, 36, 32, 23, 36, 27, 15, 13, 28, 36, 21, 31, 37, 19, 36, 16, 26, 30, 34, 29, 26, 37, 29, 17, 18, 21, 28, 16, 25, 30, 22, 25, 25, 22, 31, 30, 18, 25, 29, 23, 18, 29, 18, 28, 28, 29, 21, 32, 27, 17, 45, 30, 31, 22, 36, 29, 27, 25, 16, 10, 25, 17, 24, 24, 23, 21, 18, 28, 27, 29, 29, 31, 15, 28, 17, 18, 20, 20, 25, 23, 16, 18, 21, 35, 27, 30, 28, 27, 38, 23, 27, 35, 21, 22, 21, 25, 28, 24, 41, 38, 43, 31, 32, 44, 40, 46, 40, 20, 37, 29, 52, 43, 49, 37, 13, 32, 40, 27, 39, 33, 48, 46, 39, 43, 32, 45, 40, 35, 25, 43, 51, 35, 38, 39, 35, 34, 30, 28, 43, 39, 35, 45, 44, 33, 38, 48, 32, 41, 42, 46, 51, 37, 29, 36, 32, 19, 26, 29, 39, 41, 32, 49, 39, 22, 47, 40, 40, 43, 37, 37, 43, 38, 32, 48, 33, 44, 44, 41, 47, 38, 31, 33, 44, 38, 31, 41, 23, 32, 34, 36, 36, 37, 33, 43, 38, 31, 35, 44, 29, 32, 22, 26, 28, 35,
      31, 44, 27, 22, 16, 31, 31, 25, 24, 24, 31, 29, 35, 30, 28, 35, 25, 38, 38, 30, 33, 36, 38, 28, 27, 34, 41, 34, 27, 31, 27, 41, 36, 37, 34, 34, 34, 29, 42, 33, 37, 20, 31, 32, 38, 34, 39, 44, 31, 34, 33, 40, 46, 42, 34, 30, 28, 45, 43, 49, 38, 49, 30, 33, 28, 36, 29, 30, 45, 42, 41, 33, 32, 35, 42, 39, 50, 40, 35, 48, 49, 25, 46, 46, 49, 43, 38, 32, 32, 31, 35, 31, 38, 31, 26, 34, 34, 34, 30, 31, 47, 42, 25, 16, 30, 45, 44, 45, 39, 27, 23, 47, 37, 35, 17, 30, 38, 33, 40, 33, 34, 29, 24, 30, 25, 22, 28, 38, 39, 28, 36, 42, 33, 39, 36, 21, 30, 43, 48, 29, 41, 42, 46, 42, 37, 36, 39, 29, 23, 39, 26, 30, 36, 40, 35, 24, 40, 38, 37, 35, 27, 34, 38, 29, 32, 35, 34, 31, 43, 29, 36, 33, 41, 18, 35, 35, 46, 39, 43, 32, 38, 36, 39, 34, 37, 35, 35, 20, 26, 30, 32, 30, 25, 33, 32, 34, 37, 35, 40, 27, 26, 27, 35, 33, 34, 41, 28, 31, 32, 30, 31, 22, 35, 30, 42, 32, 21, 35, 19, 36, 35, 31, 33, 33, 35, 47, 40,
      38, 32, 31, 36, 46, 40, 36, 29, 37, 33, 40, 28, 39, 37, 38, 28, 34, 37, 42, 33, 40, 44, 33, 22, 35, 31, 33, 36, 33, 31, 31, 26, 35, 19, 20, 34, 26, 30, 19, 15, 19, 29, 34, 31, 39, 32, 36, 35, 40, 33, 41, 36, 38, 30, 38, 38, 44, 41, 27, 35, 37, 38, 43, 35, 39, 50, 32, 31, 35, 37, 33, 41, 44, 30, 44, 32, 29, 31, 36, 22, 30, 34, 29, 27, 37, 26, 21, 24, 25, 28, 30, 31, 26, 28, 29, 27, 32, 26, 24, 26, 30, 25, 25, 25, 25, 25, 34, 38, 36, 35, 36, 32, 27, 28, 31, 41, 52, 34, 34, 43, 26, 32, 25, 32, 31, 31, 33, 26, 26, 20, 14, 30, 27, 28, 19, 21, 23, 28, 32, 29, 21, 28, 30, 24, 32, 17, 29, 28, 29, 21, 30, 27, 25, 29, 24, 26, 32, 27, 18, 32, 19, 27, 31, 13, 18, 29, 26, 20, 18, 12, 21, 29, 20, 30, 34, 19, 17, 27, 24, 19, 22, 20, 23, 27, 21, 17, 20, 22, 32, 23, 25, 30, 25, 13, 13, 12, 30, 28, 14, 14, 7, 22, 42, 39, 18, 26, 30, 11, 14, 18, 17, 31, 20, 18, 17, 19, 33, 29, 32, 23, 16, 17, 26, 14, 45, 18, 21, 21, 22, 32, 24, 26, 32, 28, 33, 24, 26, 32, 25, 19, 16, 20, 32, 26, 26, 19, 25, 13, 17, 21, 25, 25, 22, 23, 24, 26, 23, 30, 23, 25, 34, 29, 26, 27, 22, 26, 13, 13, 18, 25, 24, 21, 15, 21, 26, 20, 15, 26, 15, 9, 18, 11, 21, 19, 22, 21, 21, 17, 25, 30, 22, 24, 30, 30, 28, 27, 34, 15, 31, 30, 32, 32, 29, 35, 37, 30, 34, 23, 24, 32, 28, 39, 40, 36, 31, 30, 35, 32, 16, 31, 55, 32, 30, 35, 30, 32, 31, 39, 16, 34, 36, 31, 22, 40, 31, 29, 36, 27, 27, 36, 39,
      29, 27, 29, 40, 31, 34, 35, 42, 43, 23, 41, 30, 39, 40, 41, 37, 31, 28, 28, 36, 30, 39, 38, 40, 31, 42, 40, 41, 40, 48, 32, 32, 23, 47, 29, 28, 24, 39, 40, 39, 37, 28, 30, 40, 34, 36, 34, 22, 40, 45, 17, 28, 25, 36, 46, 32, 44, 36, 19, 34, 33, 52, 42, 32, 36, 34, 42, 28, 46, 35, 14, 27, 33, 43, 30, 39, 41, 26, 46, 45, 41, 46, 44, 40, 42, 48, 44, 38, 23, 29, 38, 41, 22, 35, 33, 44, 33, 30, 24, 30, 37, 46, 33, 54, 35, 43, 17, 55, 40, 36, 21, 46, 47, 53, 42, 47, 49, 31, 46, 44, 39, 41, 51, 32, 42, 30, 40, 48, 48, 47, 44, 45, 48, 46, 43, 41, 40, 46, 51, 47, 41, 54, 57, 41, 52, 51, 35, 55, 56, 60, 46, 41, 51, 45, 55, 38, 50, 49, 49, 50, 52, 50, 46, 38, 55, 63, 42, 52, 51, 57, 50, 58, 53, 59, 51, 44, 56, 48, 44, 38, 44, 43, 52, 30, 46, 42, 52, 56, 57, 56, 47, 57, 45, 63, 46, 42, 49, 50, 51, 50, 57, 47, 50, 44, 48, 46, 42, 42, 51, 48, 47, 41, 43, 42, 42, 48, 46, 51, 55, 56, 45, 54, 67, 55, 53, 47, 63,
      53, 58, 54, 54, 46, 51, 39, 59, 50, 46, 48, 57, 54, 54, 41, 38, 60, 44, 54, 45, 56]

    // 24小时交通数据
    let hourData = []
    for (let index = 0; index < testData1.length; index += 60) {
      hourData.push(testData1[index])
    }

    // X轴刻度线数组 24小时
    let timeStrList = []
    for (let index = 0; index < 24; index++) {
      let strHour = index.toString()
      if (index < 10) {
        strHour = '0' + strHour
      }
      let strMinute = '00'
      let strTime = strHour + ':' + strMinute
      timeStrList.push(strTime)
    }



    this.setState({
      ...this.state,
      titleText: "节点分析",
      extraInfoSwitch: 3,
      extraInfoLineData: hourData, // 额外信息折线图数据数组
      extraInfoLineDataxAxis: timeStrList, // 额外信息折线图数据横坐标轴数组
    }, () => {
      this.resizeAllCharts()
      this.pointbtn1()
    })

    // poi点坐标信息
    let roadPointsgeojson = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>西直门</strong><p>西直门北大街-NS-1</p>",
            "icon": "pointMark"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.349252, 39.941157]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>三元桥</strong><p>北三环东路辅路（内环）-WE-1</p>",
            "icon": "art-gallery"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.44523, 39.958156]
          }
        },
      ]
    };


    if (this.mapbox.getLayer('points')) {
      console.log('mapbox points layer exist')
    }
    else {

      // 加载自定义图标
      //loadImage(url,callback)
      //url(string)图像的 URL。图像的格式必须为 png， webp 或者 jpg 。
      //callback(Function)形式为 callback(error, data) 。 当图像成功载入或出现错误异常时调用。
      this.mapbox.loadImage('./icons/point.png', (error, image) => {
        if (error) throw error;
        this.mapbox.addImage('pointMark', image);
      });
      this.mapbox.addSource('points', {
        type: 'geojson',
        lineMetrics: true,
        data: roadPointsgeojson
      });
      // 添加路段注释点图层
      this.mapbox.addLayer({
        type: 'symbol',
        id: 'points',
        source: 'points',
        "layout": {
          // "icon-image": "{icon}-15",
          "icon-image": 'pointMark',
          "icon-allow-overlap": true
        }
      });

      this.mapbox.on('click', 'points', (e) => {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties.description;
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        // Populate the popup and set its coordinates
        // based on the feature found.
        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(description)
          .addTo(this.mapbox);
      });
      // Change the cursor to a pointer when the mouse is over the places layer.
      // 回调函数要用箭头函数啊，否则会改变this的指向
      this.mapbox.on('mouseenter', 'points', () => {
        this.mapbox.getCanvas().style.cursor = 'pointer';

      });
      this.mapbox.on('mouseleave', 'points', () => {
        this.mapbox.getCanvas().style.cursor = '';
      });

    }
  }


  //!(9)测试
  onClickBtn9 = () =>{
    console.log(this.state)
    this.resetCamera()
  }


  //! 工作日分析
  pointbtn1 = () => {
    // 三元桥工作日
    let testData1 = [42, 47, 48, 46, 47, 34, 45, 30, 43, 48, 44, 49, 40, 46, 41, 38, 41,
      43, 48, 47, 34, 47, 47, 41, 34, 46, 47, 37, 46, 49, 48, 42, 43, 62, 48, 41, 49, 48, 43, 42, 35, 49, 32, 36, 40, 46, 45, 49, 47, 44, 31, 49, 53, 48, 48, 44, 60, 54, 50, 43, 43, 43, 42, 58, 36, 50, 47, 54, 39, 43, 76, 57, 48, 33, 40, 47, 70, 51, 47, 51, 43, 41, 45, 30, 35, 40, 51, 36, 64, 65, 39, 39, 66, 43, 45, 62, 65, 39, 63, 66, 44, 34, 47, 56, 55, 40, 45, 53, 34, 51, 42, 41, 34, 32, 52, 35, 36, 92, 51, 55, 61, 55, 37, 46, 37, 60, 45, 34, 47, 51, 52, 32, 38, 57, 60, 54, 59, 49, 47, 60, 44, 41, 53, 68, 52, 76, 36, 68, 60, 60, 61, 71, 52, 55, 37, 37, 52, 55, 41, 45, 73, 37, 43, 43, 65, 59, 58, 75, 74, 62,
      52, 33, 44, 33, 33, 34, 57, 58, 64, 64, 64, 32, 64, 64, 46, 48, 59, 64, 37, 38, 45, 45, 57, 43, 31, 89, 80, 75, 67, 67, 45, 45, 40, 43, 33, 36, 36, 67, 67, 30, 42, 42, 42, 42, 42, 42, 42, 51, 51, 92, 56, 58, 41, 41, 70, 70, 70, 40, 42, 45, 33, 47, 44, 47, 28, 41, 39, 64, 45, 71, 33, 82, 62, 62, 38, 74, 74, 55, 40, 43, 40, 40, 40, 33, 63, 69, 60, 60, 52, 73, 42, 54, 63, 41, 42, 49, 55, 41, 39, 41, 42, 52, 55, 39, 41, 42, 42, 40, 60, 41, 63, 64, 41, 41, 34, 44, 65, 40, 44, 45, 63, 49, 58, 47, 44, 67, 49, 36, 52, 46, 57, 40, 51, 46, 41, 39, 37, 38, 49, 41, 37, 39, 44, 39, 33, 47, 79, 45, 63, 45, 41, 36, 51, 48, 51, 43, 46, 49, 49, 41, 45, 52, 47, 53, 32, 39, 46, 48, 51, 43, 46, 44, 42, 64, 51, 55, 52, 48, 54, 43, 42, 39, 41, 43, 44, 45, 44, 33, 40, 39, 33, 26, 20, 42, 39, 40, 27, 38, 41, 28, 35, 34, 48, 53, 44, 34, 21, 35, 39, 50, 33, 34, 33, 20, 29, 45, 45, 42, 34, 32, 47, 42, 36, 31, 34, 34, 34,
      45, 33, 43, 27, 26, 47, 47, 38, 31, 35, 41, 38, 33, 48, 41, 44, 26, 30, 28, 30, 39, 40, 35, 38, 36, 32, 23, 36, 27, 15, 13, 28, 36, 21, 31, 37, 19, 36, 16, 26, 30, 34, 29, 26, 37, 29, 17, 18, 21, 28, 16, 25, 30, 22, 25, 25, 22, 31, 30, 18, 25, 29, 23, 18, 29, 18, 28, 28, 29, 21, 32, 27, 17, 45, 30, 31, 22, 36, 29, 27, 25, 16, 10, 25, 17, 24, 24, 23, 21, 18, 28, 27, 29, 29, 31, 15, 28, 17, 18, 20, 20, 25, 23, 16, 18, 21, 35, 27, 30, 28, 27, 38, 23, 27, 35, 21, 22, 21, 25, 28, 24, 41, 38, 43, 31, 32, 44, 40, 46, 40, 20, 37, 29, 52, 43, 49, 37, 13, 32, 40, 27, 39, 33, 48, 46, 39, 43, 32, 45, 40, 35, 25, 43, 51, 35, 38, 39, 35, 34, 30, 28, 43, 39, 35, 45, 44, 33, 38, 48, 32, 41, 42, 46, 51, 37, 29, 36, 32, 19, 26, 29, 39, 41, 32, 49, 39, 22, 47, 40, 40, 43, 37, 37, 43, 38, 32, 48, 33, 44, 44, 41, 47, 38, 31, 33, 44, 38, 31, 41, 23, 32, 34, 36, 36, 37, 33, 43, 38, 31, 35, 44, 29, 32, 22, 26, 28, 35,
      31, 44, 27, 22, 16, 31, 31, 25, 24, 24, 31, 29, 35, 30, 28, 35, 25, 38, 38, 30, 33, 36, 38, 28, 27, 34, 41, 34, 27, 31, 27, 41, 36, 37, 34, 34, 34, 29, 42, 33, 37, 20, 31, 32, 38, 34, 39, 44, 31, 34, 33, 40, 46, 42, 34, 30, 28, 45, 43, 49, 38, 49, 30, 33, 28, 36, 29, 30, 45, 42, 41, 33, 32, 35, 42, 39, 50, 40, 35, 48, 49, 25, 46, 46, 49, 43, 38, 32, 32, 31, 35, 31, 38, 31, 26, 34, 34, 34, 30, 31, 47, 42, 25, 16, 30, 45, 44, 45, 39, 27, 23, 47, 37, 35, 17, 30, 38, 33, 40, 33, 34, 29, 24, 30, 25, 22, 28, 38, 39, 28, 36, 42, 33, 39, 36, 21, 30, 43, 48, 29, 41, 42, 46, 42, 37, 36, 39, 29, 23, 39, 26, 30, 36, 40, 35, 24, 40, 38, 37, 35, 27, 34, 38, 29, 32, 35, 34, 31, 43, 29, 36, 33, 41, 18, 35, 35, 46, 39, 43, 32, 38, 36, 39, 34, 37, 35, 35, 20, 26, 30, 32, 30, 25, 33, 32, 34, 37, 35, 40, 27, 26, 27, 35, 33, 34, 41, 28, 31, 32, 30, 31, 22, 35, 30, 42, 32, 21, 35, 19, 36, 35, 31, 33, 33, 35, 47, 40,
      38, 32, 31, 36, 46, 40, 36, 29, 37, 33, 40, 28, 39, 37, 38, 28, 34, 37, 42, 33, 40, 44, 33, 22, 35, 31, 33, 36, 33, 31, 31, 26, 35, 19, 20, 34, 26, 30, 19, 15, 19, 29, 34, 31, 39, 32, 36, 35, 40, 33, 41, 36, 38, 30, 38, 38, 44, 41, 27, 35, 37, 38, 43, 35, 39, 50, 32, 31, 35, 37, 33, 41, 44, 30, 44, 32, 29, 31, 36, 22, 30, 34, 29, 27, 37, 26, 21, 24, 25, 28, 30, 31, 26, 28, 29, 27, 32, 26, 24, 26, 30, 25, 25, 25, 25, 25, 34, 38, 36, 35, 36, 32, 27, 28, 31, 41, 52, 34, 34, 43, 26, 32, 25, 32, 31, 31, 33, 26, 26, 20, 14, 30, 27, 28, 19, 21, 23, 28, 32, 29, 21, 28, 30, 24, 32, 17, 29, 28, 29, 21, 30, 27, 25, 29, 24, 26, 32, 27, 18, 32, 19, 27, 31, 13, 18, 29, 26, 20, 18, 12, 21, 29, 20, 30, 34, 19, 17, 27, 24, 19, 22, 20, 23, 27, 21, 17, 20, 22, 32, 23, 25, 30, 25, 13, 13, 12, 30, 28, 14, 14, 7, 22, 42, 39, 18, 26, 30, 11, 14, 18, 17, 31, 20, 18, 17, 19, 33, 29, 32, 23, 16, 17, 26, 14, 45, 18, 21, 21, 22, 32, 24, 26, 32, 28, 33, 24, 26, 32, 25, 19, 16, 20, 32, 26, 26, 19, 25, 13, 17, 21, 25, 25, 22, 23, 24, 26, 23, 30, 23, 25, 34, 29, 26, 27, 22, 26, 13, 13, 18, 25, 24, 21, 15, 21, 26, 20, 15, 26, 15, 9, 18, 11, 21, 19, 22, 21, 21, 17, 25, 30, 22, 24, 30, 30, 28, 27, 34, 15, 31, 30, 32, 32, 29, 35, 37, 30, 34, 23, 24, 32, 28, 39, 40, 36, 31, 30, 35, 32, 16, 31, 55, 32, 30, 35, 30, 32, 31, 39, 16, 34, 36, 31, 22, 40, 31, 29, 36, 27, 27, 36, 39,
      29, 27, 29, 40, 31, 34, 35, 42, 43, 23, 41, 30, 39, 40, 41, 37, 31, 28, 28, 36, 30, 39, 38, 40, 31, 42, 40, 41, 40, 48, 32, 32, 23, 47, 29, 28, 24, 39, 40, 39, 37, 28, 30, 40, 34, 36, 34, 22, 40, 45, 17, 28, 25, 36, 46, 32, 44, 36, 19, 34, 33, 52, 42, 32, 36, 34, 42, 28, 46, 35, 14, 27, 33, 43, 30, 39, 41, 26, 46, 45, 41, 46, 44, 40, 42, 48, 44, 38, 23, 29, 38, 41, 22, 35, 33, 44, 33, 30, 24, 30, 37, 46, 33, 54, 35, 43, 17, 55, 40, 36, 21, 46, 47, 53, 42, 47, 49, 31, 46, 44, 39, 41, 51, 32, 42, 30, 40, 48, 48, 47, 44, 45, 48, 46, 43, 41, 40, 46, 51, 47, 41, 54, 57, 41, 52, 51, 35, 55, 56, 60, 46, 41, 51, 45, 55, 38, 50, 49, 49, 50, 52, 50, 46, 38, 55, 63, 42, 52, 51, 57, 50, 58, 53, 59, 51, 44, 56, 48, 44, 38, 44, 43, 52, 30, 46, 42, 52, 56, 57, 56, 47, 57, 45, 63, 46, 42, 49, 50, 51, 50, 57, 47, 50, 44, 48, 46, 42, 42, 51, 48, 47, 41, 43, 42, 42, 48, 46, 51, 55, 56, 45, 54, 67, 55, 53, 47, 63,
      53, 58, 54, 54, 46, 51, 39, 59, 50, 46, 48, 57, 54, 54, 41, 38, 60, 44, 54, 45, 56]
    // 间隔分钟数
    let splitMinute = 20
    // 数据隔点
    let lineData = []
    for (let index = 0; index < testData1.length; index+=splitMinute) {
      lineData.push(testData1[index])
    }
    // X轴刻度线数组
    let timeStrList = []
    for (let index = 0; index < 24; index++) {
      let strHour = index.toString()
      if (index < 10) {
        strHour = '0' + strHour
      }
      for (let indexM = 0; indexM < 60; indexM+=splitMinute){
        let strMinute = indexM.toString()
        if (indexM < 10) {
          strMinute = '0' + strMinute
        }
        let strTime = strHour + ':' + strMinute
        timeStrList.push(strTime)
      }
    }
    this.setState({
      ...this.state,
      pointLineTitle: "该节点所在路段工作日24小时通行时速变化",
      pointLineData: lineData,
      pointLineDataxAxis:timeStrList
    }, () => {
      this.resizeAllCharts()
    })
  }

  //! 节假日分析
  pointbtn2 = () => {
    // 三元桥节假日
    let testData1 = [31, 39, 52, 30, 54, 57, 44, 51,
      44, 65, 58, 60, 44, 66, 36, 46, 68, 35, 53, 53, 57, 57, 50, 42, 43, 43, 53, 52, 51, 59, 51, 45, 41, 54, 52, 63, 34, 40, 48, 48, 42, 55, 40, 42, 48, 53, 43, 48, 33, 34, 47, 55, 39, 47, 63, 63, 49, 42, 47, 47, 65, 65, 42, 41, 62, 44, 41, 49, 53, 36, 45, 28, 45, 45, 33, 70, 32, 40, 59, 26, 64, 57, 42, 42, 53, 39, 37, 45, 49, 78, 53, 60, 26, 26, 29, 44, 55, 55, 76, 70, 64, 47, 38, 67, 58, 58, 78, 78, 46, 34, 39, 43, 39, 48, 59, 56, 66, 37, 48, 48, 48, 39, 58, 54, 42, 43, 38, 40, 45, 48, 67, 94, 40, 35, 41, 55, 46, 58, 58, 47, 47, 43, 41, 54, 53, 47, 40, 57, 57, 72, 52, 54, 58, 58, 47, 31, 42, 53, 53, 53, 102, 48, 25, 45, 44, 40, 40, 66, 61, 61, 61, 61, 69, 69, 69, 69, 58, 50, 50, 50, 45, 45, 81, 43, 52, 60, 29, 35, 60, 73, 96, 96, 96, 94, 94, 76, 42, 29, 44, 47, 47, 47, 31, 31, 45, 66, 66, 66, 64, 57, 67, 36, 39, 45, 45, 45, 40, 50, 74, 62, 62, 62, 47, 51, 51, 65, 68, 68, 68, 85, 71, 85, 85, 30, 30, 30, 30, 30, 51, 40, 33, 33, 33, 33, 30, 45, 46, 88, 80, 63, 39, 41, 30, 54, 53, 63, 62, 67, 67, 67, 67, 67, 60, 56, 56, 43, 42, 49, 58, 96, 96, 61, 47, 47, 55, 81, 58, 31, 31, 45, 65, 29, 29, 47, 80, 82, 45, 49, 47, 78, 41, 33, 56, 56, 56, 56, 45, 58, 58, 58, 46, 44, 51, 60, 43, 41, 47, 44, 44, 42, 66, 66, 52, 61, 57, 69, 78, 45, 45, 45, 58, 75, 71, 63, 63, 64, 70, 66, 27, 45, 54, 59, 67, 37, 50, 44, 65, 55, 62, 60,
      52, 49, 49, 37, 39, 36, 52, 60, 55, 68, 55, 55, 41, 54, 58, 58, 69, 44, 54, 37, 64, 55, 57, 49, 51, 45, 52, 49, 24, 44, 54, 67, 61, 25, 76, 54, 64, 48, 68, 53, 55, 64, 27, 54, 51, 60, 39, 68, 48, 35, 27, 47, 36, 28, 45, 34, 62, 37, 57, 41, 53, 35, 40, 32, 48, 49, 37, 40, 42, 53, 54, 49, 59, 48, 38, 38, 43, 43, 51, 39, 42, 32, 24, 38, 33, 20, 31, 22, 24, 13, 30, 27, 21, 29, 26, 31, 25, 29, 27, 19, 30, 29, 16, 29, 28, 30, 17, 25, 22, 20, 23, 25, 33, 29, 30, 24, 21, 24, 19, 16, 16, 29, 32, 11, 16, 15, 14, 15, 18, 15, 13, 26, 10, 25, 14, 11, 22, 20, 19, 13, 17, 18, 20, 16, 21, 22, 14, 19, 23, 30, 19, 32, 23, 20, 22, 7, 21, 22, 9, 23, 19, 18, 20, 22, 11, 22, 16, 10, 21, 16, 14, 18, 17, 20, 19, 27, 28, 27, 26, 26, 17, 20, 23, 21, 27, 25, 23, 25, 28, 19, 32, 28, 25, 36, 24, 29, 24, 26, 20, 28, 29, 30, 33, 22, 29, 17, 24, 31, 21, 23, 6, 22, 15, 17, 19, 22, 26, 15, 17, 25, 23, 28, 23, 17, 23, 22, 21, 27, 24, 19, 27, 23, 25, 40, 30, 28, 32, 25, 28, 30, 31, 31, 20, 34, 29, 22, 16, 17, 21, 15, 27, 38, 27, 29, 19, 28, 32, 24, 22, 21, 27, 23, 27, 30, 28, 31, 26, 31, 30, 33, 32, 35, 39, 31, 33, 33, 20, 17, 27, 30, 25, 30, 25, 24, 31, 33, 44, 38, 14, 29, 32, 33, 27, 36, 29, 31, 35, 25, 36, 27, 32, 33, 31, 30, 34, 28, 31, 34, 29, 31, 33, 40, 32, 25, 21, 29, 30, 36, 32, 32, 32, 34, 26, 34, 18, 30, 32, 27, 38, 28, 30, 36, 32, 33, 30, 33, 29, 28, 27, 30, 36, 35, 29, 23, 17, 35, 29, 26, 32, 30, 20, 25, 15, 44, 32, 32, 33, 41, 33, 30, 32, 40, 30, 32, 41, 26, 33, 35, 36, 35, 37, 39, 42, 32, 24, 32, 34, 41, 38, 26, 38, 23, 18, 57, 28, 29, 16, 33, 25, 26, 31, 20, 33, 32, 33, 30, 27, 30,
      16, 27, 27, 26, 28, 24, 44, 39, 30, 30, 26, 36, 32, 25, 31, 25, 21, 34, 38, 30, 40, 40, 43, 40, 45, 47, 39, 36, 34, 37, 42, 51, 35, 46, 40, 38, 34, 39, 38, 34, 40, 45, 51, 41, 44, 34, 31, 46, 31, 43, 38, 41, 57, 47, 46, 37, 14, 20, 38, 40, 35, 13, 31, 46, 35, 41, 46, 49, 41, 36, 30, 41, 29, 35, 31, 43, 29, 37, 28, 38, 35, 37, 35, 38, 24, 31, 28, 21, 30, 30, 37, 27, 23, 23, 31, 34, 33, 25, 32, 31, 25, 35, 34, 39, 32, 34, 29, 31, 31, 36, 22, 33, 27, 29, 30, 36, 33, 34, 36, 36, 49, 37, 29, 38, 41, 38, 31, 33, 34, 36, 36, 28, 28, 30, 24, 31, 27, 32, 27, 38, 33, 29, 32, 33, 13, 35, 36, 34, 30, 24, 35, 31, 42, 44, 33, 51, 38, 29, 40, 44, 35, 39, 45, 45, 42, 49, 43, 30, 39, 40, 38, 44, 27, 39, 38, 45, 32, 52, 32, 39, 40, 30, 36, 41, 51, 46, 13, 46, 53, 39, 41, 50, 45, 43, 38, 36, 29, 36, 35, 36, 36, 37, 37, 31, 18, 25, 36, 24, 30, 30, 21, 27, 25, 22, 26, 34, 27, 28, 23, 19, 26, 27, 28, 31, 27, 33, 28,
      27, 20, 20, 17, 8, 25, 25, 18, 23, 29, 18, 29, 30, 21, 31, 29, 25, 17, 23, 25, 22, 20, 23, 27, 22, 21, 15, 20, 16, 16, 17, 18, 18, 18, 22, 13, 21, 13, 23, 25, 28, 21, 19, 28, 21, 25, 17, 39, 7, 34, 21, 19, 21, 13, 15, 22, 24, 19, 17, 21, 24, 20, 18, 17, 23, 17, 19, 20, 25, 10, 20, 22, 26, 23, 22, 17, 17, 18, 7, 20, 24, 24, 18, 17, 10, 20, 15, 27, 22, 26, 20, 26, 24, 20, 14, 22, 20, 22, 13, 17, 12, 17, 10, 16, 11, 25, 9, 6, 11, 29, 12, 11, 13, 8, 8, 15, 21, 19, 10, 16, 14, 15, 25, 21, 21, 20, 31, 22, 26, 27, 17, 15, 27, 22, 27, 20, 18, 22, 22, 19, 21, 20, 22, 27, 16, 14, 27, 19, 28, 15, 12, 20, 23, 10, 14, 7, 9, 12, 14, 12, 12, 17, 14, 14, 14, 13, 20, 7, 8, 19, 9, 23, 23, 15, 23, 22, 19, 28, 26, 25, 32, 20, 21, 21, 27, 21, 27, 33, 16, 24, 20, 20, 22, 19, 28, 26, 13, 21, 34, 23, 24, 26, 20, 28, 32, 34, 24, 31, 30, 34, 28, 31, 29, 40, 28, 39, 39, 39, 27, 32, 8, 8, 42, 43, 40, 45, 36, 36, 34, 42, 38, 41, 32, 27, 31, 40, 35, 34, 37, 38, 32, 34, 28, 23, 21, 32, 30, 20, 27, 28, 33, 26, 23, 17, 23, 32, 25, 18, 32, 30, 28, 27, 28, 26, 22, 26, 25, 29, 21, 21, 33, 33, 27, 10, 23, 23, 27, 22, 21, 22, 35, 24, 26, 33, 29, 30, 22, 27, 34, 25, 33, 31, 33, 22, 21, 39, 26, 29, 33, 30, 35, 27, 37, 21, 31, 36, 44, 30, 37, 36, 24, 33, 19, 34, 35, 20, 24, 17, 34, 33, 31, 37, 47, 25, 29, 39, 29, 39, 51, 21, 35, 30, 56, 26, 25, 26, 23, 24, 28, 25, 32, 30, 40, 34,
      20, 30, 28, 23, 38, 35, 39, 43, 29, 45, 60, 44, 47, 51, 43, 44, 52, 44, 44, 35, 52, 52, 51, 52, 56, 49, 50, 51, 55, 46, 36, 60, 59, 58, 52, 55, 64, 45, 58, 47, 49, 47, 50, 57, 49, 44, 48, 56, 52, 49, 54, 61, 61, 55, 56, 47, 47, 48, 46, 56, 42, 55, 51, 40, 45, 55, 52, 37, 41, 48, 42, 42, 49, 47, 58, 47, 42, 57, 63, 45, 53, 46, 48, 53, 58, 64, 64, 57, 54, 62, 55, 47, 50, 51, 48, 62, 44, 49, 62, 57, 53, 50, 58, 39, 62, 50, 54, 54, 50, 40, 60, 49, 56, 60, 44, 62, 55, 57, 56, 59, 56,
      68, 67, 48, 42, 61, 52, 48, 46, 57, 48]

    // 间隔分钟数
    let splitMinute = 20
    // 数据隔点
    let lineData = []
    for (let index = 0; index < testData1.length; index+=splitMinute) {
      lineData.push(testData1[index])
    }
    // X轴刻度线数组
    let timeStrList = []
    for (let index = 0; index < 24; index++) {
      let strHour = index.toString()
      if (index < 10) {
        strHour = '0' + strHour
      }
      for (let indexM = 0; indexM < 60; indexM+=splitMinute){
        let strMinute = indexM.toString()
        if (indexM < 10) {
          strMinute = '0' + strMinute
        }
        let strTime = strHour + ':' + strMinute
        timeStrList.push(strTime)
      }
    }
    this.setState({
      ...this.state,
      pointLineTitle: "该节点所在路段节假日24小时通行时速变化",
      pointLineData: lineData,
      pointLineDataxAxis:timeStrList
    }, () => {
      this.resizeAllCharts()
    })
  }

  //! 长周期分析
  pointbtn3 = () => {
    // 西直门长周期
    let lineData = [30, 18, 12, 49, 55, 44, 38, 45, 39, 38, 29, 25, 27, 29, 29,
      21, 14, 39, 14, 20, 21, 21, 19, 24, 37, 52, 29, 23, 21, 23, 22]
    // X轴刻度线数组
    let timeStrList = ['2020/1/1', '2020/1/8', '2020/1/15', '2020/1/22', '2020/1/29', '2020/2/5', '2020/2/12',
    '2020/2/19', '2020/2/26', '2020/3/4', '2020/3/11', '2020/3/18', '2020/3/25', '2020/4/1', '2020/4/8',
    '2020/4/15', '2020/4/22', '2020/4/29', '2020/5/6', '2020/5/13', '2020/5/20', '2020/5/27', '2020/6/3',
    '2020/6/10', '2020/6/17', '2020/6/24', '2020/7/1', '2020/7/8', '2020/7/15', '2020/7/22', '2020/7/29']
    this.setState({
      ...this.state,
      pointLineTitle: "该节点所在路段每周早高峰平均车速",
      pointLineData: lineData,
      pointLineDataxAxis:timeStrList
    }, () => {
      this.resizeAllCharts()
    })
  }


  componentDidMount() {
    window.onresize = this.resizeAllCharts
    // 获取mapbox对象实例
    this.mapbox = this.mapRef.current.mapbox
    // this.mapbox = this.echartsMapContainer.getModel().getComponent('mapbox3D').getMapbox();
    // this.mapRef.current.mapbox.setStyle('mapbox://styles/mapbox/dark-v10')
  };

  componentDidUpdate() {

  };

  componentWillUnmount() {
    console.log('Analysis Destory')
    this.store.clearAll()
    this.mapbox = null
  }

  render() {
    return (
      <div id='analysisLayout'>
        {/*
        1. gutter与span是控制布局的参数
        2. 通过row在水平方向建立一组col
        3. 你的内容应当放置于col内，并且，只有col可以作为row的直接元素
        4. 栅格系统中的列是指1到24的值来表示其跨越的范围。例如，三个等宽的列可以使用<Col span={8} />来创建
        5. gutter参数类型可以是num,object,array，array的表示为：[水平间距, 垂直间距]
        */}

        {/* PageHeader组件位于标题与按钮所在一行，此组件始终存在 */}
        <Row gutter={[16, 0]}>
          <Col span={24}>
            <PageHeader
              ghost={false}
              onBack={() => window.history.back()}
              title="交通拥堵可视化分析"
              // subTitle="交通拥堵"
              extra={[
                <Button
                  key="1"
                  type="primary"
                  onClick={this.onClickBtn1}
                  loading={this.store.loading}
                >测试数据</Button>,

                <Button
                  key="2"
                  type="primary"
                  onClick={debounce(this.onClickBtn2, 500)}
                  loading={this.store.loading}
                >数据轮播</Button>,

                <Button
                  key="3"
                  type="primary"
                  onClick={debounce(this.onClickBtn3, 500)}
                  loading={this.store.loading}
                >实时交通</Button>,

                <Button
                  key="7"
                  type="primary"
                  onClick={this.onClickBtn7}
                  loading={this.store.loading}
                >线路分析</Button>,

                <Button
                  key="8"
                  type="primary"
                  onClick={this.onClickBtn8}
                  loading={this.store.loading}
                >节点分析</Button>,

                <Button
                  key="4"
                  type="primary"
                  onClick={debounce(this.onClickBtn4, 500)}
                  loading={this.store.loading}
                >局部演示</Button>,

                <Button
                  key="5"
                  type="primary"
                  onClick={debounce(this.onClickBtn5, 500)}
                  loading={this.store.loading}
                  >全局演示</Button>,

                  <Button
                  key="6"
                  type="primary"
                  onClick={this.onClickBtn6}
                  loading={this.store.loading}
                  >地图重置</Button>,

                  <Button
                  key="9"
                  type="primary"
                  onClick={this.onClickBtn9}
                >测试按钮</Button>,
              ]}
            />
          </Col>
        </Row>

        {/* 默认仅显示地图组件，点击特定按钮地图组件发生变化，并且出现新组件 */}
        <Row gutter={[16, 4]} >
          {/* 地图组件，会在this.state.extraInfoSwitch改变后调整尺寸 */}
          {/* className可以用来改变标签元素的css类选择器，从而改变元素的样式 */}
          <Col span={this.state.extraInfoSwitch > 0 ? 14 : 24} className="mapContainer">
            <EchartsMapBoxVis
              mapContainerID="mapContainer"
              chartsParam={this.state.chartsParam}
              data={this.state.dataType === 'history' ? this.state.data : this.store.dataGt}
              flyActionParam={this.state.flyActionParam}
              titleText={this.state.titleText}
              ref={this.mapRef}
            />
          </Col>
          {/* 点击测试数据按钮之后新出现的组件，包括JamScoreDash，Pie，Line */}
          <Col span={this.state.extraInfoSwitch === 1 ? 10 : 0} >
            {/*
            1) 在点击测试数据按钮之后才会出现，此时的占位为10——显示出此组件，否则占位为0——不会显示
            2) 点击测试数据按钮之后，触发回调函数，回调函数修改this.state.extraInfoSwitch
            */}
            <Row gutter={[16, 4]}>
              <Col span={8}>
                <JamScoreDash chartsDashID="dash1" />
              </Col >
              <Col span={16}>
                <Pie chartsPieID="pie1" />
              </Col>
            </Row>
            <Row gutter={[16, 4]}>
              <Line
                chartsLineID="line1"
                titleText="当日24小时平均时速变化"
                data={this.state.extraInfoLineData}
                xAxisdata={this.state.extraInfoLineDataxAxis}
              />
            </Row>
          </Col>
          {/* 点击线路分析按钮之后新出现的组件，包括Descriptions，Line */}
          <Col span={this.state.extraInfoSwitch === 2 ? 10 : 0} >
            <Row>
              <Col span={24}>
                <Descriptions
                  title="道路信息"
                  layout="horizontal"
                  bordered
                  column={1}
                  size='default'
                >
                  <Descriptions.Item label="道路名称">中关村东路</Descriptions.Item>
                  <Descriptions.Item label="道路方向">由北向南</Descriptions.Item>
                  <Descriptions.Item label="时间">2020-09-14 09:12:00</Descriptions.Item>
                  <Descriptions.Item label="平均通行速度">35km/h</Descriptions.Item>
                  {/* <Descriptions.Item label="预计通行时间" >32min</Descriptions.Item> */}
                </Descriptions>
              </Col>
            </Row>
            <Row gutter={[16, 4]}>
              <Col span={24}>
                <Line
                  chartsLineID="line2"
                  titleText="该道路24小时通行时速变化"
                  data={this.state.extraInfoLineData}
                  xAxisdata={this.state.extraInfoLineDataxAxis}
                />
              </Col>
            </Row>
          </Col>
          {/* 点击节点分析按钮之后新出现的组件，包括Descriptions，Line，还有第三行的一些组件 */}
          <Col span={this.state.extraInfoSwitch === 3 ? 10 : 0} >
            <Row>
              <Col span={24}>
                <Descriptions
                  title="节点信息"
                  layout="horizontal"
                  bordered
                  column={1}
                  size='default'
                >
                  <Descriptions.Item label="节点名称">三元桥</Descriptions.Item>
                  <Descriptions.Item label="节点所在道路">北三环东路辅路（内环）</Descriptions.Item>
                  <Descriptions.Item label="道路方向">由西向东</Descriptions.Item>
                  <Descriptions.Item label="时间">2020-09-14 09:12:00</Descriptions.Item>
                  <Descriptions.Item label="平均通行速度">35km/h</Descriptions.Item>
                  {/* <Descriptions.Item label="预计通行时间" >32min</Descriptions.Item> */}
                </Descriptions>
              </Col>
            </Row>
            <Row gutter={[16, 4]}>
              <Col span={24}>
                <Line
                  chartsLineID="linePoint"
                  titleText="该节点所在路段24小时通行时速变化"
                  data={this.state.extraInfoLineData}
                  xAxisdata={this.state.extraInfoLineDataxAxis}
                />
              </Col>
            </Row>
          </Col>
        </Row>

        {/* 点击节点分析按钮之后新出现的组件 */}
        <Row align={"middle"} justify={"center"}>
          <Col span={this.state.extraInfoSwitch === 3 ? 21 : 0} className="lineContainer">
            <Line
              chartsLineID="pointLineInfo"
              titleText={this.state.pointLineTitle}
              data={this.state.pointLineData}
              xAxisdata={this.state.pointLineDataxAxis}
            />
          </Col>
          <Col span={this.state.extraInfoSwitch === 3 ? 3 : 0} >
            <Button
              className='marginbottom10'
              key="pointbtn1"
              type="primary"
              onClick={this.pointbtn1}
              loading={this.store.loading}
            >工作日分析</Button>

            <Button
              className='marginbottom10'
              key="pointbtn2"
              type="primary"
              onClick={this.pointbtn2}
              loading={this.store.loading}
            >节假日分析</Button>

            <Button
              className='marginbottom10'
              key="pointbtn3"
              type="primary"
              onClick={this.pointbtn3}
              loading={this.store.loading}
            >长周期分析</Button>

          </Col>
        </Row>
      </div>
    );
  };
};

export default Analysis;