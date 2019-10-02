import "react-app-polyfill/ie11";
import React from "react";
import ReactDOM from "react-dom";

// import { Provider } from "react-redux";
// import { createStore } from "redux";
// import { langReducer } from "./store/reducer";
// import { setLang } from "./store/action";

// import * as serviceWorker from "./serviceWorker";

import Router from "./containers/Router";

import "./sass/main.sass";

// const store = createStore(langReducer);

// if (localStorage.terraLang) store.dispatch(setLang(localStorage.terraLang));

ReactDOM.render(<Router />, document.getElementById("terra"));

// serviceWorker.unregister();
