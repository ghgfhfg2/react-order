import { Route, Switch } from "react-router-dom";
import Nav from "./component/Nav";
import "./App.css";
import LandingPage from "./component/LandingPage";

function App() {
  return (
    <>
      <Nav />
      <Switch>
        <Route exact path="/" component={LandingPage} />
      </Switch>
    </>
  );
}

export default App;
