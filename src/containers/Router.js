// libs
import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";

// pages
import MainPage from "../pages/MainPage";

const Router = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" component={MainPage} />
      </Switch>
    </BrowserRouter>
  );
};

export default Router;
