import { Route, Switch } from "react-router-dom";
import Nav from "./component/Nav";
import "./App.css";
import LandingPage from "./component/LandingPage";
import Join from "./component/Join";

function App() {
  return (
    <>
      <Nav />
      <Switch>
        <Route exact path="/" component={LandingPage} />
        <Route exact path="/join" component={Join} />
      </Switch>
    </>
  );
}

export default App;
