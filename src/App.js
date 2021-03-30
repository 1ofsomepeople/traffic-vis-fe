import React from 'react';
import { Provider } from 'mobx-react'
import { BrowserRouter } from 'react-router-dom';


import './App.css';
import store from './store/index'
import BasicLayout from './layouts/BasicLayout';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <BasicLayout />           {/* BasicLayout组件 */}
      </BrowserRouter>
    </Provider>
  );
}

export default App;

/*
    1)export命令用于规定模块的对外接口
    2)一个模块就是一个独立的文件。该文件内部的所有变量，外部无法获取
    如果你希望外部能够读取模块内部的某个变量，就必须使用export关键字输出该变量
    3)export命令除了输出变量，还可以输出函数或类

    4)import命令接受一对大括号，里面指定要从其他模块导入的变量名
    大括号里面的变量名，必须与被导入模块（profile.js）对外接口的名称相同
    5)如果想为输入的变量重新取一个名字，import命令要使用as关键字，将输入的变量重命名
    6)使用import命令的时候，用户需要知道所要加载的变量名或函数名，否则无法加载
    但是，用户肯定希望快速上手，未必愿意阅读文档，去了解模块有哪些属性和方法
    7)为了给用户提供方便，让他们不用阅读文档就能加载模块，就要用到export default命令，为模块指定默认输出
    8)本质上，export default就是输出一个叫做default的变量或方法，然后系统允许你为它取任意名字
    9)需要注意的是，这时import命令后面，不使用大括号
*/
