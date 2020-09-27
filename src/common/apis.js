
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
function loadDataList(){
    let DataNameList = []
    let startTimeStr = "2019-04-02_08-30"
    let endTimeStr = "2019-04-02_09-30"

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


export {dataStr_dataObj, dataObj_dataStr, loadDataList}