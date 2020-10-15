import React, { Component } from 'react';
import { Row, Col, Button, PageHeader, message, Slider } from 'antd';
import EchartsMapBoxVis from '../../common/EchartsMapBoxVis';
import MapBoxPointsVis from '../../common/MapBoxPointsVis'
import { dataStr_dataObj, dataObj_dataStr, loadDataList, throttle, debounce } from '../../common/apis';
import './PredictionAnalysis.css';
import { inject, observer } from 'mobx-react';
// import {predictCompareStore} from "../../store/index";

@inject('store')
@observer
class PredictionAnalysis extends Component {
    constructor(props) {
        super(props);
        this.store = props.store.predictCompareStore
        // console.log(this.store.data)
        this.state = {
            // 模拟数据
            dataPred: {
                data: [
                ],
                datatime: ''
            },
            dataGt: {
                data: [
                ],
                datatime: ''
            },
            chartsParam: {
                titleText: "交通拥堵情况三维柱状图",
            },
            mapParam: {
                // Mapbox 地图样式 style
                style: 'mapbox://styles/mapbox/outdoors-v11',
                center: [116.368608, 39.901744],
                // Mapbox 地图的缩放等级
                zoom: 10,
                // 视角俯视的倾斜角度,默认为0，也就是正对着地图。最大60。
                pitch: 0,
                // Mapbox 地图的旋转角度
                bearing: 0,
            },
            marks: {

            },
            sliderDisplay: 'none', //此状态为Slider的display的取值
            dataListIndex: 0 // 数据list的index
        }

        this.DataGtNameList = null // 真实数据的name list
        this.DataPredNameList = null // 预测数据的name list


        this.asyncMapParam = this.asyncMapParam.bind(this)
        this.historyPredict = this.historyPredict.bind(this)
        this.realTimePredice = this.realTimePredice.bind(this)
        this.sliderOnChange = this.sliderOnChange.bind(this)
    }

    asyncMapParam(positionParam) {
        // console.log(positionParam)
        this.setState({
            ...this.state,
            mapParam: positionParam
        })
    }

    historyPredict() {

        let startTimeStr = "2019-04-02_08-30"
        let endTimeStr = "2019-04-02_08-39"
        this.DataGtNameList = loadDataList(startTimeStr, endTimeStr)
        this.DataPredNameList = loadDataList(startTimeStr, endTimeStr)

        let pathGt = './history_predictDataList/history_gt/' + this.DataGtNameList[0]
        let pathPred = './history_predictDataList/history_pred/' + this.DataPredNameList[0]
        this.store.loaddata(pathGt, 'gt')
        this.store.loaddata(pathPred, 'pred')

        let sliderMarks = {}
        for (let index = 0; index < this.DataGtNameList.length; index++) {
            const element = this.DataGtNameList[index];
            // sliderMarks[index] = element.split('.')[0]
            sliderMarks[index] = {
                style: {
                    // color: '#1890ff',
                    width: '120px'
                },
                label: <span>{element.split('.')[0].split('_')[1].split('-').join(':')}</span>
            }
        }
        this.setState({
            ...this.state,
            marks: sliderMarks,
            sliderDisplay: 'block',
        })


    }
    realTimePredice() {
        // message.warning('正在开发中');
        this.store.getRealTimeData()
    }

    // 改变slider的值
    sliderOnChange(value) {
        this.setState({
            ...this.state,
            dataListIndex: value
        }, () => {
            let pathGt = './history_predictDataList/history_gt/' + this.DataGtNameList[value]
            let pathPred = './history_predictDataList/history_pred/' + this.DataGtNameList[value]
            this.store.loaddata(pathGt, 'gt')
            this.store.loaddata(pathPred, 'pred')
        })
    }
    
    render() {
        return (
            <div>
                <Row gutter={[16, 0]}>
                    <Col span={24}>
                        <PageHeader
                            ghost={false}
                            onBack={() => window.history.back()}
                            title="交通拥堵预测对比"
                            // subTitle="交通拥堵"
                            extra={[
                                <Button
                                    key="1"
                                    type="primary"
                                    onClick={this.historyPredict}
                                >
                                    加载历史预测对比数据
                                </Button>,
                                <Button
                                    key="2"
                                    type="primary"
                                    onClick={this.realTimePredice}
                                >
                                    实时交通预测
                                </Button>,
                            ]}
                        />
                    </Col>
                </Row>
                <Row align={"middle"} justify={"center"}>
                    <Col span={22} >
                        <Slider
                            min={0}
                            max={this.DataGtNameList ? this.DataGtNameList.length - 1 : 0}
                            marks={this.state.marks}
                            included={false}
                            step={null}
                            defaultValue={0}
                            tooltipPlacement={'bottom'}
                            tooltipVisible={false}
                            style={{ display: this.state.sliderDisplay }}
                            onChange={this.sliderOnChange}
                        />
                    </Col>
                </Row>
                <Row gutter={[16, 4]}>
                    <Col span={12} className="mapContainer">
                        <EchartsMapBoxVis mapContainerID="mapContainerLeft" chartsParam={{ titleText: "拥堵真实情况", mapParam: this.state.mapParam }} data={this.store.dataGt} asyncParam={this.asyncMapParam} />
                        {/* <MapBoxPointsVis mapContainerID="mapContainerLeft"/> */}
                    </Col>
                    <Col span={12} className="mapContainer">
                        <EchartsMapBoxVis mapContainerID="mapContainerRight" chartsParam={{ titleText: "拥堵预测情况", mapParam: this.state.mapParam }} data={this.store.dataPred} asyncParam={this.asyncMapParam} />
                        {/* <MapBoxPointsVis mapContainerID="mapContainerRight"/> */}
                    </Col>
                </Row>
            </div>
        );
    }
}

export default PredictionAnalysis;