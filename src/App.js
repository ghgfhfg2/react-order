import React, { useEffect, useState } from "react";
import { Route, Switch, useHistory } from "react-router-dom";
import Nav from "./component/Nav";
import './custom_antd.less';
import "./App.css";
import Join from "./component/Join";
import Login from "./component/Login";
import Menu from "./component/Menu";
import MyOrder from "./component/MyOrder";
import MyMenu from "./component/MyMenu";
import AdminProd from "./component/Admin/AdminProd";
import AdminOrder from "./component/Admin/AdminOrder";
import AdminOrderList from "./component/Admin/AdminOrderList";
import Loading from "./component/Loading";
import { Layout, Button, BackTop } from "antd";
import firebase from "./firebase";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "./redux/actions/user_action";
import { getNotificationPermission } from "./component/CommonFunc";
import * as antIcon from "react-icons/ai";
//import Logo from "./img/logo.svg";
import Logo from "./img/logo_2021_spring.png";


const { Sider, Content, Header } = Layout;
function App(props) {
  function isDesktopOS(){
    return ( 'win16|win32|win64|windows|mac|macintel|linux|freebsd|openbsd|sunos'.indexOf(navigator.platform.toLowerCase()) >= 0 ); 
  }

  if(isDesktopOS()){
    getNotificationPermission();
  }

  let history = useHistory();
  let dispatch = useDispatch();
  const isLoading = useSelector((state) => state.user.isLoading);
  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        history.push("/");
        dispatch(setUser(user));
      } else {
        history.push("/login");
        dispatch(clearUser());
      }
    });
  }, []);
  

  // 스크롤 이벤트 핸들러
  const [TopFix, setTopFix] = useState(false);
  const [TopFixLeft, setTopFixLeft] = useState(false);
  const handleScroll = () => {
    let scrollTop = document.documentElement.scrollTop;
    if (scrollTop >= 100) {
      setTopFixLeft(true);
    } else {
      setTopFixLeft(false);
    }
    if (scrollTop >= 70) {
      setTopFix(true);
    } else {
      setTopFix(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });
  if (isLoading) {
    return (
      <>
        <Layout className={TopFix && "top-fix"}>
          <Header className="header-box">
            <a href="/">
              <img className="top-logo" src={Logo} alt="" />
            </a>
          </Header>
          <Layout>
            <div className="content-box">
              <Sider className={"nav-wrap " + (TopFixLeft && "fix")}>
                <Nav />
              </Sider>
              <Content>
                <Loading />
              </Content>
            </div>
          </Layout>
        </Layout>
      </>
    );
  } else {
    return (
      <>
        <Layout className={TopFix && "top-fix"}>
          <Header className="header-box">
            <a href="/">
              <img className="top-logo" src={Logo} alt="" />
            </a>
          </Header>
          <Layout>
            <div className="content-box">
              <Sider className={"nav-wrap " + (TopFixLeft && "fix")}>
                <Nav />
              </Sider>
              <Content>
                <Switch>
                  <Route exact path="/" component={Menu} />
                  <Route exact path="/login" component={Login} />
                  <Route exact path="/join" component={Join} />
                  <Route exact path="/myorder" component={MyOrder} />
                  <Route exact path="/mymenu" component={MyMenu} />
                  <Route exact path="/admin/prod" component={AdminProd} />
                  <Route exact path="/admin/order" component={AdminOrder} />
                  <Route
                    exact
                    path="/admin/order_list"
                    component={AdminOrderList}
                  />
                </Switch>
              </Content>
              <BackTop>
                <Button
                  type="primary"
                  shape="circle"
                  className="btn-top-move"
                  icon={<antIcon.AiOutlineArrowUp />}
                />
              </BackTop>
            </div>
          </Layout>
        </Layout>
      </>
    );
  }
}

export default App;
