import React, { useEffect } from "react";
import { Route, Switch, useHistory } from "react-router-dom";
import Nav from "./component/Nav";
import "./App.css";
import LandingPage from "./component/LandingPage";
import Join from "./component/Join";
import Login from "./component/Login";
import Menu from "./component/Menu";
import MyOrder from "./component/MyOrder";
import Admin from "./component/Admin/Admin";
import AdminProd from "./component/Admin/AdminProd";
import AdminOrder from "./component/Admin/AdminOrder";
import AdminOrderList from "./component/Admin/AdminOrderList";
import Loading from "./component/Loading";
import { Layout } from "antd";
import firebase from "./firebase";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "./redux/actions/user_action";

const { Sider, Content } = Layout;
function App(props) {
  let history = useHistory();
  let dispatch = useDispatch();
  const isLoading = useSelector((state) => state.user.isLoading);
  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        dispatch(setUser(user));
      } else {
        history.push("/login");
        dispatch(clearUser());
      }
    });
  }, []);
  if (isLoading) {
    return (
      <>
        <Layout>
          <Sider className="nav-wrap">
            <Nav />
          </Sider>
          <Content className="content-box">
            <Loading />
          </Content>
        </Layout>
      </>
    );
  } else {
    return (
      <>
        <Layout>
          <Sider className="nav-wrap">
            <Nav />
          </Sider>
          <Content className="content-box">
            <Switch>
              <Route exact path="/" component={LandingPage} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/join" component={Join} />
              <Route exact path="/menu" component={Menu} />
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
        </Layout>
      </>
    );
  }
}

export default App;
