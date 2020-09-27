import React, { Component } from 'react';
import mapboxgl from 'mapbox-gl';
import echarts from 'echarts';
import 'echarts-gl';

import './EchartsMapBoxVis.css'


class EchartsMapBoxVis extends Component {
    constructor(props) {
        super(props);
        this.state = {
            titleText : this.props.chartsParam.titleText ? this.props.chartsParam.titleText : ' ',
            mapParam : this.props.chartsParam.mapParam ? this.props.chartsParam.mapParam : null,
        }
        this.myChartGl = null // echarts对象实例
        this.mapbox = null // mapbox对象实例
        window.mapboxgl = mapboxgl;
        setTimeout(() => {
            this.showmapbox(this.props.data.data, this.props.data.datatime);
        })
        this.asyncParam = {
            center: [116.368608, 39.901744],
            // Mapbox 地图的缩放等级
            zoom: 10,
            // 视角俯视的倾斜角度,默认为0，也就是正对着地图。最大60。
            pitch: 60,
            // Mapbox 地图的旋转角度
            bearing: -30,
        }

        this.showmapbox = this.showmapbox.bind(this)
    }

    componentDidMount() {
        // window.mapboxgl = mapboxgl;
        window.onresize = () => {
            this.myChartGl.resize()
        }
    }
    componentDidUpdate() {
        let data = this.props.data.data
        let datatime = this.props.data.datatime
        let asyncParam= this.props.asyncParam ? this.props.chartsParam.mapParam : null 

        let newOption = {
            title: {
                subtext: datatime ? datatime : '',
            },
            series: [{
                data: data ? data : [],
                barSize: (2 ** (this.mapbox.getZoom() - 10) * 0.1),
            }],
        }
        if(asyncParam){
            newOption.mapbox3D = {
                center: asyncParam.center,
                zoom: asyncParam.zoom,
                pitch: asyncParam.pitch,
                bearing: asyncParam.bearing,
            }
        }
        this.myChartGl.setOption(newOption)

        let flyActionParam = this.props.flyActionParam

        if (flyActionParam) {
            this.move_fly(this.mapbox, ...flyActionParam);
        }
    }

    componentWillUnmount() {
        console.log('EchartsMapBoxVis Destory')
        this.myChartGl = null // echarts对象实例
        this.mapbox = null // mapbox对象实例
        // window.mapboxgl = null
    }

    move_fly = (mapbox, lon, lat, zoom, pitch, bearing, duration) => {
        mapbox.easeTo({
            // CameraOptions
            center: [lon, lat],
            zoom: zoom,
            // 视角俯视的倾斜角度,默认为0，也就是正对着地图。最大60。
            pitch: pitch,
            // Mapbox 地图的旋转角度
            bearing: bearing,

            // AnimationOptions
            // 动态转换的持续时间，按毫秒计算
            duration: duration,
            maxDuration: duration,
            // 该函数持续的时间在 0~1 之间， 返回一个表示状态的数字，初始状态为 0，最终状态为 1
            easing(t) {
                return t;
                // return t*(2-t);
            },
            // If false , no animation will occur.
            animate: true
        });

    };

    showmapbox = (data = [], datatime = "") => {

        mapboxgl.accessToken = 'pk.eyJ1IjoiaHVzdDEyIiwiYSI6ImNrM3BpbDhsYTAzbDgzY3J2OXBzdXFuNDMifQ.bDD9-o_SB4fR0UXzYLy9gg';

        // echarts对象实例
        this.myChartGl = echarts.init(document.getElementById(this.props.mapContainerID));

        // let zoomeLevel = 11
        // let barSize = (2 ** (zoomeLevel - 11)) * 0.08
        this.myChartGl.setOption({
            title: {
                // text: '交通拥堵情况三维柱状图',
                text: this.state.titleText,
                padding: 20,//各个方向的内边距，默认是5，可以自行设置
                subtext: datatime ? datatime : '', //"2019-12-13 14:00", //主标题的副标题文本内容，如果需要副标题就配置这一项
                subtextStyle: {//副标题内容的样式
                    color: 'black',
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
            // mapbox3D: {
            //     // echarts-gl中mapbox只能应用部分配置，更多的mapbox配置要使用mapbox的api
            //     // Mapbox 地图样式 style
            //     style: 'mapbox://styles/mapbox/outdoors-v11',
            //     // Mapbox 地图中心经纬度,经纬度用数组表示
            //     center: [116.368608, 39.901744],
            //     // Mapbox 地图的缩放等级
            //     zoom: 10,
            //     // 视角俯视的倾斜角度,默认为0，也就是正对着地图。最大60。
            //     pitch: 60,
            //     // Mapbox 地图的旋转角度
            //     bearing: -30,
            // },
            mapbox3D: this.state.mapParam ? this.state.mapParam : {
                // echarts-gl中mapbox只能应用部分配置，更多的mapbox配置要使用mapbox的api
                // Mapbox 地图样式 style
                style: 'mapbox://styles/mapbox/outdoors-v11',
                // Mapbox 地图中心经纬度,经纬度用数组表示
                center: [116.368608, 39.901744],
                // Mapbox 地图的缩放等级
                zoom: 10,
                // 视角俯视的倾斜角度,默认为0，也就是正对着地图。最大60。
                pitch: 60,
                // Mapbox 地图的旋转角度
                bearing: -30,
            },

            series: [{
                type: 'bar3D',
                coordinateSystem: 'mapbox3D',
                data: data ? data : [],
                shading: 'color',
                minHeight: 100,
                maxHeight: 500,
                barSize: 0.1,
                // 图形是否不响应和触发鼠标事件，默认为 false，即响应和触发鼠标事件。
                silent: true, //设置为true 大大优化响应时间
            }],

        });

        // 获取mapbox对象实例
        this.mapbox = this.myChartGl.getModel().getComponent('mapbox3D').getMapbox();

        // 设置mapbox的zoom范围
        this.mapbox.setMinZoom(10);
        this.mapbox.setMaxZoom(14);

        // 添加缩放和指南针控件
        this.mapbox.addControl(new mapboxgl.NavigationControl({
            showZoom: true,
            showCompass: true,
            visualizePitch: true,
        }), 'top-right');

        // 添加比例尺控件
        this.mapbox.addControl(new mapboxgl.ScaleControl({
            maxWidth: 80,
            unit: 'metric'
        }), 'bottom-right');

        // // 添加全屏控件 只能显示mapbox不能显示echarts
        // this.mapbox.addControl(new mapboxgl.FullscreenControl({ 
        //     container: document.querySelector('mapbox_echartgl') }
        // ));

        // this.mapbox.on('load', function () {
        //     console.log("地图加载")
        //     // window.mapboxgl = null;
        // });

        this.mapbox.on('mousemove', () => {
            let zoomLevel = this.mapbox.getZoom()
            let center = [this.mapbox.getCenter().lng, this.mapbox.getCenter().lat]
            let bearing = this.mapbox.getBearing()
            let pitch = this.mapbox.getPitch()

            if (this.props.asyncParam) {
                if (this.asyncParam.center[0] != center[0] || this.asyncParam.center[1] != center[1] || this.asyncParam.zoom != zoomLevel || this.asyncParam.bearing != bearing || this.asyncParam.pitch != pitch) {
                    this.asyncParam.center = center
                    this.asyncParam.zoom = zoomLevel
                    this.asyncParam.bearing = bearing
                    this.asyncParam.pitch = pitch
                    this.props.asyncParam(this.asyncParam)
                }
            }
        })
    };
    render() {
        return (
            <div id={this.props.mapContainerID} className="mapBoxContainer" style={{ minHeight: "600px", height:"100%",width:"100%"}} />
        );
    }
}

export default EchartsMapBoxVis;