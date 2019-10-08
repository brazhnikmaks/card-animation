import React from "react";
import { Helmet } from "react-helmet";
import Card from "../components/Card";

export default function MainPage() {
  return (
    <div className="main">
      <Helmet htmlAttributes={{ lang: "en" }}>
        <title>Main | Terra Leads</title>
        <meta name="description" content="Main Page of Terra Leads" />
      </Helmet>
      <Card />
    </div>
  );
}
