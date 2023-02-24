import React, { Component } from 'react';
import echarts from 'echarts';
import 'echarts-gl';

class Bar extends Component {
  constructor(props) {
    super(props);
    this.state = {}
    this.chartsBar = null // echarts对象实例
  }

  initBar = () => {
    // 初始化echarts对象实例
    this.chartsBar = echarts.init(document.getElementById(this.props.chartsBarID));
  }
  updateBar = () => {
    let testOption = {
      title: {
        text: this.props.titleText,
        left: 'top' // title 组件离容器左侧的距离。
      },
      legend:{
        data:[]
      },
      backgroundColor: '#fff',
      color: ['#48b3FF', '#ffdf25'],
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0,0,0,0.5)',
        axisPointer: {
          lineStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0,
                color: 'red'
              }, {
                offset: 0.5,
                color: '#48b3FF',
              }, {
                offset: 1,
                color: '#d9efff'
              }],
              global: false
            }
          },
        },
      },
      grid: {
        top: '10%',
        left: '5%',
        right: '5%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: [{
        type: 'category',
        color: '#59588D',
        axisLine: {
          show: true
        },
        axisTick: { //坐标轴刻度与标签对齐
          alignWithLabel: true
        },
        axisLabel: {
          color: '#282828',
          interval:0,
          rotate:40
        },
        splitLine: {
          show: false
        },
        // axisTick: {
        //   show: false
        // },
        // boundaryGap: true,
        data: [
          '老山公交场站',
          '老山南路东口',
          '地铁八宝山站',
          '玉泉路口西',
          '永定路口东',
          '五棵松桥东',
          '沙沟路口西',
          // '东翠路口',
          '万寿路口西',
          // '翠微路口',
          '公主坟',
          '军事博物馆',
          '木樨地西',
          '工会大楼',
          '南礼士路',
          // '复兴门内',
          '西单路口东',
          '天安门西',
          '天安门东',
          '东单路口西',
          '北京站口东',
          '日坛路',
          '永安里路口西',
          '大北窑西',
          '大北窑东',
          // '郎家园',
          '八王坟西',
          '四惠枢纽站'
        ]
      }],
      yAxis: [{
        type: 'value',
        min: 0,
        // max: 20,
        interval:10,
        // splitNumber: 4,
        axisLine: {
          show: true,
        },
        axisLabel: {
          show: true,
          // margin: 20,
          textStyle: {
            color: '#737373',
          },
        },
        // axisTick: {
        //   show: false,
        // },
        splitLine: {
          show:true,
          lineStyle: {
            color: 'rgba(131,101,101,0.2)',
            type: 'dashed',
          }
        }
      }],
      // series: [
      //   {
      //     name: '真实值',
      //     type: 'bar',
      //     tooltip: {
      //       show: true
      //     },
      //     data: this.props.data.gt.data1D, // 折线图数据数组
      //     // data: [1,2,3,4,5,6,7,6,5,4,3,2,1,2,3,4,5,6,7,6,5,4,3,2,1,2,3,4,5,6,7], // 折线图数据数组
      //   },
      //   {
      //     name: '预测值',
      //     type: 'bar',
      //     tooltip: {
      //       show: true
      //     },
      //     data: this.props.data.pred.data1D, // 折线图数据数组
      //   }
      // ]
    };
    if (this.props.compare) {
      testOption.legend.data = ['真实值', '预测值']
      testOption.series = [
        {
          name: '真实值',
          type: 'bar',
          barMinHeight: 10,
          tooltip: {
            show: true
          },
          data: this.props.data.gt.data1D, // 折线图数据数组
          // data: [1,2,3,4,5,6,7,6,5,4,3,2,1,2,3,4,5,6,7,6,5,4,3,2,1,2,3,4,5,6,7], // 折线图数据数组
          label: {
            show: true,
          }
        },
        {
          name: '预测值',
          type: 'bar',
          barMinHeight: 10,
          tooltip: {
            show: true
          },
          data: this.props.data.pred.data1D, // 折线图数据数组
          label:{
            show: true,
            formatter: function(param){
              return param.value.toFixed(1);
            }
          }
        }
      ]
    }
    else {
      testOption.legend.data = ['真实值']
      testOption.series = [
        {
          name: '真实值',
          type: 'bar',
          barMinHeight: 10,
          tooltip: {
            show: true
          },
          data: this.props.data.gt.data1D, // 折线图数据数组
          // data: [1,2,3,4,5,6,7,6,5,4,3,2,1,2,3,4,5,6,7,6,5,4,3,2,1,2,3,4,5,6,7], // 折线图数据数组
          label: {
            show: true,
          }
        },
      ]
    }
    this.chartsBar.setOption(testOption)
  }

  componentDidMount() {
    this.initBar();
    window.onresize = () => {
      this.chartsBar.resize()
    }
  }

  componentDidUpdate() {
    console.log(this.props.data.data1D)
    this.updateBar()
  }

  componentWillUnmount() {
    console.log('chartsBar Destory')
    this.chartsBar = null // echarts对象实例
  }

  render() {
    return (
      <div
        id={this.props.chartsBarID}
        style={{
          minHeight: "300px",
          height: "100%",
          width: "100%",
          padding:"5px" ,
        }} />
    );
  }
}

export default Bar;