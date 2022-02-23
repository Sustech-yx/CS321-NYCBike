import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import "./index.css";

export default class CustNavLink extends Component {
  render() {
    return <NavLink className="normal" {...this.props} />;
  }
}
