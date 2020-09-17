import React, { Component } from 'react';
import { Row, Col, Button, PageHeader } from 'antd';
import EchartsMapBoxVis from '../../common/EchartsMapBoxVis';
import MapBoxPointsVis from '../../common/MapBoxPointsVis'

import './PredictionAnalysis.css';

class PredictionAnalysis extends Component {
    constructor(props) {
        super(props);
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
            mapParam: {}
        }

        this.asyncMapParam = this.asyncMapParam.bind(this)
    }

    asyncMapParam(positionParam) {
        console.log(positionParam)
        this.setState({
            ...this.state,
            mapParam: positionParam
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
            </div>
        );
    }
}

export default PredictionAnalysis;