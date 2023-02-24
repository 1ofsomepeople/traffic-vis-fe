import { Button, Col, Descriptions, PageHeader, Popover, Row, Select, Slider } from 'antd';
import echarts from 'echarts';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { loadDataList, loadDataListNew, throttle } from '../../common/apis';
import EchartsMapBox from '../../common/EchartsMapBox';
import './test.css';
import mapboxgl from 'mapbox-gl';
import Bar from '../../common/basicCharts/Bar';
import Bar3D from '../../common/basicCharts/Bar3D';


const { Option } = Select;
//离组件近的装饰器先执行
@inject('store')
@observer


class Odtest extends Component {
  constructor(props) {
    super(props)
    this.store = props.store.odStore
    // console.log(this.store.data)
    this.state = {
      //NOTE 左右展示数据初始化
      dataPred: {
        data: [],
        datatime: ''
      },
      dataGt: {
        data: [],
        datatime: ''
      },
      titleTextLeft: '',
      titleTextRight: '',
      mapParam: {
        // Mapbox 地图样式 style
        style: 'mapbox://styles/mapbox/outdoors-v11',
        center: [116.368608, 39.901744],
        // Mapbox 地图的缩放等级
        zoom: 10,
        // 视角俯视的倾斜角度,默认为0，也就是正对着地图。最大60。
        pitch: 0,
        // Mapbox 地图的旋转角度
        bearing: 0,
      },
      marks: {},
      sliderDisplay: 'none', //此状态为Slider的display的取值
      dataListIndex: 0, // 数据list的index
      historyPredDataPath: './history_predictDataList/history_pred/lr_pred/', // 历史预测数据根路径
      dataIndex: 0, // history数据的index值
      predictType: 'ffn', // history预测数据的预测模型类型
      predStation: '老山公交场站',
      stationDic:{
        '老山公交场站' : 0,
        '老山南路东口' : 1,
        '地铁八宝山站' : 2,
        '玉泉路口西' : 3,
        '永定路口东' : 4,
        '五棵松桥东' : 5,
        '沙沟路口西' : 6,
        '东翠路口' : 6,
        '万寿路口西' : 7,
        '翠微路口' : 7,
        '公主坟' : 8,
        '军事博物馆' : 9,
        '木樨地西' : 10,
        '工会大楼' : 11,
        '南礼士路' : 12,
        '复兴门内' : 12,
        '西单路口东' : 13,
        '天安门西' : 14,
        '天安门东' : 15,
        '东单路口西' : 16,
        '北京站口东' : 17,
        '日坛路' : 18,
        '永安里路口西' : 19,
        '大北窑西' : 20,
        '大北窑东' : 21,
        '郎家园' : 21,
        '八王坟西' : 22,
        '四惠枢纽站' : 23
      },
      pointBarTitle : '老山公交场站车站乘客分流图',
      pointBarDataGt : [],
      pointBarDataPred: [],
      pointBar3DTitle : '乘客分流图',
      pointBar3DDataGt : [],
      pointBar3DDataPred: [],
    }
    window.mapboxgl = mapboxgl;
    this.mapRef = React.createRef(); // ref
    this.mapbox = null
    this.DataGtNameList = null // 真实数据的name list
    this.DataPredNameList = null // 预测数据的name list
    this.asyncMapParam = this.asyncMapParam.bind(this)
    // this.historyPredict_local = this.historyPredict_local.bind(this)
    this.historyPredict_online = this.historyPredict_online.bind(this)
    this.realTimePredice = this.realTimePredice.bind(this)
    // this.sliderOnChange_local = this.sliderOnChange_local.bind(this)
    // this.selectOnChange_local = this.selectOnChange_local.bind(this)
    this.sliderOnChange_online = this.sliderOnChange_online.bind(this)
    this.selectStationOnChange_online = this.selectStationOnChange_online.bind(this)
    this.selectModelOnChange_online = this.selectModelOnChange_online.bind(this)
    this.resizeAllCharts = this.resizeAllCharts.bind(this)
    this.showStation = this.showStation.bind(this)
  }

  // 调整charts大小，没有返回值
  resizeAllCharts() {
    this.echartsMapContainer = echarts.init(document.getElementById("mapContainerLeft"))
    this.echartsMapContainer.resize();
    echarts.init(document.getElementById("pointBar3DInfo")).resize();
    echarts.init(document.getElementById("pointBarInfo")).resize();
  }

  componentDidMount() {
    window.onresize = this.resizeAllCharts
    this.mapbox = this.mapRef.current.mapbox
  }

  componentDidUpdate() {

  };

  componentWillUnmount() {
    console.log('Odpred Destory')
    this.store.clearAll()
    this.mapbox = null
  }


  asyncMapParam(positionParam) {
    // console.log(positionParam)
    this.setState({
      ...this.state,
      mapParam: positionParam,
    })
  }


  showStation() {
    if (this.mapbox.getLayer('points')) {
      this.mapbox.removeLayer('points')
      this.mapbox.removeSource('points')
    }
    // poi点坐标信息
    let stationgeojson = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>老山公交场站</strong>",
            "icon": "pointMark"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.2264529702029, 39.914450096247954]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>老山南路东口</strong>",
            "icon": "art-gallery"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.22766114192765, 39.911219155500675]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>地铁八宝山站</strong>",
            "icon": "art-gallery"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.22951343694095, 39.90619045973707]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>玉泉路口西</strong>",
            "icon": "art-gallery"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.24545331669, 39.90620798416575]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>永定路口东</strong>",
            "icon": "art-gallery"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.26001177549975, 39.906237122676316]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>五棵松桥东</strong>",
            "icon": "art-gallery"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.2716146501648, 39.90623722844211]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>沙沟路口西</strong>",
            "icon": "art-gallery"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.27604392498202, 39.90622430603992]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>万寿路口西</strong>",
            "icon": "art-gallery"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.2873252094815, 39.90624058712257]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>公主坟</strong>",
            "icon": "art-gallery"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.30437746724007, 39.906127604467486]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>军事博物馆</strong>",
            "icon": "art-gallery"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.3181798079248, 39.90621678562706]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>木樨地西</strong>",
            "icon": "art-gallery"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.32633702300372, 39.90617947724279]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>工会大楼</strong>",
            "icon": "art-gallery"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.33967074021018, 39.90593668234911]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>南礼士路</strong>",
            "icon": "art-gallery"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.34421093994041, 39.90589615371753]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>复兴门内</strong>",
            "icon": "art-gallery"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.35269688096113, 39.905841292974074]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>西单路口东</strong>",
            "icon": "art-gallery"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.37171736434773, 39.905768842235425]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>天安门西</strong>",
            "icon": "art-gallery"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.38610976246815, 39.90606611105301]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>天安门东</strong>",
            "icon": "art-gallery"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.39514518220952, 39.90601615220736]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>东单路口西</strong>",
            "icon": "art-gallery"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.40961252669423, 39.90680074457834]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>北京站口东</strong>",
            "icon": "art-gallery"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.42334274544173, 39.90700982647987]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>日坛路</strong>",
            "icon": "art-gallery"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.43677048654843, 39.90708818243652]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>永安里路口西</strong>",
            "icon": "art-gallery"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.441703102958, 39.90713935089575]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>大北窑西</strong>",
            "icon": "art-gallery"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.45200969873245, 39.906822723301026]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>大北窑东</strong>",
            "icon": "art-gallery"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.45859573583468, 39.90728289609876]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>郎家园</strong>",
            "icon": "art-gallery"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.46399620262287, 39.90700407111095]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>八王坟西</strong>",
            "icon": "art-gallery"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.46981229421405, 39.90717615725094]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>四惠枢纽站</strong>",
            "icon": "art-gallery"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.4906351876019, 39.90571750227382]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>翠微路口</strong>",
            "icon": "art-gallery"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.29490748930034, 39.9062388210207]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "description": "<strong>东翠路口</strong>",
            "icon": "art-gallery"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.28176120456669, 39.9062362762001]
          }
        },
      ]
    }

    if (this.mapbox.getLayer('points')) {
      console.log('mapbox points layer exist')
    }
    // 加载自定义图标
    //loadImage(url,callback)
    //url(string)图像的 URL。图像的格式必须为 png， webp 或者 jpg 。
    //callback(Function)形式为 callback(error, data) 。 当图像成功载入或出现错误异常时调用。
    this.mapbox.loadImage('./icons/marker.png', (error, image) => {
      if (error) throw error;
      this.mapbox.addImage('pointMark', image);
    });
    this.mapbox.addSource('points', {
      type: 'geojson',
      lineMetrics: true,
      data: stationgeojson
    });
    // 添加路段注释点图层
    this.mapbox.addLayer({
      type: 'symbol',
      id: 'points',
      source: 'points',
      "layout": {
        // "icon-image": "{icon}-15",
        "icon-image": 'pointMark',
        "icon-allow-overlap": true
      }
    });

    this.mapbox.on('click', 'points', (e) => {
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
    //CAUTION: 回调函数要用箭头函数，否则会改变this的指向
    this.mapbox.on('mouseenter', 'points', () => {
      this.mapbox.getCanvas().style.cursor = 'pointer';
    });
    this.mapbox.on('mouseleave', 'points', () => {
      this.mapbox.getCanvas().style.cursor = '';
    });
  }


  // 历史对比数据按钮 请求后端数据
  historyPredict_online() {
    let startTimeStr = "2016-06-29_08-00"
    let endTimeStr = "2016-06-29_17-00"
    this.DataGtNameList = loadDataListNew(startTimeStr, endTimeStr)
    let sliderMarks = {}

    for (let index = 0; index < this.DataGtNameList.length; index++) {
      const element = this.DataGtNameList[index];
      // sliderMarks[index] = element.split('.')[0]
      sliderMarks[index] = {
        style: {
          // color: '#1890ff',
          width: '120px'
        },
        label: <span>{element.split('.')[0].split('_')[1].split('-').join(':')}</span>
      }
    }

    this.setState({
      ...this.state,
      marks: sliderMarks,
      sliderDisplay: 'block',
      titleTextLeft: "1路公交车站分布",
      titleTextRight: "预测数据 FFN模型",
      dataIndex: 0, // history数据的index值
      predictType: 'FFN', // history预测数据的预测模型类型
      predStation: '老山公交场站',
    }, () => {
      // this.resizeAllCharts()
      let historyGtQueryParam = {
        dataIndex: this.state.dataIndex,
        predictType: this.state.predictType,
        predStation: this.state.predStation
      }
      this.store.getOdGt(historyGtQueryParam)
    })
  }


  realTimePredice() {
    // message.warning('正在开发中');
    this.setState({
      ...this.state,
      titleTextLeft: "LR模型预测",
      titleTextRight: "SAGE模型预测",
    }, () => {
      this.store.getOdPred()
      this.store.getOdPred()
    })
  }

  //CAUTION:注意修改请求头
  // 当选择不同时间时，向后台请求：当前真实数据
  sliderOnChange_online(value) {
    // console.log(value)
    this.setState({
      ...this.state,
      dataIndex: value,
    }, () => {
      // this.resizeAllCharts()
      let historyGtQueryParam = {
        dataIndex: this.state.dataIndex,
        predictType: this.state.predictType,
        predStation: this.state.predStation
      }
      this.store.getOdGt(historyGtQueryParam)
    })
  }


  // 当选择不同模型时，向后台请求：当前时刻，模型的预测数据
  selectModelOnChange_online(value) {
    // console.log(value)
    this.setState({
      ...this.state,
      predictType: value,
      titleTextRight: '预测数据 ' + value + '模型',
    }, () => {
      // this.resizeAllCharts()
      let historyGtQueryParam = {
        dataIndex: this.state.dataIndex,
        predictType: this.state.predictType,
        predStation: this.state.predStation
      }
      this.store.getOdGt(historyGtQueryParam)
    })
  }

  // 当选择不同站点时，在当前模型的预测数据中寻找对应站点的数据
  selectStationOnChange_online(value) {
    this.setState({
      ...this.state,
      predStation: value,
      pointBarTitle: value + '车站乘客分流图'
    }, () => {
      // this.resizeAllCharts()
      let historyGtQueryParam = {
        dataIndex: this.state.dataIndex,
        predictType: this.state.predictType,
        predStation: this.state.predStation
      }
      this.store.getOdGt(historyGtQueryParam);
    })
  }

  render() {
    return (
      <div>
        {/* 第一行维护PageHeader组件 */}
        <Row gutter={[16, 0]}>
          <Col span={24}>
            <PageHeader
              ghost={false}
              onBack={() => window.history.back()}
              title="起止需求预测可视化"
              // subTitle="交通拥堵"
              extra={[
                //https://ant.design/components/button-cn/
                <Button
                  key="1"
                  type="primary"
                  onClick={this.historyPredict_online}
                  loading={this.store.loading} //添加 loading 属性即可让按钮处于加载状态
                >需求数据分析</Button>,
                <Button
                  key="2"
                  type="primary"
                  onClick={this.showStation}
                  loading={this.store.loading}
                >车站位置展示</Button>,
              ]}
            />
          </Col>
        </Row>

        {/*
          1)第二行维护两个组件，Slider与Descriptions
          2)点击加载历史数据对比后出现
        */}
        <Row align={"middle"} justify={"center"} gutter={[24, 4]}>
          <Col span={12} >
            <Slider
              min={0}
              max={this.DataGtNameList ? this.DataGtNameList.length - 1 : 0}
              marks={this.state.marks}
              value={this.state.dataIndex}
              included={false}
              step={null}
              defaultValue={0}
              tooltipPlacement={'bottom'}
              tooltipVisible={false}
              style={{ display: this.state.sliderDisplay }}
              onChange={this.sliderOnChange_online}
              disabled={this.store.loading}
            />
          </Col>
          <Col span={12} className="PredInfo">
            <Descriptions
              // title="预测算法信息"
              layout="vertical"
              bordered={true}
              column={1}
              size="small"
              style={{ display: this.state.sliderDisplay }}
            >
              <Descriptions.Item
                label="站点选择"
              >
                <Select
                  defaultValue="老山公交场站"
                  style={{ width: '100%', display: this.state.sliderDisplay }}
                  onChange={this.selectStationOnChange_online}
                  loading={this.store.loading}
                  disabled={this.store.loading}
                >
                  <Option value="四惠枢纽站">四惠枢纽站</Option>
                  <Option value="八王坟西">八王坟西</Option>
                  <Option value="郎家园">郎家园</Option>
                  <Option value="大北窑东">大北窑东</Option>
                  <Option value="大北窑西">大北窑西</Option>
                  <Option value="永安里路口西">永安里路口西</Option>
                  <Option value="日坛路">日坛路</Option>
                  <Option value="北京站口东">北京站口东</Option>
                  <Option value="东单路口西">东单路口西</Option>
                  <Option value="天安门东">天安门东</Option>
                  <Option value="天安门西">天安门西</Option>
                  <Option value="西单路口东">西单路口东</Option>
                  <Option value="复兴门内">复兴门内</Option>
                  <Option value="南礼士路">南礼士路</Option>
                  <Option value="工会大楼">工会大楼</Option>
                  <Option value="木樨地西">木樨地西</Option>
                  <Option value="军事博物馆">军事博物馆</Option>
                  <Option value="公主坟">公主坟</Option>
                  <Option value="翠微路口">翠微路口</Option>
                  <Option value="万寿路口西">万寿路口西</Option>
                  <Option value="东翠路口">东翠路口</Option>
                  <Option value="沙沟路口西">沙沟路口西</Option>
                  <Option value="五棵松桥东">五棵松桥东</Option>
                  <Option value="永定路口东">永定路口东</Option>
                  <Option value="玉泉路口西">玉泉路口西</Option>
                  <Option value="地铁八宝山站">地铁八宝山站</Option>
                  <Option value="老山南路东口">老山南路东口</Option>
                  <Option value="老山公交场站">老山公交场站</Option>
                </Select>
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        <Row gutter={[16, 4]}>
          <Col span={12} className="mapContainer">
            <EchartsMapBox
              mapContainerID="mapContainerLeft"
              titleText={this.state.titleTextLeft}
              chartsParam={{ mapParam: this.state.mapParam }}
              data={this.store.dataLeft}
              asyncParam={this.asyncMapParam}
              ref={this.mapRef}
            />
          </Col>
          <Col span={12} className="bar3DContainer">
            <Bar3D
              chartsBar3DID="pointBar3DInfo"
              titleText={this.state.pointBar3DTitle}
              data={this.store.dataLeft}
              asyncParam={this.asyncMapParam}
            />
          </Col>
        </Row>

        <Row gutter={[16, 4]}>
          <Col span={24} className='barContainer'>
            <Bar
              chartsBarID="pointBarInfo"
              titleText={this.state.pointBarTitle}
              data={{'gt':this.store.dataLeft, 'pred':this.store.dataRight}}
              asyncParam={this.asyncMapParam}
              compare={false}
              />
          </Col>
        </Row>

      </div>
    );
  }
}

export default Odtest;