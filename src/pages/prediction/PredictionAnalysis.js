import React, { Component } from 'react';
import { Row, Col, Button, PageHeader, message, Slider, Select, Descriptions, Popover } from 'antd';
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
            historyPredDataPath: './history_predictDataList/history_pred/lr_pred/', // 历史预测数据根路径

            dataIndex: 0, // history数据的index值
            predictType: 'lr', // history预测数据的预测模型类型

        }

        this.DataGtNameList = null // 真实数据的name list
        this.DataPredNameList = null // 预测数据的name list


        this.asyncMapParam = this.asyncMapParam.bind(this)
        this.historyPredict_local = this.historyPredict_local.bind(this)
        this.historyPredict_online = this.historyPredict_online.bind(this)
        this.realTimePredice = this.realTimePredice.bind(this)
        this.sliderOnChange_local = this.sliderOnChange_local.bind(this)
        this.selectOnChange_local = this.selectOnChange_local.bind(this)
        this.sliderOnChange_online = this.sliderOnChange_online.bind(this)
        this.selectOnChange_online = this.selectOnChange_online.bind(this)
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


    // 可弃置
    // 加载历史对比数据按钮点击事件 本地local数据 
    historyPredict_local() {
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
            titleTextLeft: "真实拥堵情况",
            titleTextRight: "拥堵预测情况 LR模型",
        })
    }

    // 加载历史对比数据按钮点击事件 online数据 
    historyPredict_online() {
        let startTimeStr = "2019-04-02_08-30"
        let endTimeStr = "2019-04-02_08-39"
        this.DataGtNameList = loadDataList(startTimeStr, endTimeStr)
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
            titleTextLeft: "真实拥堵情况",
            titleTextRight: "拥堵预测情况 LR模型",
            dataIndex: 0, // history数据的index值
            predictType: 'lr', // history预测数据的预测模型类型
        }, () => {
            let historyGtQueryParam = {
                dataIndex: this.state.dataIndex,
            }
            let historyPredQueryParam = {
                dataIndex: this.state.dataIndex,
                predictType: this.state.predictType,
            }
            this.store.getHistoryGt(historyGtQueryParam);
            this.store.getHistoryPred(historyPredQueryParam);
        })

    }

    realTimePredice() {
        // message.warning('正在开发中');
        this.setState({
            ...this.state,
            sliderDisplay: 'none',
            titleTextLeft: "LR模型预测",
            titleTextRight: "SAGE模型预测",
        }, () => {
            this.store.getPredLr()
            this.store.getPredSage()
        })
    }

    // 改变slider的值
    // 从public本地数据中加载预测的数据和真实数据
    sliderOnChange_local(value) {
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
    // 加载后台生成的模型预测数据和真实数据
    sliderOnChange_online(value) {
        // console.log(value)
        this.setState({
            ...this.state,
            dataIndex: value,
        }, () => {
            let historyGtQueryParam = {
                dataIndex: this.state.dataIndex,
            }
            let historyPredQueryParam = {
                dataIndex: this.state.dataIndex,
                predictType: this.state.predictType,
            }
            this.store.getHistoryGt(historyGtQueryParam);
            this.store.getHistoryPred(historyPredQueryParam);
        })
    }

    // 切换预测模型
    // 从public本地数据中加载预测的数据
    selectOnChange_local(value) {
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
        }, () => {
            let pathPred = this.state.historyPredDataPath + this.DataGtNameList[this.state.dataListIndex]
            this.store.loaddata(pathPred, 'pred')
        })
    }
    // 加载后台生成的模型预测数据
    selectOnChange_online(value) {
        // console.log(value)
        this.setState({
            ...this.state,
            predictType: value,
            titleTextRight: '拥堵预测情况 ' + value + '模型',
        }, () => {
            let historyPredQueryParam = {
                dataIndex: this.state.dataIndex,
                predictType: this.state.predictType,
            }
            this.store.getHistoryPred(historyPredQueryParam);
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
                                    onClick={this.historyPredict_online}
                                    loading={this.store.loading}
                                >
                                    加载历史预测对比数据
                                </Button>,
                                <Button
                                    key="2"
                                    type="primary"
                                    onClick={throttle(this.realTimePredice, 1000)}
                                    loading={this.store.loading}
                                >
                                    交通拥堵预测模型对比
                                </Button>,
                            ]}
                        />
                    </Col>
                </Row>
                <Row align={"middle"} justify={"center"} gutter={[24, 4]}>
                    <Col span={16} >
                        <Slider
                            min={0}
                            max={this.DataGtNameList ? this.DataGtNameList.length - 1 : 0}
                            marks={this.state.marks}
                            value={this.state.dataIndex}
                            included={false}
                            step={null}
                            defaultValue={0}
                            tooltipPlacement={'bottom'}
                            tooltipVisible={false}
                            style={{ display: this.state.sliderDisplay }}
                            onChange={this.sliderOnChange_online}
                            disabled={this.store.loading}
                        />
                    </Col>
                    <Col span={8} className="PredInfo">
                        <Descriptions
                            // title="预测算法信息"
                            layout="vertical"
                            bordered={true}
                            column={5}
                            size="small"
                            style={{ display: this.state.sliderDisplay }}
                        >
                            <Descriptions.Item
                                label="算法模型"
                            >
                                {/* {this.state.predictType} */}
                                <Select
                                    defaultValue="lr"
                                    style={{ width: '100%', display: this.state.sliderDisplay }}
                                    onChange={this.selectOnChange_online}
                                    loading={this.store.loading}
                                    disabled={this.store.loading}
                                >
                                    <Option value="lr">LR</Option>
                                    <Option value="sage">SAGE</Option>
                                </Select>
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <Popover content={
                                        <div>
                                            <p>预测正确节点数占总数的比例</p>
                                        </div>
                                    }>
                                        准确率
                                    </Popover>
                                }
                            >
                                {this.store.scorePrecision + '%'}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <Popover content={
                                        <div>
                                            <p>各类别准确率：</p>
                                            <p>通畅准确率：{this.store.precisionClear+ '%'}</p>
                                            <p>缓行准确率：{this.store.precisionSlow + '%'}</p>
                                            <p>拥堵准确率：{this.store.precisionJam + '%'}</p>
                                            <p>非通畅准确率：{this.store.precisionSlowJam+ '%'}</p>
                                        </div>
                                    }>
                                        拥堵准确率
                                    </Popover>
                                }
                            >
                                {this.store.precisionJam + '%'}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <Popover content={
                                        <div>
                                            <p>平均绝对误差</p>
                                        </div>
                                    }>
                                        MAE
                                    </Popover>
                                }
                            >
                                {this.store.scoreMAE}
                            </Descriptions.Item>

                            <Descriptions.Item
                                label={
                                    <Popover content={
                                        <div>
                                            <p>平均绝对百分比误差</p>
                                        </div>
                                    }>
                                        MAPE
                                    </Popover>
                                }
                            >
                                {this.store.scoreMAPE + '%'}
                            </Descriptions.Item>
                            
                        </Descriptions>
                    </Col>
                </Row>
                <Row
                    gutter={[16, 4]}
                >
                    <Col span={12} className="mapContainer">
                        <EchartsMapBoxVis
                            mapContainerID="mapContainerLeft"
                            titleText={this.state.titleTextLeft}
                            chartsParam={
                                { mapParam: this.state.mapParam }
                            }
                            data={this.store.dataLeft}
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
                            data={this.store.dataRight}
                            asyncParam={this.asyncMapParam}
                        />
                    </Col>
                </Row>
            </div>
        );
    }
}

export default PredictionAnalysis;