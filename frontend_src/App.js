import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import PubSub from "pubsub-js";
import {
  DotChartOutlined,
  NodeIndexOutlined,
  MenuOutlined
} from "@ant-design/icons";
import CustNavLink from "./components/CustNavLink";
import Display from "./pages/Display";
import Compare from "./pages/Compare";
import "./styles.css";

export default class App extends Component {
  state = {
    selectStr: ""
  };

  componentDidMount() {
    this.token = PubSub.subscribe("selected", (_, data) => {
      // console.log("sub", data);
      this.setState({ selectStr: data });
    });
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.token);
  }

  render() {
    const { selectStr } = this.state;
    return (
      <div>
        <div className="navigation_bar">
          <label className="menu_title">
            <MenuOutlined /> Menu
          </label>
          <CustNavLink to="/display">
            <DotChartOutlined className="icon" /> Flow Display
          </CustNavLink>
          <CustNavLink
            to={{
              pathname: "/compare",
              search: selectStr
            }}
          >
            <NodeIndexOutlined className="icon" /> Flow Compare
          </CustNavLink>
        </div>
        <div className="display_panel">
          <Switch>
            <Route path="/display" component={Display} />
            <Route path="/compare" component={Compare} />
            <Redirect to="/display" />
          </Switch>
        </div>
      </div>
    );
  }
}
