import React, { Component } from 'react';
import echarts from 'echarts';
import 'echarts-gl';

class JamScoreDash extends Component {
    constructor(props) {
        super(props);
        this.state = {  }

        this.chartsDash = null // echarts对象实例
        
        this.showDash = this.showDash.bind(this)
    }

    showDash() {
        // echarts对象实例
        this.chartsDash = echarts.init(document.getElementById(this.props.chartsDashID));

        let testOption = {
            title: {
                text: '拥堵指数',
                left: 'top' // title 组件离容器左侧的距离。
            },
            angleAxis: {
                max: 100, 
                clockwise: true,
                startAngle: -135,
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    show: false
                },
                splitLine: {
                    show: false
                }
            },
            radiusAxis: {
                type: 'category',
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    show: false
                },
                splitLine: {
                    show: false
                }
            },
            polar: {
                center: ['50%', '50%'],
                radius: '160%' //图形大小
            },
            series: [{
                type: 'bar',
                data: [{
                    value: 75,
                    itemStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
                                offset: 1,
                                color: '#369674'
                            }, {
                                offset: 0.70,
                                color: '#feb64d'
                            }, {
                                offset: 0,
                                color: '#ff0000'
                            }])
                        }
                    },
                }],
                coordinateSystem: 'polar',
                roundCap: true,
                barWidth: 10,
            }, {
                type: 'gauge',
                radius: '110%',
                min: 0,
                max: 100,
                splitNumber: 4,
                axisLine: {
                    show: false,
                },
                axisLabel: {
                    color: '#999999',
                    fontSize: 10
                },
                itemStyle: {
                    color: '#999999'
                },
                pointer: {
                    length: '50%',
                    width: 6
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    show: false
                },
                detail: {
                    color: '#333333',
                    fontSize: 25
                },
                data: [50]
            }]
        };

        this.chartsDash.setOption(testOption)
    }

    componentDidMount() {
        this.showDash();
        window.onresize = () => {
            this.chartsDash.resize()
        }
    }

    componentWillUnmount() {
        console.log('chartsDash Destory')
        this.chartsDash = null // echarts对象实例
    }

    render() {
        return (
            <div id={this.props.chartsDashID} style={{ minHeight: "200px", height: "100%", width: "100%" }} />
        );
    }

}
 
export default JamScoreDash;