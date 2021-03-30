import { Row, Col } from 'antd';
import React, { Component } from 'react';


import './home.css';
import MapBoxPointsVis from '../../common/MapBoxPointsVis'
import EchartsMapBoxVis from '../../common/EchartsMapBoxVis';


class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        return (
            //!点击主页按钮出现的三行组件
            <div>
                <Row className="homeBar">
                    <Col span={6} className="positionLeft">
                        交通数据可视化
                    </Col>
                    <Col span={18} className="positionRight">
                        {/* <MapBoxPointsVis mapContainerID="homeBar1"/> */}
                    </Col>
                </Row>
                <Row className="homeBar">
                    <Col span={18} className="positionLeft">
                        
                    </Col>
                    <Col span={6} className="positionRight">
                        拥堵分析
                    </Col>
                </Row>
                <Row className="homeBar">
                    <Col span={6} className="positionLeft">
                        实时预测
                    </Col>
                    <Col span={18} className="positionRight">
                        
                    </Col>
                </Row>
            </div>
        );
    }
}

export default Home;