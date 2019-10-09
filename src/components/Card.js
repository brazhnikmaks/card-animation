import React, { useEffect, useRef } from "react";
import Scene from "./Scene";

export default function Card(props) {
  const cardEl = useRef(null);

  useEffect(() => {
    Scene.init(cardEl.current);
  }, []);

  return <div ref={cardEl} className="card-scene"></div>;
}
