import React, { Component } from 'react';
import { Row, Col, Button, PageHeader } from 'antd';
import MapBoxVis from '../common/MapBoxVis';
import './Analysis.css'
class Analysis extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // 模拟数据
            data: {
                data:[
                    [116.368608, 39.901744, 150],
                    [116.378608, 39.901744, 350],
                    [116.388608, 39.901744, 500],
                ],
                datatime: ''
            }
        }
    };

    // 加载数据
    loaddata = (jsonPath) => {
        // 读取本地的json，需要将json文件放到与public/index.html同级目录
        fetch(jsonPath)
        .then(res => res.json())
        .then(json => {
            let dataP = json.data
            for (let i = 0, len = dataP.length; i < len; i++) {
                // 数据映射 1->1 3->150 7-175 10->200
                switch (dataP[i][2]) {
                    case 3:
                        dataP[i][2] = 150;
                        break;
                    case 7:
                        dataP[i][2] = 175;
                        break;
                    case 10:
                        dataP[i][2] = 200;
                        break;
                    default:
                        break;
                }
            }
            // 初始化数据结构
            let data = {
                data: [],
                datatime: ''
            }
            data.data = dataP
            data.datatime = jsonPath.split('/')[jsonPath.split('/').length - 1].split('.')[0]
            this.setState({
                data:data
            })
        })
    };

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
                                <Button
                                    key="1"
                                    type="primary"
                                    onClick={() => {
                                        this.loaddata("./2019-04-02_09-00.json")
                                    }}>测试数据</Button>,
                                <Button key="2" type="primary" >数据轮播</Button>,
                                <Button key="3" type="primary" >单数据动态演示</Button>,
                                <Button key="4" type="primary" >局部演示</Button>,
                                <Button key="5" type="primary" >全局演示</Button>,
                                <Button key="6" >地图重置</Button>,
                            ]}
                        />
                    </Col>
                </Row>
                <Row gutter={[16, 16]}>
                    <Col span={24} className="mapContainer">
                        <MapBoxVis data={this.state.data} />
                    </Col>
                </Row>
            </div>
        );
    };
};

export default Analysis;