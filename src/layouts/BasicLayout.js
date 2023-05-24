//从 4.0 开始，antd 不再内置 Icon 组件，请使用独立的包 @ant-design/icons
import {
  HomeOutlined,
  DesktopOutlined,
  PieChartOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
  BorderOutlined,
  BlockOutlined,
} from '@ant-design/icons';
import React, { Component } from 'react';
import { Layout, Menu, Breadcrumb } from 'antd';
import { Route, Link, withRouter } from 'react-router-dom';


import './BasicLayout.css';
//导入pages包中的三个组件
import Home from '../pages/home/Home';
import Analysis from '../pages/analysis/Analysis';
import PredictionAnalysis from '../pages/prediction/PredictionAnalysis';
import OdPred from '../pages/od/OdPred';
import Odtest from '../pages/test/test';

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

// 面包屑这种设计元素在页面上占用的空间相当小，它基本都是以带链接的文本的形式存在的，并且通常只有一行。
// 面包屑名称和icon的map
const breadcrumbMap = {
  '/analysis': {
    icon: <BorderOutlined />,
    name: 'Analysis',
  },
  '/prediction': {
    icon: <BlockOutlined />,
    name: 'Prediction',
  },
  '/od': {
    icon: <BlockOutlined />,
    name: 'Prediction',
  },
  '/test': {
    icon: <BlockOutlined />,
    name: 'Analysis',
  },
  '/team': {
    icon: <TeamOutlined />,
    name: 'Team',
  },
  '/team/1': {
    icon: <UserOutlined />,
    name: 'Team1',
  },
};

// route 等价于 <Route path="/" exact component={Home} />
const routes = [
  {
    path: "/",
    exact: true,
    component: Home
  },
  {
    path: "/analysis",
    exact: true,
    component: Analysis
  },
  {
    path: "/prediction",
    exact: true,
    component: PredictionAnalysis
  },
  {
    path: "/od",
    exact: true,
    component: OdPred
  },
  {
    path: "/test",
    exact: true,
    component: Odtest
  },
]

// 定义BasicLayout组件
class BasicLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
    }
  }

  onCollapse = collapsed => {
    this.setState({ collapsed });
  };

  componentDidMount() {
  }

  getBreadcrumbItems() { // 这个函数在做什么？返回的是什么？是一个列表，包括一个面包屑组件。
    const { location } = this.props;
    //console.log(location)
    const pathSnippets = location.pathname.split('/').filter(i => i);
    //console.log(pathSnippets)
    const extraBreadcrumbItems = pathSnippets.map((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;

      return (
        <Breadcrumb.Item key={url}>
          {breadcrumbMap[url].icon}
          <Link to={url}>
            {breadcrumbMap[url].name}
          </Link>
        </Breadcrumb.Item>
      );
    });
    const breadcrumbItems = [
      <Breadcrumb.Item key="home">
        <HomeOutlined />
        <Link to="/">
          Home
        </Link>
      </Breadcrumb.Item>,
    ].concat(extraBreadcrumbItems);

    return breadcrumbItems
  }

  render() {
    const BreadcrumbItems = this.getBreadcrumbItems()
    return (
      //Layout：布局容器，其下可嵌套 Header Sider Content Footer 或 Layout 本身，可以放在任何父容器中。
      //https://ant.design/components/layout-cn/
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          // collapsible
          // collapsed={this.state.collapsed}
          // onCollapse={this.onCollapse}
          width={300}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
          }}
        >
          <div className="logo" />
          {/* //!定义侧边栏的“可视分析”与“预测分析” */}
          <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline"
          >
            {/* <Menu.Item key="1" icon={<HomeOutlined />}>
              <Link to="/">首页</Link>
            </Menu.Item> */}
            {/* <Menu.Item key="2" icon={<BorderOutlined />}>
              <Link to="/analysis">交通拥堵可视分析</Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<BlockOutlined />}>
              <Link to="/prediction">交通拥堵预测分析</Link>
            </Menu.Item> */}
            {/* 添加自定义界面 */}
            <Menu.Item key="4" icon={<BlockOutlined />}>
              <Link to="/test">起止需求可视分析</Link>
            </Menu.Item>
            <Menu.Item key="5" icon={<BlockOutlined />}>
              <Link to="/od">起止需求预测分析</Link>
            </Menu.Item>
            {/* <Menu.Item key="4" icon={<TeamOutlined />}>
              <Link to="/team">团队介绍</Link>
            </Menu.Item>
            <SubMenu key="sub2" icon={<TeamOutlined />} title="Team">
              <Menu.Item key="6">
                <Link to="/team/1">Team 1</Link>
              </Menu.Item>
              <Menu.Item key="8">Team 2</Menu.Item>
            </SubMenu> */}
            {/* <Menu.Item key="9" icon={<FileOutlined />} >others</Menu.Item> */}
          </Menu>
        </Sider>
        <Layout className="site-layout" style={{ marginLeft: 300 }}>

          <Header className="site-layout-background header-title" style={{ padding: 0 }} >
            出行起止需求可视化分析系统
          </Header>

          <Content style={{ margin: '0 32px', overflow: 'initial' }}>
            <Breadcrumb style={{ margin: '4px 0' }}>
              {BreadcrumbItems}
            </Breadcrumb>
            <div id="site-layout-content" className="site-layout-background site-layout-content">
              {
                //! 导入的组件在这里被使用吗？
                //map 方法会给原数组中的每个元素都按顺序调用一次 callback 函数。
                routes.map((route, index) => {
                  console.log(route,index)
                  return <Route key={index} path={route.path} exact={route.exact} component={route.component} />
                })
              }
            </div>
          </Content>

          <Footer style={{ textAlign: 'center' }}>
            Travel Origin-Destination Demand Vis System ©2022 Created by STDAL
          </Footer>

        </Layout>
      </Layout>
    );
  }
}

export default withRouter(BasicLayout);
//!使用withRouter()的结果是什么？
//withRouter的作用就是, 如果某个东西不是一个Router, 但是要依靠它去跳转一个页面,
//比如点击页面的logo, 返回首页, 这时候就可以使用withRouter来做.