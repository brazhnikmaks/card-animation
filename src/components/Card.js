import React, { useState, useEffect, useRef } from "react";
import useWindowHeight from "../hooks/useWindowHeight";
import useRaf from "../hooks/useRaf";

const CardMove = {
  start: {
    percent: 0,
    x: 0.45,
    y: 0
  },
  end: {
    percent: 1,
    x: 0.45,
    y: 0.9
  }
};

export default function Card(props) {
  const ws = useWindowHeight();
  const ch = 6000;

  const cardEl = useRef(null);

  const [cardPos, cardPosSet] = useState(CardMove);
  useEffect(() => {
    cardPosSet(cardPos => {
      cardPos.diff = {
        percent: cardPos.end.percent - cardPos.start.percent,
        x: cardPos.end.x - cardPos.start.x,
        y: cardPos.end.y - cardPos.start.y
      };
      cardPos.target = {};
      cardPos.current = {};
    });
  }, []);

  useRaf(() => {
    const wy = window.pageYOffset || window.scrollTop || 0;
    const scrolled = wy / (document.body.scrollHeight - ws.h);
    const cardUpdate = { ...cardPos };
    if (scrolled <= cardUpdate.start.percent) {
      cardUpdate.target.x = cardUpdate.start.x * ws.w;
      cardUpdate.target.y = cardUpdate.start.y * ch;
    } else if (scrolled >= cardUpdate.end.percent) {
      cardUpdate.target.x = cardUpdate.end.x * ws.w;
      cardUpdate.target.y = cardUpdate.end.y * ch;
    } else {
      cardUpdate.target.x =
        cardUpdate.start.x * ws.w +
        ((cardUpdate.diff.x * (scrolled - cardUpdate.start.percent)) /
          cardUpdate.diff.percent) *
          ws.w;
      cardUpdate.target.y =
        cardUpdate.start.y * ch +
        ((cardUpdate.diff.y * (scrolled - cardUpdate.start.percent)) /
          cardUpdate.diff.percent) *
          ch;
    }

    // lerp
    if (!cardUpdate.current.x) {
      cardUpdate.current.x = cardUpdate.target.x;
      cardUpdate.current.y = cardUpdate.target.y;
    } else {
      cardUpdate.current.x =
        cardUpdate.current.x +
        (cardUpdate.target.x - cardUpdate.current.x) * 0.1;
      cardUpdate.current.y =
        cardUpdate.current.y +
        (cardUpdate.target.y - cardUpdate.current.y) * 0.1;
    }
    cardEl.current.style.transform =
      "translate3d(" +
      cardUpdate.current.x +
      "px, " +
      cardUpdate.current.y +
      "px, 0px)";
    cardPosSet(cardUpdate);
  });

  useEffect(() => {
    // console.log(cardPos);
  }, []);

  // _movingElements[i].style[_jsPrefix + "Transform"] =
  //   "translate3d(" + p.current.x + "px, " + p.current.y + "px, 0px)";

  return <div ref={cardEl} className="card"></div>;
}
