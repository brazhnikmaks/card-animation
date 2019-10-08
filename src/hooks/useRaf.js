import { useEffect, useRef } from "react";

export default function useRaf(callback) {
  const request = useRef();

  const animate = () => {
    callback();
    request.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    request.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(request.current);
  }, []);
}
