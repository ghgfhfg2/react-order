import { Route, Switch } from "react-router-dom";
import Nav from "./component/Nav";
import "./App.css";
import LandingPage from "./component/LandingPage";
import Join from "./component/Join";
import Login from "./component/Login";
import { Layout } from "antd";
const { Sider, Content } = Layout;

function App() {
  return (
    <>
      <Layout>
        <Sider>
          <Nav />
        </Sider>
        <Content className="content-box">
          <Switch>
            <Route exact path="/" component={LandingPage} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/join" component={Join} />
          </Switch>
        </Content>
      </Layout>
    </>
  );
}

export default App;
