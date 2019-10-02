import React from "react";
import { Helmet } from "react-helmet";

export default function MainPage() {
  return (
    <div>
      <Helmet htmlAttributes={{ lang: "en" }}>
        <title>Main | Terra Leads</title>
        <meta name="description" content="Main Page of Terra Leads" />
      </Helmet>
    </div>
  );
}
