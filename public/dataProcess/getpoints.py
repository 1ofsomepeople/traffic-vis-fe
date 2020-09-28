import os
import shutil
# 读excel文件
import xlrd
import json
import lnglat_mercator_tiles_convertor as lnglatconver
from tqdm import tqdm


def gen_wgs84points_json():
    excel_test_file = './2019-04-02_09-00.json'
    data = []
    with open(excel_test_file, 'r') as f:
        data = json.load(f)['data']

    wgs84points = []
    for index in range(len(data)):
        curpoint = data[index][0:2]
        wgs84points.append(curpoint)

    jsonres = {
        "wgs84points": wgs84points
    }
    print(type(json))
    with open("./points.json", "w") as f:
        f.write('{\"wgs84points\":')
        f.write(json.dumps(wgs84points))
        f.write('}')
        print("加载入文件完成...")