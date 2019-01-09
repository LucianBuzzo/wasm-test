import React from "react";
import ReactDOM from "react-dom";
import { Provider, Theme } from "rendition";
import async from "./Async.js";

import { injectGlobal } from "styled-components";

console.log("LOADED");

injectGlobal([], {
  "*": {
    boxSizing: "border-box"
  },
  body: {
    lineHeight: 1.5,
    margin: 0,
    fontFamily: Theme.font
  }
});

const App = async(() => {
  return import("./App.jsx");
});

ReactDOM.render(
  <Provider>
    <App />
  </Provider>,
  document.getElementById("root")
);
