import React, { Component } from 'react';
import { Row, Col, Button, PageHeader, Descriptions } from 'antd';
import mapboxgl from 'mapbox-gl';
import echarts from 'echarts';
import 'echarts-gl';

window.mapboxgl = mapboxgl;
class MapBoxVis extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {
        this.showmapbox();
    }

    showmapbox = (data = [], datatime = "") => {

        mapboxgl.accessToken = 'pk.eyJ1IjoiaHVzdDEyIiwiYSI6ImNrM3BpbDhsYTAzbDgzY3J2OXBzdXFuNDMifQ.bDD9-o_SB4fR0UXzYLy9gg';
        console.log(mapboxgl)

        // var map = new mapboxgl.Map({
        //     container: 'mapbox_echartgl',
        //     style: 'mapbox://styles/mapbox/streets-v11'
        // });
        this.myChartGl = echarts.init(document.getElementById('mapbox_echartgl'));
        console.log(this.myChartGl)
        let zoomeLevel = 11
        let barSize = (2 ** (zoomeLevel - 11)) * 0.08

        // 模拟数据
        var data = [
            { name: "beijing", value: [116.368608, 39.901744, 150] },
            { name: "beijing1", value: [116.378608, 39.901744, 350] },
            { name: "beijing2", value: [116.388608, 39.901744, 500] },
        ]
        // var data1 = [
        //     [116.339626,39.984877,6000],
        //     [116.467312,39.957147,2000],
        //     [116.312587,40.059276,8000],
        //     [116.342587,40.059276,8000],
        //     ]

        this.myChartGl.setOption({
            title: {
                text: '交通三维柱状图',
                padding: 20,//各个方向的内边距，默认是5，可以自行设置
                subtext: datatime ? datatime : 'datatime', //"2019-12-13 14:00", //主标题的副标题文本内容，如果需要副标题就配置这一项
                subtextStyle: {//副标题内容的样式
                    color: 'black',//绿色
                    fontStyle: 'normal',//主标题文字字体风格，默认normal，有italic(斜体),oblique(斜体)
                    fontWeight: "bold",//可选normal(正常)，bold(加粗)，bolder(加粗)，lighter(变细)，100|200|300|400|500...
                    fontFamily: "san-serif",//主题文字字体，默认微软雅黑
                    fontSize: 16//主题文字字体大小，默认为12px
                },
            },
            visualMap: {
                type: 'piecewise', //分段型
                categories: ['拥堵', '缓行', '通畅'],

                // visualMap-continuous组件配置
                show: true, //是否显示 visualMap-continuous 组件。如果设置为 false，不会显示，但是数据映射的功能还存在。
                calculable: true, //是否显示拖拽用的手柄（手柄能拖拽调整选中范围）
                realtime: true, //拖拽时，是否实时更新。
                hoverLink: true,
                left: 20,
                bottom: 40,
                dimension: 2, //指定用数据的『哪个维度』，映射到视觉元素上,默认取 data 中最后一个维度。
                color: ['red', '#eac736', 'green'],
                pieces: [
                    { value: 150, label: '通畅', color: '#369674' }, // 表示value等于150的情况。
                    { value: 175, label: '缓行', color: '#feb64d' },
                    { value: 200, label: '拥堵', color: 'red' },
                ],
                min: 100,
                max: 500,
            },
            mapbox3D: {
                // Mapbox 地图中心经纬度,经纬度用数组表示
                center: [116.368608, 39.901744],
                // Mapbox 地图的缩放等级
                zoom: 10,
                // Mapbox 地图样式
                style: 'mapbox://styles/mapbox/outdoors-v11',
                // 视角俯视的倾斜角度,默认为0，也就是正对着地图。最大60。
                // pitch: 60,
                // Mapbox 地图的旋转角度
                // bearing: -30,
            },

            series: [{
                type: 'bar3D',
                coordinateSystem: 'mapbox3D',
                shading: 'color',
                // bevelSize: 0.3, //柱子倒角
                // bevelSmoothness: 2, //柱子倒角的光滑/圆润度，数值越大越光滑/圆润。
                minHeight: 1,
                maxHeight: 500,
                // barSize: 0.1,
                barSize: barSize,
                data: data,
                // 图形是否不响应和触发鼠标事件，默认为 false，即响应和触发鼠标事件。
                silent: true, //设置为true 大大优化响应时间
                // label: {show:true},
                // animationEasingUpdate: 200,
            }]
        });


        // 获取mapbox对象
        let mapbox = this.myChartGl.getModel().getComponent('mapbox3D').getMapbox();

        // this.nav = new mapboxgl.NavigationControl({
        //     showZoom: true,
        //     showCompass: true,
        //     visualizePitch: true,
        // });

        // this.FullscreenControl = new mapboxgl.FullscreenControl({
        //     // container: document.querySelector('mapbox_echartgl')
        // });
        mapbox.addControl(this.nav, 'top-right');

        mapbox.setMinZoom(10);
        mapbox.setMaxZoom(14);


        mapbox.on('load', function () {
            console.log("地图加载")
        });

        mapbox.on('mousedown', function () {
            // zoomeLevel = mapbox.getZoom()
            console.log("鼠标点击开始")
            if (this.button_flag) {
                this.load_multi_data()
                console.log("停止轮播")
            }
        });

        mapbox.on('mouseup', function () {
            // zoomeLevel = mapbox.getZoom()
            console.log("鼠标点击结束")
            if (this.button_flag) {
                this.load_multi_data()
                console.log("重启轮播")
            }
        });

        mapbox.on('zoomstart', function () {
            zoomeLevel = mapbox.getZoom()
            console.log("zoom变化开始" + zoomeLevel)
        });

        mapbox.on('zoomend', function () {
            zoomeLevel = mapbox.getZoom()
            console.log("zoom变化结束" + zoomeLevel)

        });

    };
    render() {
        return (
            <>
                <div id="mapbox_echartgl" style={{ width: "100%", minHeight:"400px" }}></div>
            </>
        );
    }
}

export default MapBoxVis;