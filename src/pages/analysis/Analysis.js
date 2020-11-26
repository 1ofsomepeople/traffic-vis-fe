import React, { Component } from 'react';
import { Row, Col, Button, PageHeader, message } from 'antd';
import EchartsMapBoxVis from '../../common/EchartsMapBoxVis';
import { dataStr_dataObj, dataObj_dataStr, loadDataList, throttle, debounce } from '../../common/apis';
import { inject, observer } from 'mobx-react';
import echarts from 'echarts';

import './Analysis.css'
import Pie from '../../common/basicCharts/Pie';


@inject('store')
@observer
class Analysis extends Component {
    constructor(props) {
        super(props);
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
        }
        this.DataNameList = null // 轮播的数据name list
        this.dataListIndex = 0 // 遍历数据list的index
        this.isplaying = false // 数据是否正在轮播

        this.loaddata = this.loaddata.bind(this)
        this.onClickBtn1 = this.onClickBtn1.bind(this)
        this.onClickBtn2 = this.onClickBtn2.bind(this)
        this.onClickBtn3 = this.onClickBtn3.bind(this)
        this.onClickBtn4 = this.onClickBtn4.bind(this)
        this.onClickBtn5 = this.onClickBtn5.bind(this)
        this.onClickBtn6 = this.onClickBtn6.bind(this)
    };

    // 加载数据
    async loaddata(jsonPath) {
        // 初始化数据结构
        let data = {
            data: [],
            datatime: ''
        }
        let response = await fetch(jsonPath)
        let resData = await response.json();
        resData = resData.data
        if (resData === undefined) {
            message.warning('获取数据失败');
        }
        else {
            // console.log(resData)
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
            titleText: "交通拥堵情况三维柱状图",
        })
        return data
    }



    intervalPlay(DataNameList) {
        this.intervalID = setInterval(() => {
            let path = './testDataList/' + DataNameList[this.dataListIndex > DataNameList.length ? this.dataListIndex = 0 : this.dataListIndex++]
            this.loaddata(path)
        }, 500)
    }

    // 加载测试数据
    onClickBtn1() {
        this.loaddata("./2019-04-02_09-00.json")
    }
    // 数据轮播
    onClickBtn2() {
        // this.setState({
        //     ...this.state,
        //     flyActionParam: null
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
    onClickBtn3() {
        // message.warning('正在开发中');
        this.store.getRealTimeData()
        this.setState({
            ...this.state,
            dataType: 'realtime',
            titleText: "交通实时拥堵情况三维柱状图",
        })
    }
    // 局部展示
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
    // 全局展示
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
    // 地图重置
    onClickBtn6() {
        this.store.clearAll()
        this.setState({
            data: {
                data: [],
                datatime: ''
            },
            titleText: "",
            flyActionParam: [116.368608, 39.901744, 10, 60, -30, 1000]
        })
        clearInterval(this.intervalID);
        clearTimeout(this.timeoutID)
        this.timeoutID = null
        this.intervalID = null
        this.DataNameList = null
        this.dataListIndex = 0
    }
    componentDidMount() {
        window.onresize = function () {
            echarts.init(document.getElementById("mapContainer")).resize();
            echarts.init(document.getElementById("pie1")).resize();
        };
    };

    componentDidUpdate() {

    };

    componentWillUnmount() {
        console.log('Analysis Destory')
        this.store.clearAll()
    }

    render() {

        return (
            <div id='analysisLayout'>
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
                                    onClick={this.onClickBtn6}
                                    loading={this.store.loading}
                                >地图重置</Button>,
                            ]}
                        />
                    </Col>
                </Row>
                <Row gutter={[16, 4]} >
                    <Col span={18} className="mapContainer">
                        <EchartsMapBoxVis
                            mapContainerID="mapContainer"
                            chartsParam={this.state.chartsParam}
                            data={this.state.dataType === 'history' ? this.state.data : this.store.dataGt}
                            flyActionParam={this.state.flyActionParam}
                            titleText={this.state.titleText}
                        />
                    </Col>
                    <Col span={6} >
                        <Pie chartsPieID="pie1" />
                    </Col>

                </Row>
            </div>
        );
    };
};

export default Analysis;