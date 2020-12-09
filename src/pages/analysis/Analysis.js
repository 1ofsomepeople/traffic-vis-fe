import React, { Component } from 'react';
import { Row, Col, Button, PageHeader, message, Statistic, Progress, Card } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, AlertOutlined } from '@ant-design/icons';
import EchartsMapBoxVis from '../../common/EchartsMapBoxVis';
import { dataStr_dataObj, dataObj_dataStr, loadDataList, throttle, debounce } from '../../common/apis';
import { inject, observer } from 'mobx-react';
import echarts from 'echarts';
import mapboxgl from 'mapbox-gl';
import * as d3 from 'd3';

import './Analysis.css'
import Pie from '../../common/basicCharts/Pie';
import Line from '../../common/basicCharts/Line';
import JamScoreDash from '../../common/basicCharts/JamScoreDash';


@inject('store')
@observer
class Analysis extends Component {
    constructor(props) {
        super(props);
        this.store = props.store.analysisStore
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
            dataType: 'history',
            chartsParam: {
                // titleText: "交通拥堵情况三维柱状图",
            },
            titleText: "",
            extraChartsShow: false, // 额外图表的显示情况
        }
        window.mapboxgl = mapboxgl;
        this.DataNameList = null // 轮播的数据name list
        this.dataListIndex = 0 // 遍历数据list的index
        this.isplaying = false // 数据是否正在轮播

        this.mapRef = React.createRef(); // ref
        this.mapbox = null // mapbox实例
        // window.mapboxgl = mapboxgl;


        this.loaddata = this.loaddata.bind(this)
        this.onClickBtn1 = this.onClickBtn1.bind(this)
        this.onClickBtn2 = this.onClickBtn2.bind(this)
        this.onClickBtn3 = this.onClickBtn3.bind(this)
        this.onClickBtn4 = this.onClickBtn4.bind(this)
        this.onClickBtn5 = this.onClickBtn5.bind(this)
        this.onClickBtn6 = this.onClickBtn6.bind(this)
        this.onClickBtn7 = this.onClickBtn7.bind(this)
        this.resizeAllCharts = this.resizeAllCharts.bind(this)
    };

    // 加载数据
    async loaddata(jsonPath) {
        // 初始化数据结构
        let data = {
            data: [],
            datatime: ''
        }
        let response = await fetch(jsonPath)
        let resData = await response.json();
        resData = resData.data
        if (resData === undefined) {
            message.warning('获取数据失败');
        }
        else {
            // console.log(resData)
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
            data: data,
            dataType: 'history',
            titleText: "交通拥堵情况三维柱状图",
        })
        return data
    }



    intervalPlay(DataNameList) {
        this.intervalID = setInterval(() => {
            let path = './testDataList/' + DataNameList[this.dataListIndex > DataNameList.length ? this.dataListIndex = 0 : this.dataListIndex++]
            this.loaddata(path)
        }, 500)
    }

    // 加载测试数据
    onClickBtn1() {
        this.loaddata("./2019-04-02_09-00.json")
        this.setState({
            ...this.state,
            extraChartsShow: true,
        }, () => {
            this.resizeAllCharts()
        })
    }
    // 数据轮播
    onClickBtn2() {
        // this.setState({
        //     ...this.state,
        //     flyActionParam: null
        // })
        if (this.intervalID) {
            clearInterval(this.intervalID);
            clearTimeout(this.timeoutID)
            this.intervalID = null
            this.isplaying = false
        }
        else {
            this.isplaying = true

            let startTimeStr = "2019-04-02_08-30"
            let endTimeStr = "2019-04-02_09-30"
            this.DataNameList = loadDataList(startTimeStr, endTimeStr)
            this.intervalPlay(this.DataNameList)
        }
    }
    // 加载实时交通数据
    onClickBtn3() {
        // message.warning('正在开发中');
        this.store.getRealTimeData()
        this.setState({
            ...this.state,
            dataType: 'realtime',
            titleText: "交通实时拥堵情况三维柱状图",
            extraChartsShow: false,
        }, () => {
            this.resizeAllCharts()
        })
    }
    // 局部展示
    onClickBtn4() {
        if (this.intervalID) {
            clearInterval(this.intervalID);
            this.intervalID = null
        }
        this.setState({
            ...this.state,
            flyActionParam: [116.360163, 40.001514, 14, 60, -45, 1000]
        }, () => {
            if (this.DataNameList && this.isplaying) {
                this.timeoutID = setTimeout(() => {
                    this.intervalPlay(this.DataNameList)
                    this.setState({
                        ...this.state,
                        flyActionParam: null
                    })
                }, 2000)
            }

        })
    }
    // 全局展示
    onClickBtn5() {
        if (this.intervalID) {
            clearInterval(this.intervalID);
            this.intervalID = null
        }
        this.setState({
            ...this.state,
            flyActionParam: [116.420608, 39.851744, 11.5, 60, -30, 1000]
        }, () => {
            if (this.DataNameList && this.isplaying) {
                this.timeoutID = setTimeout(() => {
                    this.intervalPlay(this.DataNameList)
                    this.setState({
                        ...this.state,
                        flyActionParam: null
                    })
                }, 2000)
            }
        })
    }
    // 重置地图，更新摄像机视角
    resetCamera = () => {
        this.setState({
            ...this.state,
            flyActionParam: [116.368608, 39.901744, 10, 60, -30, 1000],
        })
    }
    // 地图重置
    onClickBtn6() {
        this.store.clearAll()
        this.setState({
            data: {
                data: [],
                datatime: ''
            },
            titleText: "",
            // flyActionParam: [116.368608, 39.901744, 10, 60, -30, 1000],
            extraChartsShow: false,
        }, () => {
            this.resizeAllCharts()
            this.resetCamera()
        })
        clearInterval(this.intervalID);
        clearTimeout(this.timeoutID)
        this.timeoutID = null
        this.intervalID = null
        this.DataNameList = null
        this.dataListIndex = 0

        // 清除mapbox图层和数据源
        if (this.mapbox.getLayer('line')) {
            this.mapbox.removeLayer('line')
            this.mapbox.removeSource('line')
            this.mapbox.removeLayer('linePoint')
            this.mapbox.removeSource('linePoint')
        }
        console.log(this.mapbox)
    }
    onClickBtn7() {
        // 清除mapbox图层和数据源
        if (this.mapbox.getLayer('line')) {
            this.mapbox.removeLayer('line')
            this.mapbox.removeSource('line')
            this.mapbox.removeLayer('linePoint')
            this.mapbox.removeSource('linePoint')
        }

        let color = [
            '#ff0000', // red
            '#feb64d', // yello 
            '#369674', // green
        ]

        // 道路测试数据
        let geojson = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {
                        'color': color[0]
                    },
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            [116.326534, 39.993866],
                            [116.326624, 39.991486],
                        ],
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        'color': color[1]
                    },
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            [116.326624, 39.991486],
                            [116.326964, 39.984936],
                        ],
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        'color': color[2]
                    },
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            [116.326964, 39.984936],
                            [116.327105, 39.982096],
                        ],
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        'color': color[1]
                    },
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            [116.327105, 39.982096],
                            [116.327225, 39.979745],
                        ],
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        'color': color[0]
                    },
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            [116.327225, 39.979745],
                            [116.327405, 39.975575],
                        ],
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        'color': color[2]
                    },
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            [116.327405, 39.975575],
                            [116.327585, 39.972785],
                        ],
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        'color': color[1]
                    },
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            [116.327585, 39.972785],
                            [116.327895, 39.966405]
                        ],
                    }
                },
            ]
        };
        // 道路路段中点点测试数据
        let roadPointsgeojson = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {
                        "description": "<strong>双清路 至 成府路</strong><p>拥堵，时速20公里</p>",
                        "icon": "bar"
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [116.326579, 39.992676]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "description": "<strong>成府路 至 北四环西路辅路</strong><p>畅通，时速59公里</p>",
                        "icon": "bar"
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [116.326794, 39.988151]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "description": "<strong>北四环西路辅路 至 中关村南一条</strong><p>缓慢，时速34公里</p>",
                        "icon": "bar"
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [116.3270595, 39.983146]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "description": "<strong>中关村南一条 至 中关村南路</strong><p>缓慢，时速40公里</p>",
                        "icon": "bar"
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [116.327185, 39.98055]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "description": "<strong>中关村南路 至 知春路</strong><p>缓慢，时速27公里</p>",
                        "icon": "bar"
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [116.327315, 39.97766]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "description": "<strong>知春路 至 双榆树北路</strong><p>缓慢，时速39公里</p>",
                        "icon": "bar"
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [116.32752, 39.97376]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "description": "<strong>双榆树北路 至 北三环西路辅路</strong><p>畅通，时速41公里</p>",
                        "icon": "bar"
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [116.327765, 39.968965]
                    }
                },
            ]
        };

        let speedValue = [20, 59, 34, 40, 27, 39, 41]

        let centerPoint = geojson.features[geojson.features.length >> 1].geometry.coordinates[0]
        // setup the viewport
        this.mapbox.jumpTo({
            'center': centerPoint,
            'zoom': 13,
            'pitch': 0,
            'bearing': 0,
        });

        if (this.mapbox.getLayer('line')) {
            console.log('mapbox line layer exist')
        }
        else {
            this.mapbox.addSource('line', {
                type: 'geojson',
                lineMetrics: true,
                data: geojson
            });
            // the layer must be of type 'line'
            this.mapbox.addLayer({
                type: 'line',
                source: 'line',
                id: 'line',
                paint: {
                    // 'line-gap-width': 1,
                    'line-opacity': 0.8,
                    'line-color': ['get', 'color'],
                    'line-width': 8,
                },
                layout: {
                    'line-cap': 'butt',
                    'line-join': 'miter',
                }
            });


            this.mapbox.addSource('linePoint', {
                type: 'geojson',
                lineMetrics: true,
                data: roadPointsgeojson
            });
            // 添加路段注释点图层
            this.mapbox.addLayer({
                type: 'symbol',
                id: 'linePoint',
                source: 'linePoint',
                "layout": {
                    "icon-image": "{icon}-15",
                    "icon-allow-overlap": true
                }
            });

            this.mapbox.on('click', 'linePoint', (e) => {
                var coordinates = e.features[0].geometry.coordinates.slice();
                var description = e.features[0].properties.description;
                // Ensure that if the map is zoomed out such that multiple
                // copies of the feature are visible, the popup appears
                // over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
                // Populate the popup and set its coordinates
                // based on the feature found.
                new mapboxgl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(description)
                    .addTo(this.mapbox);
            });
            // Change the cursor to a pointer when the mouse is over the places layer.
            // 回调函数要用箭头函数啊，否则会改变this的指向
            this.mapbox.on('mouseenter', 'linePoint', () => {
                this.mapbox.getCanvas().style.cursor = 'pointer';

            });
            this.mapbox.on('mouseleave', 'linePoint', () => {
                this.mapbox.getCanvas().style.cursor = '';
            });

        }
    }

    // 调整charts大小
    resizeAllCharts() {
        this.echartsMapContainer = echarts.init(document.getElementById("mapContainer"))
        this.echartsMapContainer.resize();
        echarts.init(document.getElementById("pie1")).resize();
        echarts.init(document.getElementById("line1")).resize();
        echarts.init(document.getElementById("dash1")).resize();
    }
    componentDidMount() {
        window.onresize = this.resizeAllCharts
        // 获取mapbox对象实例
        this.mapbox = this.mapRef.current.mapbox
        // this.mapbox = this.echartsMapContainer.getModel().getComponent('mapbox3D').getMapbox();
        // this.mapRef.current.mapbox.setStyle('mapbox://styles/mapbox/dark-v10')
    };

    componentDidUpdate() {

    };

    componentWillUnmount() {
        console.log('Analysis Destory')
        this.store.clearAll()
        this.mapbox = null
    }

    render() {

        return (
            <div id='analysisLayout'>
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
                                    onClick={this.onClickBtn1}
                                    loading={this.store.loading}
                                >测试数据</Button>,
                                <Button
                                    key="2"
                                    type="primary"
                                    onClick={debounce(this.onClickBtn2, 500)}
                                    loading={this.store.loading}
                                >数据轮播</Button>,
                                <Button
                                    key="3"
                                    type="primary"
                                    onClick={debounce(this.onClickBtn3, 500)}
                                    loading={this.store.loading}
                                >实时交通</Button>,
                                <Button
                                    key="7"
                                    type="primary"
                                    onClick={this.onClickBtn7}
                                    loading={this.store.loading}
                                >
                                    线路测试
                                </Button>,
                                <Button
                                    key="4"
                                    type="primary"
                                    onClick={debounce(this.onClickBtn4, 500)}
                                    loading={this.store.loading}
                                >局部演示</Button>,
                                <Button
                                    key="5"
                                    type="primary"
                                    onClick={debounce(this.onClickBtn5, 500)}
                                    loading={this.store.loading}
                                >全局演示</Button>,
                                <Button
                                    key="6"
                                    onClick={this.onClickBtn6}
                                    loading={this.store.loading}
                                >地图重置</Button>,
                            ]}
                        />
                    </Col>
                </Row>
                <Row gutter={[16, 4]} >
                    <Col span={this.state.extraChartsShow ? 16 : 24} className="mapContainer">
                        <EchartsMapBoxVis
                            mapContainerID="mapContainer"
                            chartsParam={this.state.chartsParam}
                            data={this.state.dataType === 'history' ? this.state.data : this.store.dataGt}
                            flyActionParam={this.state.flyActionParam}
                            titleText={this.state.titleText}
                            ref={this.mapRef}
                        />
                    </Col>
                    <Col span={this.state.extraChartsShow ? 8 : 0} >
                        <Row gutter={[16, 4]}>
                            <Col span={8}>
                                <JamScoreDash chartsDashID="dash1" />
                            </Col >
                            <Col span={16}>
                                <Pie chartsPieID="pie1" />
                            </Col>
                        </Row>
                        <Row gutter={[16, 4]}>
                            <Line chartsLineID="line1" />
                        </Row>
                    </Col>

                </Row>
            </div>
        );
    };
};

export default Analysis;