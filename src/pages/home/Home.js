import React, { Component } from 'react';
import { Row, Col } from 'antd';
import EchartsMapBoxVis from '../../common/EchartsMapBoxVis';
import MapBoxPointsVis from '../../common/MapBoxPointsVis'

import './home.css';
class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        return (
            <div>
                <Row className="homeBar">
                    <Col span={6} className="positionLeft">
                        
                    </Col>
                    <Col span={18} className="positionRight">
                        <MapBoxPointsVis mapContainerID="homeBar1"/>
                    </Col>
                </Row>
                <Row className="homeBar">
                    <Col span={18} className="positionLeft">
                        
                    </Col>
                    <Col span={6} className="positionRight">
                        
                    </Col>
                </Row>
                <Row className="homeBar">
                    <Col span={6} className="positionLeft">
                        
                    </Col>
                    <Col span={18} className="positionRight">
                        
                    </Col>
                </Row>
            </div>
        );
    }
}

export default Home;