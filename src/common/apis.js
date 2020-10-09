
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

function dataObj_dataStr(dataObj) {
    return String(dataObj['year']) + '-' + ('0' + String(dataObj['month'])).slice(-2) + '-' + ('0' + String(dataObj['day'])).slice(-2) + '_' + ('0' + String(dataObj['hour'])).slice(-2) + '-' + ('0' + String(dataObj['minute'])).slice(-2)
};

// load datalist
function loadDataList(startTimeStr,endTimeStr){
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

function eqArr(a, b) {
    // 判断数组的长度
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
// 4. 节流函数
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
// 5. 防抖函数
// 思路:在规定时间内未触发第二次，则执行
function debounce(fn, delay) {
    // 利用闭包保存定时器
    let timer = null
    return function () {
        let context = this
        let arg = arguments
        // 在规定时间内再次触发会先清除定时器后再重设定时器
        clearTimeout(timer)
        timer = setTimeout(function () {
            fn.apply(context, arg)
        }, delay)
    }
}

export {dataStr_dataObj, dataObj_dataStr, loadDataList, eqArr, throttle, debounce}