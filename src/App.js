import React, { useEffect, useState } from "react";
import { Route, Switch, useHistory } from "react-router-dom";
import Nav from "./component/Nav";
import "./App.css";
import Join from "./component/Join";
import Login from "./component/Login";
import Menu from "./component/Menu";
import MyOrder from "./component/MyOrder";
import Admin from "./component/Admin/Admin";
import AdminProd from "./component/Admin/AdminProd";
import AdminOrder from "./component/Admin/AdminOrder";
import AdminOrderList from "./component/Admin/AdminOrderList";
import Loading from "./component/Loading";
import { Layout, Button } from "antd";
import firebase from "./firebase";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "./redux/actions/user_action";
import * as antIcon from "react-icons/ai";
import Logo from "./img/logo.svg";

const { Sider, Content, Header } = Layout;
function App(props) {
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
const [TopFix, setTopFix] = useState(false)
const [TopFixLeft, setTopFixLeft] = useState(false)
const clientHeight = document.documentElement.clientHeight;
const scrollHeight = document.documentElement.scrollHeight;
const handleScroll = () => {
  let scrollTop = document.documentElement.scrollTop;
  if(scrollTop >= 100){
    setTopFixLeft(true)
  }else{
    setTopFixLeft(false)
  }
  if(scrollTop >= 70){
    setTopFix(true)
  }else{
    setTopFix(false)
  }
 };

const scrollToTop = (event) => {
  console.log(event)
  window.scrollTo(0, 0);
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
        <Layout className={(TopFix && "top-fix")}>
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
        <Layout className={(TopFix && "top-fix")}>
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
                  <Route exact path="/admin" component={Admin} />
                  <Route exact path="/admin/prod" component={AdminProd} />
                  <Route exact path="/admin/order" component={AdminOrder} />
                  <Route
                    exact
                    path="/admin/order_list"
                    component={AdminOrderList}
                  />
                </Switch>
              </Content>
              <Button type="primary" shape="circle" className="btn-top-move" icon={<antIcon.AiOutlineArrowUp />} onClick={scrollToTop} />
            </div>
          </Layout>
        </Layout>
      </>
    );
  }
}

export default App;
