import React from 'react';
import BasicLayout from './layouts/BasicLayout';
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'mobx-react'
import store from './store/index'

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <BasicLayout />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
