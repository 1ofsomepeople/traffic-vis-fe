import React, { Component } from 'react';
import { Row, Col, Button, message, Select, Typography } from 'antd';
import echarts from 'echarts';
import 'echarts-gl';

import './EchartHeatMapVis.css'
import { eqArr } from './apis';
import Title from 'antd/lib/skeleton/Title';
const { Option } = Select;

class EchartHeatMapVis extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // titleText: this.props.chartsParam.titleText ? this.props.chartsParam.titleText : ' ',
      titleText: this.props.titleText,
      // heatmapParam: this.props.chartsParam.heatmapParam ? this.props.chartsParam.heatmapParam : null,
    }
    this.myChartGl = null // echarts对象实例
    this.heatmap = null // heatmap对象实例
    // window.heatmapboxgl = heatmapboxgl;
    // setTimeout(() => {
    //   this.showmapbox(this.props.data.data, this.props.data.datatime);
    // })
    this.showheatmapbox = this.showheatmapbox.bind(this)
  }

  componentDidMount() {
    // window.mapboxgl = mapboxgl;
    this.showheatmapbox(this.props.data.data, this.props.data.datatime);
    window.onresize = () => {
      this.myChartGl.resize()
    }
  }

  componentDidUpdate() {
    let data = this.props.data.data
    let datatime = this.props.data.datatime
    let asyncParam = null

    let newOption = {
      title: {
        text: this.props.titleText,
        // subtext: datatime ? datatime : '',
      },
      series: [{
        data: data ? data : [],
        // barSize: (2 ** (this.mapbox.getZoom() - 10) * 0.1),
      }],
    }
    if (asyncParam) {
      newOption = {
        title:{
          text: "热力图",
          // subtext: asyncParam.datatime ? asyncParam.datatime : '', //"2019-12-13 14:00", //主标题的副标题文本内容，如果需要副标题就配置这一项
          left: 'center',
          top:'2%'
        },
        series: [{
          name: 'Punch Card',
          type: 'heatmap',
          data: asyncParam.data ? asyncParam.data : [],
          label: {
            show: false
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      }
    }
    this.myChartGl.setOption(newOption)
  }

  componentWillUnmount() {
    console.log('EchartHeatMapVis Destory')
    this.myChartGl = null // echarts对象实例
    // this.heatmapbox = null // mapbox对象实例
    // window.mapboxgl = null
  }


  showheatmapbox = (data = [], datatime = "") => {
    // echarts对象实例
    this.myChartGl = echarts.init(document.getElementById(this.props.heatMapContainerID));
    this.myChartGl.setOption({
      title: {
        text: "起止需求热力图",
        // subtext: datatime ? datatime : '', //"2019-12-13 14:00", //主标题的副标题文本内容，如果需要副标题就配置这一项
        left: 'center',
        top:'2%'
      },
      tooltip: {
        // position: 'top'
      },
      grid: {
        left: '10%',
        right: '10%'
      },
      xAxis: {
        type: 'category',
        splitArea: {
          show: true
        }
      },
      yAxis: {
        type: 'category',
        splitArea: {
          show: true
        }
      },
      visualMap: {
        type: 'piecewise',
        min: 0,
        max: 100,
        calculable: true,
        realtime: false,
        // orient: 'vertical',
        // left: 'right',
        right: 0,
        top: 'top',
        handleIcon: 'path://M0,0 v9.7h5 v-9.7h-5 Z',
        // handleSize: '140%',
        pieces: [
          {gt: 100}, // 不指定 max，表示 max 为无限大（Infinity）。
          // {gt: 90, lte: 100},
          // {gt: 80, lte: 90},
          // {gt: 70, lte: 80},
          // {gt: 60, lte: 70},
          // {gt: 50, lte: 60},
          {gt: 50, lte: 100},
          // {gt: 40, lte: 50},
          // {gt: 30, lte: 40},
          // {gt: 20, lte: 30},
          {gt: 20, lte: 50},
          // {gt: 10, lte: 20},
          {gt: 5, lte: 20},
          // {gt: 5, lte: 10},
          // {min: 10, max: 200, label: '10 到 200（自定义label）'},
          {lte: 5} // 不指定 min，表示 min 为无限大（-Infinity）。
        ],
        inRange: {
          color: [
            // '#313695',
            // '#4575b4',
            // '#74add1',
            // '#abd9e9',
            // '#e0f3f8',
            // '#ffffbf',
            '#f5f5f5',
            '#fee090',
            '#fdae61',
            '#f46d43',
            '#d73027',
            '#a50026'
          ]
        },
      },
      // dataZoom:{
      //   handleIcon:'path://M-11.39,9.77h0a3.5,3.5,0,0,1-3.5,3.5h-22a3.5,3.5,0,0,1-3.5-3.5h0a3.5,3.5,0,0,1,3.5-3.5h22A3.5,3.5,0,0,1-11.39,9.77Z',
      // },
      series: [{
        name: 'OD Matrix',
        type: 'heatmap',
        data: data ? data : [],
        label: {
          show: false
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    });

    // 获取heatmapbox对象实例
    // this.heatmapbox = this.myChartGl.getModel().getComponent('mapbox3D').getMapbox();

  };

  render() {
    return (
      <>
        <div
          id={this.props.heatMapContainerID}
          className="heatMapBoxContainer"
          style={{ minHeight: "600px", height: "100%", width: "100%" }}
        />
      </>
    );
  }
}

export default EchartHeatMapVis;