import { Button, Col, Descriptions, PageHeader, Popover, Row, Select, Slider } from 'antd';
import echarts from 'echarts';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { loadDataList, loadDataListNew, throttle } from '../../common/apis';
// import EchartsMapBoxVis from '../../common/EchartsMapBoxVis';
// import EchartHeatMapVis from '../../common/EchartHeatMapVis';
import './OdPred.css';
import Bar from '../../common/basicCharts/Bar';
import Bar3D from '../../common/basicCharts/Bar3D';


const { Option } = Select;
//离组件近的装饰器先执行
@inject('store')
@observer


class OdPred extends Component {
  constructor(props) {
    super(props)
    this.store = props.store.odStore
    // console.log(this.store.data)
    this.state = {
      // 初始化
      dataPred: {
        data: [],
        datatime: ''
      },
      dataGt: {
        data: [],
        datatime: ''
      },
      titleTextLeft: "",
      titleTextRight: "",
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
      pointBar3DPredTitle: '预测值',
      pointBar3DGtTitle: '真实值',

    }
    this.DataGtNameList   = null // 真实数据的name list
    this.DataPredNameList  = null // 预测数据的name list
    this.asyncMapParam     = this.asyncMapParam.bind(this)
    this.historyPredict_local  = this.historyPredict_local.bind(this)
    this.historyPredict_online = this.historyPredict_online.bind(this)
    this.realTimePredice    = this.realTimePredice.bind(this)
    this.sliderOnChange_local  = this.sliderOnChange_local.bind(this)
    this.selectOnChange_local  = this.selectOnChange_local.bind(this)
    this.selectModelOnChange_online  = this.selectModelOnChange_online.bind(this)
    this.selectStationOnChange_online  = this.selectStationOnChange_online.bind(this)
    this.sliderOnChange_online = this.sliderOnChange_online.bind(this)
    // this.selectOnChange_online = this.selectOnChange_online.bind(this)
  }

  componentDidMount() {
    window.onresize = () => {
      echarts.init(document.getElementById("mapContainerLeft")).resize();
      echarts.init(document.getElementById("mapContainerRight")).resize();
    };
  }

  componentWillUnmount() {
    console.log('Odpred Destory')
    this.store.clearAll()
  }


  asyncMapParam(positionParam) {
    // console.log(positionParam)
    this.setState({
      ...this.state,
      mapParam: positionParam,
    })
  }


  // 可弃置
  // 加载历史对比数据按钮点击事件 本地local数据
  //! 未使用
  historyPredict_local() {
    let sliderMarks     = {}
    let startTimeStr    = "2019-04-02_08-30"
    let endTimeStr     = "2019-04-02_08-39"
    this.DataGtNameList   = loadDataList(startTimeStr, endTimeStr)
    this.DataPredNameList  = loadDataList(startTimeStr, endTimeStr)
    let pathGt       = './history_predictDataList/history_gt/' + this.DataGtNameList[0]
    let pathPred      = this.state.historyPredDataPath + this.DataPredNameList[0]
    this.store.loaddata(pathGt, 'gt')
    this.store.loaddata(pathPred, 'pred')

    for (let index = 0; index < this.DataGtNameList.length; index++) {
      const element    = this.DataGtNameList[index];
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
      titleTextLeft: "真实拥堵情况",
      titleTextRight: "拥堵预测情况 LR模型",
    })
  }


  // 改变slider的值
  // 从public本地数据中加载预测的数据和真实数据
  //! 未使用
  sliderOnChange_local(value) {
    this.setState({
      ...this.state,
      dataListIndex: value
    }, () => {
      let pathGt   = './history_predictDataList/history_gt/' + this.DataGtNameList[value]
      let pathPred  = this.state.historyPredDataPath + this.DataGtNameList[value]
      this.store.loaddata(pathGt, 'gt')
      this.store.loaddata(pathPred, 'pred')
    })
  }


  // 切换预测模型
  // 从public本地数据中加载预测的数据
  //! 未使用
  selectOnChange_local(value) {
    let predPath = this.state.historyPredDataPath
    if (value === 'lr') {
      predPath = './history_predictDataList/history_pred/lr_pred/'
    }
    else if (value === 'sage') {
      predPath = './history_predictDataList/history_pred/sage_pred/'
    }

    this.setState({
      ...this.state,
      titleTextRight: '拥堵预测情况 ' + value + '模型',
      historyPredDataPath: predPath,
    }, () => {
      let pathPred = this.state.historyPredDataPath + this.DataGtNameList[this.state.dataListIndex]
      this.store.loaddata(pathPred, 'pred')
    })
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
      titleTextLeft: "真实数据",
      titleTextRight: "预测数据 FFN模型",
      dataIndex: 0, // history数据的index值
      predictType: 'FFN', // history预测数据的预测模型类型
      predStation: '老山公交场站',
    }, () => {
      let historyGtQueryParam = {
        dataIndex: this.state.dataIndex,
        predictType: this.state.predictType,
        predStation: this.state.predStation
      }
      let historyPredQueryParam = {
        dataIndex: this.state.dataIndex,
        predictType: this.state.predictType,
        predStation: this.state.predStation
      }
      this.store.getOdGt(historyGtQueryParam)
      this.store.getOdPred(historyPredQueryParam)
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


  // 当选择不同时间时，向后台请求：当前模型的预测数据和真实数据
  sliderOnChange_online(value) {
    // console.log(value)
    this.setState({
      ...this.state,
      dataIndex: value,
    }, () => {
      let historyGtQueryParam = {
        dataIndex: this.state.dataIndex,
        predictType: this.state.predictType,
        predStation: this.state.predStation
      }
      let historyPredQueryParam = {
        dataIndex: this.state.dataIndex,
        predictType: this.state.predictType,
        predStation: this.state.predStation
      }
      this.store.getOdGt(historyGtQueryParam)
      this.store.getOdPred(historyPredQueryParam)
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
      let historyPredQueryParam = {
        dataIndex: this.state.dataIndex,
        predictType: this.state.predictType,
        predStation: this.state.predStation
      }
      this.store.getOdPred(historyPredQueryParam)
    })
  }

  // 当选择不同站点时，在当前模型的预测数据中寻找对应站点的数据
  selectStationOnChange_online(value) {
    this.setState({
      ...this.state,
      predStation: value,
      pointBarTitle: value + '车站乘客分流图'
    }, () => {
      let historyGtQueryParam = {
        dataIndex: this.state.dataIndex,
        predictType: this.state.predictType,
        predStation: this.state.predStation
      }
      let historyPredQueryParam = {
        dataIndex: this.state.dataIndex,
        predictType: this.state.predictType,
        predStation: this.state.predStation
      }
      this.store.getOdGt(historyGtQueryParam);
      this.store.getOdPred(historyPredQueryParam);
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
              title="起止需求预测模型对比"
              // subTitle="交通拥堵"
              extra={[
                //https://ant.design/components/button-cn/
                <Button
                  key="1"
                  type="primary"
                  onClick={this.historyPredict_online}
                  loading={this.store.loading} //添加 loading 属性即可让按钮处于加载状态
                >预测模型对比</Button>,
              ]}
            />
          </Col>
        </Row>

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
              column={4}
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

              <Descriptions.Item
                label="模型选择"
              >
                <Select
                  defaultValue="FFN"
                  style={{ width: '100%', display: this.state.sliderDisplay }}
                  onChange={this.selectModelOnChange_online}
                  loading={this.store.loading}
                  disabled={this.store.loading}
                >
                  <Option value="HA">HA</Option>
                  <Option value="FFN">FFN</Option>
                  <Option value="LSTM">LSTM</Option>
                  <Option value="ConvLSTM">ConvLSTM</Option>
                  <Option value="DCRNN">DCRNN</Option>
                  <Option value="GWNet">GWNet</Option>
                  <Option value="GNN">GNN</Option>
                </Select>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Popover content={
                    <div>
                      <p>平均绝对误差</p>
                    </div>
                  }>
                    MAE
                  </Popover>
                }
              >
                {this.store.scoreMAE}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Popover content={
                    <div>
                      <p>均方根误差</p>
                    </div>
                  }>
                    RMSE
                  </Popover>
                }
              >
                {this.store.scoreRMSE}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        <Row gutter={[16, 4]}>
          <Col span={12} className="bar3DContainer">
          <Bar3D
              chartsBar3DID="pointBar3DGtInfo"
              titleText={this.state.pointBar3DGtTitle}
              data={this.store.dataLeft}
              asyncParam={this.asyncMapParam}
            />
          </Col>
          <Col span={12} className="bar3DContainer">
            <Bar3D
              chartsBar3DID="pointBar3DPredInfo"
              titleText={this.state.pointBar3DPredTitle}
              data={this.store.dataRight}
              asyncParam={this.asyncMapParam}
            />
          </Col>
        </Row>

        <Row gutter={[16, 4]}>
          <Col span={24} className='barContainer'>
            <Bar
              chartsBarID="pointBarInfo"
              titleText={this.state.pointBarTitle}
              data={{'gt':this.store.dataLeft,'pred':this.store.dataRight}}
              asyncParam={this.asyncMapParam}
              compare={true}
              />
          </Col>
        </Row>

      </div>
    );
  }
}

export default OdPred;