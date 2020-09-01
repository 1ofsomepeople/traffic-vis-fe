import React, { Component } from 'react';
import { Layout, Menu, Breadcrumb } from 'antd';
import { Route, Link, withRouter } from 'react-router-dom';

import './BasicLayout.css';

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

import Home from '../pages/home/Home';
import Analysis from '../pages/analysis/Analysis';
import PredictionAnalysis from '../pages/prediction/PredictionAnalysis';

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

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
]

class BasicLayout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: false,
        }
    }

    onCollapse = collapsed => {
        console.log(collapsed);
        this.setState({ collapsed });
    };

    componentDidMount() {
    }

    getBreadcrumbItems() {
        const { location } = this.props;
        const pathSnippets = location.pathname.split('/').filter(i => i);

        console.log(pathSnippets)
        const extraBreadcrumbItems = pathSnippets.map((_, index) => {
            const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
            console.log(url)
            return (
                <Breadcrumb.Item key={url}>
                    {breadcrumbMap[url].icon}
                    <Link to={url}>{breadcrumbMap[url].name}</Link>
                </Breadcrumb.Item>
            );
        });
        const breadcrumbItems = [
            <Breadcrumb.Item key="home">
                <HomeOutlined />
                <Link to="/">Home</Link>
            </Breadcrumb.Item>,
        ].concat(extraBreadcrumbItems);

        return breadcrumbItems
    }

    render() {
        const BreadcrumbItems = this.getBreadcrumbItems()
        return (
            <Layout style={{ minHeight: '100vh' }}>
                <Sider collapsible collapsed={this.state.collapsed} onCollapse={this.onCollapse}>
                    <div className="logo" />
                    <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
                        <Menu.Item key="1" icon={<HomeOutlined />}>
                            <Link to="/">首页</Link>
                        </Menu.Item>
                        <Menu.Item key="2" icon={<BorderOutlined />}>
                            <Link to="/analysis">可视分析</Link>
                        </Menu.Item>
                        <Menu.Item key="3" icon={<BlockOutlined />}>
                            <Link to="/prediction">预测分析</Link>
                        </Menu.Item>
                        <Menu.Item key="4" icon={<TeamOutlined />}>
                            <Link to="/team">团队介绍</Link>
                        </Menu.Item>
                        <SubMenu key="sub2" icon={<TeamOutlined />} title="Team">
                            <Menu.Item key="6">
                                <Link to="/team/1">Team 1</Link>
                            </Menu.Item>
                            <Menu.Item key="8">Team 2</Menu.Item>
                        </SubMenu>
                        <Menu.Item key="9" icon={<FileOutlined />} >others</Menu.Item>
                    </Menu>
                </Sider>
                <Layout className="site-layout">
                    <Header className="site-layout-background header-title" style={{ padding: 0 }} >交通大数据可视化分析系统</Header>
                    <Content style={{ margin: '0 16px' }}>
                        <Breadcrumb style={{ margin: '16px 0' }}>
                            {BreadcrumbItems}
                        </Breadcrumb>
                        <div id="site-layout-content" className="site-layout-background site-layout-content">
                            {
                                routes.map((route, index) => {
                                    return <Route key={index} path={route.path} exact={route.exact} component={route.component} />
                                })
                            }
                        </div>
                    </Content>
                    <Footer style={{ textAlign: 'center' }}>Traffic Vis System ©2019 Created by STDAL</Footer>
                </Layout>
            </Layout>
        );
    }
}

export default withRouter(BasicLayout);