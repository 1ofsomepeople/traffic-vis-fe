import React, { Component } from 'react';
import { Row, Col, Button, PageHeader, message } from 'antd';
import EchartsMapBoxVis from '../../common/EchartsMapBoxVis';
import {dataStr_dataObj, dataObj_dataStr, loadDataList} from '../../common/apis';
import './Analysis.css'
class Analysis extends Component {
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
        this.DataNameList = null // 轮播的数据name list
        this.dataListIndex = 0 // 遍历数据list的index

        this.loaddata = this.loaddata.bind(this)
    };

    // 加载数据
    loaddata1 = (jsonPath) => {
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
                console.log(data)
                this.setState({
                    data: data
                })
            })
    };

    // 加载数据
    async loaddata(jsonPath){
        // 初始化数据结构
        let data = {
            data: [],
            datatime: ''
        }
        let response  = await fetch(jsonPath)
        let resData = await response.json();
        resData = resData.data
        if(resData === undefined){
            message.warning('获取数据失败');
        }
        else{
            console.log(resData)
            // 数据处理
            for (let i = 0, len = resData.length; i < len; i++) {
                // 数据映射 1->1 3->150 7-175 10->200
                switch (resData[i][2]) {
                    case 3:
                        resData[i][2] = 150;
                        break;
                    case 7:
                        resData[i][2] = 175;
                        break;
                    case 10:
                        resData[i][2] = 200;
                        break;
                    default:
                        break;
                }
            }
            data.data = resData
            data.datatime = jsonPath.split('/')[jsonPath.split('/').length - 1].split('.')[0]
        }
        this.setState({
            data: data
        })
        return data
    }


    
    intervalPlay(DataNameList) {
        this.intervalID = setInterval(() => {
            let path = './testDataList/' + DataNameList[this.dataListIndex > DataNameList.length ? this.dataListIndex = 0 : this.dataListIndex++]
            this.loaddata(path)
        }, 500)
    }
    

    componentDidMount() {

    };

    componentWillUnmount() {
        console.log('Analysis Destory')
    }

    render() {
        return (
            <div>
                <Row gutter={[16, 0]}>
                    <Col span={24}>
                        <PageHeader
                            ghost={false}
                            onBack={() => window.history.back()}
                            title="交通拥堵可视化分析"
                            // subTitle="交通拥堵"
                            extra={[
                                <Button
                                    key="1"
                                    type="primary"
                                    onClick={() => {
                                        this.loaddata("./2019-04-02_09-00.json")
                                    }}>测试数据</Button>,
                                <Button
                                    key="2"
                                    type="primary"
                                    onClick={() => {
                                        this.setState({
                                            ...this.state,
                                            flyActionParam: null
                                        })
                                        if (this.intervalID) {
                                            clearInterval(this.intervalID);
                                            clearTimeout(this.timeoutID)
                                            this.intervalID = null
                                        }
                                        else {
                                            this.DataNameList = loadDataList()
                                            this.intervalPlay(this.DataNameList)
                                        }
                                    }}
                                >数据轮播</Button>,
                                // <Button key="3" type="primary" >单数据动态演示</Button>,
                                <Button
                                    key="4"
                                    type="primary"
                                    onClick={() => {
                                        if (this.intervalID) {
                                            clearInterval(this.intervalID);
                                            this.intervalID = null
                                        }
                                        this.setState({
                                            ...this.state,
                                            flyActionParam: [116.360163, 40.001514, 14, 60, -45, 1000]
                                        }, () => {
                                            if (this.DataNameList) {
                                                this.timeoutID = setTimeout(() => { 
                                                    this.intervalPlay(this.DataNameList) 
                                                }, 2000)
                                            }
                                        })
                                        console.log(this.state.flyActionParam)
                                    }}
                                >局部演示</Button>,
                                <Button
                                    key="5"
                                    type="primary"
                                    onClick={() => {
                                        if (this.intervalID) {
                                            clearInterval(this.intervalID);
                                            this.intervalID = null
                                        }
                                        this.setState({
                                            ...this.state,
                                            flyActionParam: [116.420608, 39.851744, 11.5, 60, -30, 1000]
                                        }, () => {
                                            if (this.DataNameList) {
                                                this.timeoutID = setTimeout(() => { 
                                                    this.intervalPlay(this.DataNameList) 
                                                }, 2000)
                                            }
                                        })
                                        console.log(this.state.flyActionParam)
                                    }}
                                >全局演示</Button>,
                                <Button
                                    key="6"
                                    onClick={() => {
                                        this.setState({
                                            data: {
                                                data: [],
                                                datatime: ''
                                            },
                                            flyActionParam: [116.368608, 39.901744, 10, 60, -30, 1000]
                                        })
                                        clearInterval(this.intervalID);
                                        clearTimeout(this.timeoutID)
                                        this.timeoutID = null
                                        this.intervalID = null
                                        this.DataNameList = null
                                        this.dataListIndex = 0
                                    }}>地图重置</Button>,
                            ]}
                        />
                    </Col>
                </Row>
                <Row gutter={[16, 4]}>
                    <Col span={24} className="mapContainer">
                        <EchartsMapBoxVis mapContainerID="mapContainer" chartsParam={this.state.chartsParam} data={this.state.data} flyActionParam={this.state.flyActionParam} />
                    </Col>
                </Row>
            </div>
        );
    };
};

export default Analysis;