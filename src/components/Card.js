import React, { useState, useEffect, useRef } from "react";
import useWindowHeight from "../hooks/useWindowHeight";
import useRaf from "../hooks/useRaf";

const lerp = (start, end) => (1 - 0.1) * start + 0.1 * end;

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
  const ch = 6000 - window.innerHeight;

  const cardEl = useRef(null);
  const cardPosEL = useRef(null);

  // const [cardPos, cardPosSet] = useState(CardMove);
  // useEffect(() => {
  //   cardPosSet(cardPos => {
  //     cardPos.diff = {
  //       percent: cardPos.end.percent - cardPos.start.percent,
  //       x: cardPos.end.x - cardPos.start.x,
  //       y: cardPos.end.y - cardPos.start.y
  //     };
  //     cardPos.target = {};
  //     cardPos.current = {};
  //   });
  // }, []);

  // useRaf(() => {
  //   const wy = window.pageYOffset || window.scrollTop || 0;
  //   const scrolled = wy / (document.body.scrollHeight - ws.h);
  //   const cardUpdate = { ...cardPos };
  //   if (scrolled <= cardUpdate.start.percent) {
  //     cardUpdate.target.x = cardUpdate.start.x * ws.w;
  //     cardUpdate.target.y = cardUpdate.start.y * ch;
  //   } else if (scrolled >= cardUpdate.end.percent) {
  //     cardUpdate.target.x = cardUpdate.end.x * ws.w;
  //     cardUpdate.target.y = cardUpdate.end.y * ch;
  //   } else {
  //     cardUpdate.target.x =
  //       cardUpdate.start.x * ws.w +
  //       ((cardUpdate.diff.x * (scrolled - cardUpdate.start.percent)) /
  //         cardUpdate.diff.percent) *
  //         ws.w;
  //     cardUpdate.target.y =
  //       cardUpdate.start.y * ch +
  //       ((cardUpdate.diff.y * (scrolled - cardUpdate.start.percent)) /
  //         cardUpdate.diff.percent) *
  //         ch;
  //   }
  //   cardEl.current.style.transform =
  //     "translate3d(" +
  //     cardUpdate.target.x +
  //     "px, " +
  //     cardUpdate.target.y +
  //     "px, 0px)";
  //   cardPosSet(cardUpdate);
  // });
  let curScroll = 0;
  // const [curScroll, setCurScroll] = useState(0);
  useRaf(() => {
    const wy = window.pageYOffset || window.scrollTop || 0;
    const scrolled = wy / (document.body.scrollHeight - ws.h);
    let newAngle = 0;
    if (scrolled <= 0) {
      newAngle = lerp(curScroll, 0);
    } else if (scrolled >= 1) {
      newAngle = lerp(curScroll, 360);
    } else {
      newAngle = lerp(curScroll, 360 * scrolled);
    }
    cardPosEL.current.style.transform = "rotateX(" + curScroll + "deg)";
    curScroll = newAngle;
  });

  // _movingElements[i].style[_jsPrefix + "Transform"] =
  //   "translate3d(" + p.current.x + "px, " + p.current.y + "px, 0px)";

  return (
    <div className="card-wrap">
      <div ref={cardPosEL} className="card-pos">
        <div ref={cardEl} className="card">
          <div className="front"></div>
          <div className="back"></div>
        </div>
      </div>
    </div>
  );
}
