import React from 'react';
import ReactDOM from 'react-dom';


import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

//! 直接渲染App组件
ReactDOM.render(
  // <React.StrictMode>
  //   <App />
  // </React.StrictMode>
  <App />
  ,
  document.getElementById('root') //! root节点在../public/index.html
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

/**
 * render()接受两个参数，第一个是要渲染的组件，第二个是组件将挂载的节点
 */
