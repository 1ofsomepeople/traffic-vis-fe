import React from 'react';
import BasicLayout from './layouts/BasicLayout';
import './App.css';
import { BrowserRouter } from 'react-router-dom';


function App() {
  return (
    <BrowserRouter>
      <BasicLayout />
    </BrowserRouter>
  );
}

export default App;
