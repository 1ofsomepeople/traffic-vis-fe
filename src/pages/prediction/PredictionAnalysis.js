import React, { Component } from 'react';
import { Row, Col, Button, PageHeader, message, Slider, Select } from 'antd';
import EchartsMapBoxVis from '../../common/EchartsMapBoxVis';
import MapBoxPointsVis from '../../common/MapBoxPointsVis'
import { dataStr_dataObj, dataObj_dataStr, loadDataList, throttle, debounce } from '../../common/apis';
import './PredictionAnalysis.css';
import { inject, observer } from 'mobx-react';
// import {predictCompareStore} from "../../store/index";
const { Option } = Select;
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
            titleTextLeft: "",
            titleTextRight: "",
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
            dataListIndex: 0, // 数据list的index
            dataType: 'history',
            historyPredDataPath: './history_predictDataList/history_pred/lr_pred/', // 历史预测数据根路径
        }

        this.DataGtNameList = null // 真实数据的name list
        this.DataPredNameList = null // 预测数据的name list


        this.asyncMapParam = this.asyncMapParam.bind(this)
        this.historyPredict = this.historyPredict.bind(this)
        this.realTimePredice = this.realTimePredice.bind(this)
        this.sliderOnChange = this.sliderOnChange.bind(this)
        this.selectOnChange = this.selectOnChange.bind(this)
    }

    componentWillUnmount() {
        console.log('PredictionAnalysis Destory')
        this.store.clearAll()
    }

    asyncMapParam(positionParam) {
        // console.log(positionParam)
        this.setState({
            ...this.state,
            mapParam: positionParam,
        })
    }

    historyPredict() {

        let startTimeStr = "2019-04-02_08-30"
        let endTimeStr = "2019-04-02_08-39"
        this.DataGtNameList = loadDataList(startTimeStr, endTimeStr)
        this.DataPredNameList = loadDataList(startTimeStr, endTimeStr)

        let pathGt = './history_predictDataList/history_gt/' + this.DataGtNameList[0]
        let pathPred = this.state.historyPredDataPath + this.DataPredNameList[0]
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
            dataType: 'history',
            titleTextLeft: "真实拥堵情况",
            titleTextRight: "拥堵预测情况 LR模型",
        })


    }
    realTimePredice() {
        // message.warning('正在开发中');
        this.store.getPredLr()
        this.store.getPredSage()

        this.setState({
            ...this.state,
            sliderDisplay: 'none',
            dataType: 'realtime',
            titleTextLeft: "LR模型预测",
            titleTextRight: "SAGE模型预测",
        })
    }

    // 改变slider的值
    sliderOnChange(value) {
        this.setState({
            ...this.state,
            dataListIndex: value
        }, () => {
            let pathGt = './history_predictDataList/history_gt/' + this.DataGtNameList[value]
            let pathPred = this.state.historyPredDataPath + this.DataGtNameList[value]
            this.store.loaddata(pathGt, 'gt')
            this.store.loaddata(pathPred, 'pred')
        })
    }

    selectOnChange(value) {
        let predPath = this.state.historyPredDataPath
        if (value === 'lr') {
            predPath = './history_predictDataList/history_pred/lr_pred/'
        }
        else if (value === 'sage') {
            predPath = './history_predictDataList/history_pred/sage_pred/'
        }

        this.setState({
            ...this.state,
            titleTextRight: '拥堵预测情况 ' + value + '模型',
            historyPredDataPath: predPath,
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
                                    onClick={throttle(this.realTimePredice, 1000)}
                                >
                                    交通拥堵预测模型对比
                                </Button>,
                            ]}
                        />
                    </Col>
                </Row>
                <Row align={"middle"} justify={"center"} gutter={[24, 4]}>
                    <Col span={20} >
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
                    <Col span={2}>
                        <Select
                            defaultValue="lr"
                            style={{ width: '100%', display: this.state.sliderDisplay }}
                            onChange={this.selectOnChange}
                        >
                            <Option value="lr">LR</Option>
                            <Option value="sage">SAGE</Option>
                        </Select>
                    </Col>
                </Row>
                <Row gutter={[16, 4]}>
                    <Col span={12} className="mapContainer">
                        <EchartsMapBoxVis
                            mapContainerID="mapContainerLeft"
                            titleText={this.state.titleTextLeft}
                            chartsParam={
                                { mapParam: this.state.mapParam }
                            }
                            data={this.state.dataType === 'history' ? this.store.dataGt : this.store.dataPredLr}
                            asyncParam={this.asyncMapParam}
                        />
                    </Col>
                    <Col span={12} className="mapContainer">
                        <EchartsMapBoxVis
                            mapContainerID="mapContainerRight"
                            titleText={this.state.titleTextRight}
                            chartsParam={
                                { mapParam: this.state.mapParam }
                            }
                            data={this.state.dataType === 'history' ? this.store.dataPred : this.store.dataPredSage}
                            asyncParam={this.asyncMapParam}
                        />
                    </Col>
                </Row>
            </div>
        );
    }
}

export default PredictionAnalysis;