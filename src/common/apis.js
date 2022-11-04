/**
 * apis.js中定义了7个常用的函数
 */


//! (1)数据类型转换，被(3)调用
function dataStr_dataObj(dataStr) {
  let dataArr = dataStr.split('_')[0].split('-').concat(dataStr.split('_')[1].split('-'))
  let resObj = {
    'year': parseInt(dataArr[0]),
    'month': parseInt(dataArr[1]),
    'day': parseInt(dataArr[2]),
    'hour': parseInt(dataArr[3]),
    'minute': parseInt(dataArr[4]),
  }
  return resObj
};


//! (2)数据类型转换，被(3)调用
function dataObj_dataStr(dataObj) {
  return String(dataObj['year']) +
    '-' + ('0' + String(dataObj['month'])).slice(-2) +
    '-' + ('0' + String(dataObj['day'])).slice(-2) +
    '_' + ('0' + String(dataObj['hour'])).slice(-2) +
    '-' + ('0' + String(dataObj['minute'])).slice(-2)
};


//! (3)添加 ../public/testDataList 中文件的路径到数组。在Analysis.js的onClickButton2()中被使用
function loadDataList(startTimeStr, endTimeStr){
  let DataNameList = []
  // let startTimeStr = "2019-04-02_08-30"
  // let endTimeStr = "2019-04-02_09-30"
  let timeIndex = startTimeStr

  while (timeIndex <= endTimeStr) {
    DataNameList.push(timeIndex + '.json')
    let timeIndexObj = dataStr_dataObj(timeIndex)
    if (timeIndexObj['minute'] + 1 > 59) {
      timeIndexObj['minute'] = 0
      timeIndexObj['hour'] += 1
    }
    else {
      timeIndexObj['minute'] += 1
    }
    timeIndex = dataObj_dataStr(timeIndexObj)
  }
  return DataNameList
}

function loadDataListNew(startTimeStr, endTimeStr){
  let DataNameList = []
  // let startTimeStr = "2016-06-29_08-00"
  // let endTimeStr = "2016-06-29_17-00"
  let timeIndex = startTimeStr

  while (timeIndex <= endTimeStr) {
    DataNameList.push(timeIndex + '.json')
    let timeIndexObj = dataStr_dataObj(timeIndex)
    timeIndexObj['hour'] += 1
    timeIndex = dataObj_dataStr(timeIndexObj)
  }
  return DataNameList
}


//! (4)判断两数组是否相等，暂未使用
function eqArr(a, b) {
  if (a.length !== b.length) {
    return false
  } else {
    // 循环遍历数组的值进行比较
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false
      }
    }
    return true;
  }
}


//! (5)节流函数，出现在PredictionAnalysis.js中
// 思路：在规定时间内只触发一次
function throttle(fn, delay) {
  // 利用闭包保存时间
  let prev = Date.now()
  return function () {
    let context = this
    let arg = arguments
    let now = Date.now()
    if (now - prev >= delay) {
      fn.apply(context, arg)
      prev = Date.now()
    }
  }
}


//! (6)防抖函数，在Analysis.js中某些button按钮的onClick事件中被使用
/**
 * 思路:在规定时间内未触发第二次，则执行
 * 概念：函数防抖（debounce），就是指触发事件后，在 n 秒内函数只能执行一次，
 * 如果触发事件后在 n 秒内又触发了事件，则会重新计算函数延执行时间
 */
function debounce(fn, delay) {
  // 利用闭包保存定时器
  let timer = null
  return function () {
    let context = this
    let arg = arguments
    // 在规定时间内再次触发会先清除定时器后再重设定时器
    clearTimeout(timer)
    // setTimeout() 是属于 window 的方法，该方法用于在指定的毫秒数后调用函数或计算表达式。
    timer = setTimeout(function () {
      fn.apply(context, arg)
    }, delay)
  }
}


//! (7)处理json数据，离散映射
function processJsonData(data){
  // 数据处理
  for (let i = 0, len = data.length; i < len; i++) {
    // 数据映射 1->1 3->150 7-175 10->200
    //! 为什么json文件里，每一条数据的第三维的数值是1，3，7，10呢，映射后的值代表什么？
    // 1,3,7,10分别对应信息缺失、畅通、缓行、拥堵，映射后的值是柱状图的高度
    switch (data[i][2]) {
      case 3:
        data[i][2] = 150;
        break;
      case 7:
        data[i][2] = 175;
        break;
      case 10:
        data[i][2] = 200;
        break;
      default:
        break;
    }
  }
  return data
}

export {dataStr_dataObj, dataObj_dataStr, loadDataList, loadDataListNew, eqArr, throttle, debounce, processJsonData}