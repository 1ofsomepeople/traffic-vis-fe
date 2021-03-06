import React, { Component } from 'react';
import echarts from 'echarts';
import 'echarts-gl';
import { len } from 'echarts-gl';

class Line extends Component {
    constructor(props) {
        super(props);
        this.state = {}

        
        this.chartsLine = null // echarts对象实例

    }

    initLine = () => {
        // 初始化echarts对象实例
        this.chartsLine = echarts.init(document.getElementById(this.props.chartsLineID));
    }
    updateLine = () => {
        
        let testOption = {
            title: {
                text: this.props.titleText,
                left: 'top' // title 组件离容器左侧的距离。
            },
            backgroundColor: '#fff',
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
                top: '20%',
                left: '5%',
                right: '5%',
                bottom: '10%',
                // containLabel: true
            },
            xAxis: [{
                type: 'category',
                color: '#59588D',
                axisLine: {
                    show: true
                },
                axisLabel: {
                    color: '#282828'
                },
                splitLine: {
                    show: true
                },

                axisTick: {
                    show: false
                },
                boundaryGap: true,
                data: this.props.xAxisdata, // 坐标轴刻度数组

            }],

            yAxis: [{
                type: 'value',
                min: 0,
                splitNumber: 4,
                // splitLine: {
                //     show: true,
                // },
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
                axisTick: {
                    show: false,
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(131,101,101,0.2)',
                        type: 'dashed',
                    }
                }
            }],
            series: [{
                name: '',
                type: 'line',
                // smooth: true, //是否平滑
                showAllSymbol: true,
                symbol: 'circle',
                symbolSize: 10,
                lineStyle: {
                    normal: {
                        color: "#48B3FF"
                    },
                },
                label: {
                    show: false,
                    position: 'top',
                    textStyle: {
                        color: '#48B3FF',
                    }
                },

                itemStyle: {
                    color: "#FFF",
                    borderColor: "#48B3FF",
                    borderWidth: 2,

                },
                tooltip: {
                    show: true
                },
                areaStyle: {
                    normal: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgba(195,230,255,1)'
                        },
                        {
                            offset: 1,
                            color: 'rgba(195,230,255,0.1)'
                        }
                        ], false),
                        shadowColor: 'rgba(195,230,255,0.1)',
                        shadowBlur: 20
                    }
                },
                data: this.props.data, // 折线图数据数组
            }]
        };

        this.chartsLine.setOption(testOption)
    }

    componentDidMount() {
        this.initLine();
        window.onresize = () => {
            this.chartsLine.resize()
        }
    }

    componentDidUpdate() {
        this.updateLine()
    }

    componentWillUnmount() {
        console.log('chartsLine Destory')
        this.chartsLine = null // echarts对象实例
    }

    render() {
        return (
            <div 
                id={this.props.chartsLineID} 
                style={{ 
                    minHeight: "200px", 
                    height: "100%", 
                    width: "100%", 
                    padding:"5px" ,
                }} />
        );
    }
}

export default Line;

