# coding=utf-8

import os
import shutil
# 读excel文件
import xlrd
import json
import lnglat_mercator_tiles_convertor as lnglatconver
from tqdm import tqdm 

testxls = r"./2019-04-02_09-00.xls"

# 获取excel数据源
def get_data(file_path):
    """获取excel数据源"""
    try:
        data = xlrd.open_workbook(file_path)
        data = data.sheets()[0]
        filename = file_path.split('/')[-1].split('.')[0]
        return data,filename
    except Exception as e:
        print ("excel表格读取失败：%s" %e)
        return None

def rgb2hsv(rgb):
    r, g, b = rgb[0], rgb[1], rgb[2]
    m_x = max(r, g, b)
    m_n = min(r, g, b)
    m = m_x - m_n
    if m_x == m_n:
        h = 0
    elif m_x == r:
        if g >= b:
            h = ((g - b) / m) * 60
        else:
            h = ((g - b) / m) * 60 + 360
    elif m_x == g:
        h = ((b - r) / m) * 60 + 120
    elif m_x == b:
        h = ((r - g) / m) * 60 + 240
    if m_x == 0:
        s = 0
    else:
        s = m / m_x
    v = m_x
    H = h / 2
    S = s * 255.0
    V = v * 255.0
    return int(round(H)), int(round(S)), int(round(V))


def hsv2value(hsv):
    h, s, v = hsv[0], hsv[1], hsv[2]
    if 35 <= h <= 99 and 43 <= s <= 255 and 46 <= v <= 255:  # green
        return 3
    elif 0 <= h <= 10 and 43 <= s <= 255 and 46 <= v <= 255:  # red
        return 10
    elif 11 <= h <= 34 and 43 <= s <= 255 and 46 <= v <= 255:  # yellow
        return 7
    elif 0 <= s <= 43 and 46 <= v <= 255:  # white and gray
        return 1
    else:  # black
        return 0

# 将RGB颜色映射到值 灰度化 交通中红色绿色蓝色代表的值不一样权重应该不同
def RGB2Value(R,G,B):
    # 灰度值的加权平均法Gray = 0.299*R + 0.578*G + 0.114*B
    # weight = [0.600,0.100,0.300]
    # value = weight[0]*R + weight[1]*G + weight[2]*B
    # value = round(R,6)
    H,S,V = rgb2hsv([R,G,B])
    value = hsv2value([H,S,V])
    
    return value

def xls2json(testxls):
    data,filename = get_data(testxls)
    jsonName = filename+".json"
    row =data.nrows #总行数
    points = []
    for i in range(1,row):
        rowdata =data.row_values(i)#i行的list
        [lng_gcj_02,lat_gcj_02,R,G,B] = rowdata

        (lng_wgs_83,lat_wgs_84) = lnglatconver.gcj02_to_wgs84(lng_gcj_02,lat_gcj_02)
        value = RGB2Value(R,G,B)

        pointdata = [lng_wgs_83,lat_wgs_84,value]
        
        points.append(pointdata)

    jsonData = points

    f = open(jsonName,'w')
    f.truncate()
    f.write('{\"data\":')
    f.write(json.dumps(jsonData))
    f.write('}')
    f.close()
    return jsonName

# 选择文件夹 批量转换xls到json
def batchxls2json():
    rootDirPath = os.getcwd()
    filesInRoot = os.listdir()
    for file in filesInRoot:
        print(filesInRoot.index(file),file) 
    while 1:
        chooseNum = input("please choose a dir to translate:")
        if((os.path.isdir(filesInRoot[int(chooseNum)]) == False)): #or len(filesInRoot[int(chooseNum)]) > 11):
            print("input error")      
        else:
            chooseNum = int(chooseNum)
            jsonFile = filesInRoot[chooseNum]+"-json"
            if(os.path.exists(jsonFile) == False):
                os.mkdir(jsonFile)    
            os.chdir(filesInRoot[chooseNum])
            xlsDataPath = os.getcwd()
            # 用\转义\``
            jsonDataPath = rootDirPath + '\\'  + filesInRoot[chooseNum] + '-json'
            break
    xlsFilesInDir = os.listdir()
    jsonNameList = "jsonNameList.json"
    jsonList = open(jsonNameList,'w')
    jsonList.truncate()
    jsonList.write('{\"namelist\":[')

    for filename in tqdm(xlsFilesInDir):
        targetJsonName = jsonDataPath + '\\' + filename.split('.')[0] + ".json"
        if(os.path.exists(targetJsonName) == True):
            print(targetJsonName,"is exists")
        else:                
            jsonFile = xls2json(filename)
            shutil.move(jsonFile,jsonDataPath)
            print(jsonFile,"Conversion completed")
        jsonList.write('\"'+jsonFile + '\",')

    jsonList.seek(-1, os.SEEK_END)     # end of file
    size=jsonList.tell()               # the size...
    jsonList.truncate(size-1)          # truncate at that size - how ever many characters
    jsonList.write(']}')
    jsonList.close()
    shutil.move(jsonNameList,rootDirPath) 

# batchxls2json()

# xls2json(testxls)
