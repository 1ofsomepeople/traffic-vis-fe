import React, { Component } from 'react';
import { Row, Col, Button, PageHeader, message, Slider } from 'antd';
import EchartsMapBoxVis from '../../common/EchartsMapBoxVis';
import MapBoxPointsVis from '../../common/MapBoxPointsVis'

import './PredictionAnalysis.css';
import { inject, observer } from 'mobx-react';
// import {predictCompareStore} from "../../store/index";

@inject('store')
@observer
class PredictionAnalysis extends Component {
    constructor(props) {
        super(props);
        this.store = props.store.predictCompareStore
        console.log(this.store.data)
        this.state = {
            // 模拟数据
            data: {
                data: [
                    // [116.368608, 39.901744, 150],
                    // [116.378608, 39.901744, 350],
                    // [116.388608, 39.901744, 500],
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
            marks:{

            }
        }

        this.asyncMapParam = this.asyncMapParam.bind(this)
        this.historyPredict = this.historyPredict.bind(this)
        this.realTimePredice = this.realTimePredice.bind(this)
    }

    asyncMapParam(positionParam) {
        console.log(positionParam)
        this.setState({
            ...this.state,
            mapParam: positionParam
        })
    }

    historyPredict() {
        message.warning('正在开发中');

    }
    realTimePredice() {
        message.warning('正在开发中');
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
                <Row gutter={[16, 4]}>
                    <Col span={12} className="mapContainer">
                        <EchartsMapBoxVis mapContainerID="mapContainerLeft" chartsParam={{ titleText: "拥堵真实情况", mapParam: this.state.mapParam }} data={this.state.data} asyncParam={this.asyncMapParam} />
                        {/* <MapBoxPointsVis mapContainerID="mapContainerLeft"/> */}
                    </Col>
                    <Col span={12} className="mapContainer">
                        <EchartsMapBoxVis mapContainerID="mapContainerRight" chartsParam={{ titleText: "拥堵预测情况", mapParam: this.state.mapParam }} data={this.state.data} asyncParam={this.asyncMapParam} />
                        {/* <MapBoxPointsVis mapContainerID="mapContainerRight"/> */}
                    </Col>
                </Row>
                <Row align={"middle"} justify={"center"} className="margintop20">
                    <Col span={20} >
                        <Slider defaultValue={0} tooltipVisible marks={this.state.marks} step={null}/>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default PredictionAnalysis;