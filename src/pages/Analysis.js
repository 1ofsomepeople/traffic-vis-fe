import React, { Component } from 'react';
import { Row, Col, Button, PageHeader, Descriptions } from 'antd';
import MapBoxVis from '../common/MapBoxVis';

class Analysis extends Component {

    componentDidMount() {
    };

    render() {
        return (
            <div>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <PageHeader
                            ghost={false}
                            onBack={() => window.history.back()}
                            title="分析页"
                            subTitle="交通数据分析"
                            extra={[
                                <Button key="1" type="primary" >测试数据</Button>,
                                <Button key="2" type="primary" >数据轮播</Button>,
                                <Button key="3" type="primary" >单数据动态演示</Button>,
                                <Button key="4" type="primary" >局部演示</Button>,
                                <Button key="5" type="primary" >全局演示</Button>,
                                <Button key="6" >地图重置</Button>,
                            ]}
                        />
                    </Col>
                </Row>
                <Row align="middle">
                    <MapBoxVis />
                </Row>
            </div>
        );
    };
};

export default Analysis;