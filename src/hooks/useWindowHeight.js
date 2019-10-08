import { useState, useEffect } from "react";

export default function useWindowSize() {
  function getSize() {
    return {
      w: window.innerWidth,
      h: window.innerHeight
    };
  }

  const [ws, setWs] = useState(getSize);

  useEffect(() => {
    function setSize() {
      setWs(getSize());
    }

    window.addEventListener("resize", setSize);
    return () => window.removeEventListener("resize", setSize);
  }, []);

  return ws;
}
