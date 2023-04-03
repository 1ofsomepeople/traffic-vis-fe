import React, { Component } from 'react';
import echarts from 'echarts';
import 'echarts-gl';

class Bar3DTimeViewD extends Component {
  constructor(props) {
    super(props);
    this.state = {}
    this.chartsBar3D = null // echarts对象实例
  }

  initLine = () => {
    // 初始化echarts对象实例
    this.chartsBar3D = echarts.init(document.getElementById(this.props.chartsBar3DID));
  }
  updateLine = () => {
    let testOption = {
      tooltip: {
        // trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: ['出发站', '时间', '需求数量']
      },
      title: {
        text: this.props.titleText,
        subtext: this.props.data.pred_station ? this.props.data.pred_station : '',
        left: 'top' // title 组件离容器左侧的距离。
      },
      backgroundColor: '#000',
      // tooltip: {
      //   trigger: 'axis',
      //   backgroundColor: 'rgba(0,0,0,0.5)',
      //   axisPointer: {
      //     lineStyle: {
      //       color: {
      //         type: 'linear',
      //         x: 0,
      //         y: 0,
      //         x2: 0,
      //         y2: 1,
      //         colorStops: [{
      //           offset: 0,
      //           color: 'red'
      //         }, {
      //           offset: 0.5,
      //           color: '#48b3FF',
      //         }, {
      //           offset: 1,
      //           color: '#d9efff'
      //         }],
      //         global: false
      //       }
      //     },
      //   },
      // },
      grid3D: {
        axisLine: {
          lineStyle: { color: '#fff' }
        },
        axisPointer: {
          lineStyle: { color: '#fff' }
        },
        viewControl: {
          autoRotate: false
        },
        light: {
          main: {
            shadow: true,
            quality: 'high',
            intensity: 0.8
          }
        },
        environment: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
          offset: 0, color: '#00aaff' // 天空颜色
        }, {
            offset: 0.7, color: '#998866' // 地面颜色
        }, {
            offset: 1, color: '#998866' // 地面颜色
        }], false),
      },
      xAxis3D: {
        type: 'category',
        name: '出发站'
      },
      yAxis3D: {
        type: 'category',
        name: '时间'
      },
      zAxis3D: {
        show:false,
        type: 'value',
        name: '需求数量',
        max: 50,
        min: 0
      },
      visualMap: {
        show: false,
        min: 0,
        max: 20,
        inRange: {
          color: [
            '#313695',
            '#4575b4',
            '#74add1',
            '#abd9e9',
            '#e0f3f8',
            '#ffffbf',
            '#fee090',
            '#fdae61',
            '#f46d43',
            '#d73027',
            '#a50026'
          ]
        }
      },
      series: [
        {
          name: 'OD Demand',
          dimensions:[
            '出发站',
            '时间',
            '需求数量',
          ],
          type: 'bar3D',
          data: this.props.data.data_timeview_d,
          shading: 'lambert',
          label: {
            formatter: function (param) {
              return param.value[2].toFixed(1); // 四舍五入方法
            }
          }
        }
      ]
    };

    this.chartsBar3D.setOption(testOption)
  }

  componentDidMount() {
    this.initLine();
    window.onresize = () => {
      this.chartsBar3D.resize()
    }
  }

  componentDidUpdate() {
    // console.log(this.props.data.data)
    this.updateLine()
  }

  componentWillUnmount() {
    console.log('chartsBar Destory')
    this.chartsBar3D = null // echarts对象实例
  }

  render() {
    return (
      <div
        id={this.props.chartsBar3DID}
        style={{
          minHeight: "400px",
          height: "100%",
          width: "100%",
          padding:"5px" ,
          // overflow:"auto",
        }} />
    );
  }
}

export default Bar3DTimeViewD;