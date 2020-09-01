import React, { Component } from 'react';
import { Row, Col, Button, PageHeader } from 'antd';
import MapBoxVis from '../../common/MapBoxVis';

import './PredictionAnalysis.css';

class PredictionAnalysis extends Component {
    constructor(props) {
        super(props);
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
            chartsParam: {
                titleText: "交通拥堵情况三维柱状图",
            }
        }
    }
    render() { 
        return (
            <div>
                <Row gutter={[16, 0]}>
                    <Col span={24}>
                        <PageHeader
                            ghost={false}
                            onBack={() => window.history.back()}
                            title="交通拥堵预测"
                            // subTitle="交通拥堵"
                        />
                    </Col>
                </Row>
                <Row gutter={[16, 4]}>
                    <Col span={12} className="mapContainer">
                        {/* <MapBoxVis chartsParam={this.state.chartsParam} data={this.state.data} flyActionParam={this.state.flyActionParam} /> */}
                        <div style={{background:"gray", minHeight: "450px"}}></div>
                    </Col>
                    <Col span={12} className="mapContainer">
                        {/* <MapBoxVis chartsParam={this.state.chartsParam} data={this.state.data} flyActionParam={this.state.flyActionParam} /> */}
                        <div style={{background:"gray", minHeight: "450px"}}></div>
                    </Col>
                </Row>
            </div>
        );
    }
}
 
export default PredictionAnalysis;