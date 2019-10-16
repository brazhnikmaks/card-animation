const Cards = (function() {
  "use strict";
  let touchArea = document.getElementById("js_cards-screen");
  const allCards = touchArea.querySelectorAll(".card");
  const cardsCount = allCards.length;
  let swipedCount = 0;
  let lastItemIndex = cardsCount - (swipedCount + 1);
  let lastItem = allCards[lastItemIndex];
  const baseClasses = "card";
  const animationClasss = "animate";
  const START_X = Math.round(
    (touchArea.offsetWidth - lastItem.offsetWidth) / 2
  );
  const START_Y = Math.round(
    (touchArea.offsetHeight - lastItem.offsetHeight) / 2
  );
  let ticking = false,
    transform,
    timer;
  const mc = new Hammer.Manager(touchArea);
  const reqAnimationFrame = (function() {
    return (
      window[Hammer.prefixed(window, "requestAnimationFrame")] ||
      function(callback) {
        window.setTimeout(callback, 1000 / 60);
      }
    );
  })();
  const noBtn = document.getElementById("js_no-btn");
  const yesBtn = document.getElementById("js_yes-btn");
  return {
    resetElement: function(cards, idx, classes) {
      cards[idx].className = classes;
      transform = {
        translate: { x: START_X, y: START_Y },
        scale: 1,
        angle: 0,
        rx: 0,
        ry: 0,
        rz: 0
      };
      this.requestElementUpdate();
    },
    requestElementUpdate: function() {
      const cards = this;
      if (!ticking) {
        reqAnimationFrame(cards.updateElementTransform);
        ticking = true;
      }
    },
    updateElementTransform: function() {
      let value = [
        "translate3d(" +
          transform.translate.x +
          "px, " +
          transform.translate.y +
          "px, 0px)",
        "scale(" + transform.scale + ", " + transform.scale + ")",
        "rotate3d(" +
          transform.rx +
          "," +
          transform.ry +
          "," +
          transform.rz +
          "," +
          transform.angle +
          "deg)"
      ];
      value = value.join(" ");
      allCards[lastItemIndex].style.webkitTransform = value;
      allCards[lastItemIndex].style.mozTransform = value;
      allCards[lastItemIndex].style.transform = value;
      ticking = false;
    },
    onPan: function(ev, allCards, itemIndex, classes) {
      const cards = this;
      allCards[itemIndex].className = classes;
      transform.translate = {
        x: START_X + ev.deltaX,
        y: START_Y + ev.deltaY
      };
      var isMac = navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i)
        ? true
        : false;
      if (!isMac) {
        const { angle } = ev;
        const angleRad = (parseInt(angle) * Math.PI) / 180;
        let rx = -Math.sin(angleRad),
          ry = Math.cos(angleRad);
        let value = [`rotate3d(${rx}, ${ry}, 0, 20deg)`];
        value = value.join(" ");
        const prevCard = allCards[lastItemIndex - 1];
        if (prevCard) {
          prevCard.style.webkitTransform = value;
          prevCard.style.mozTransform = value;
          prevCard.style.transform = value;
        }
      }
      cards.requestElementUpdate();
    },
    onSwipe: function(ev, allCards, lastItemIndex) {
      const cards = this;
      const angle = -20;
      const { distance, direction } = ev;
      transform.ry = ev.direction & Hammer.DIRECTION_HORIZONTAL ? 1 : 0;
      transform.rx = ev.direction & Hammer.DIRECTION_VERTICAL ? 1 : 0;
      transform.angle =
        ev.direction & (Hammer.DIRECTION_RIGHT | Hammer.DIRECTION_UP)
          ? angle
          : -angle;
      if (distance > 100) {
        cards.pushCardOut(direction);
      } else {
        clearTimeout(timer);
        timer = setTimeout(() => {
          cards.resetElement(
            allCards,
            lastItemIndex,
            `${baseClasses} ${animationClasss}`
          );
        }, 300);
      }
      cards.requestElementUpdate();
    },
    pushCardOut: function(direction) {
      const cards = this;
      if (direction & Hammer.DIRECTION_LEFT) {
        allCards[lastItemIndex].className += " left";
        cards.showNextCard();
      } else if (direction & Hammer.DIRECTION_RIGHT) {
        allCards[lastItemIndex].className += " right";
        cards.showNextCard();
      } else {
        clearTimeout(timer);
        timer = setTimeout(() => {
          cards.resetElement(
            allCards,
            lastItemIndex,
            `${baseClasses} ${animationClasss}`
          );
        }, 300);
      }
    },
    showNextCard: function() {
      const cards = this;
      swipedCount++;
      if (swipedCount < cardsCount) {
        lastItemIndex = cardsCount - (swipedCount + 1);
        cards.resetElement(
          allCards,
          lastItemIndex,
          `${baseClasses} ${animationClasss}`
        );
      } else {
        touchArea.className += " cards--over";
      }
    },
    onTap: function() {
      const cards = this;
      transform.scale = 1.1;
      transform.rz = 1;
      transform.angle = -3;
      clearTimeout(timer);
      timer = setTimeout(function() {
        cards.resetElement(
          allCards,
          lastItemIndex,
          `${baseClasses} ${animationClasss}`
        );
      }, 300);
      cards.requestElementUpdate();
    },
    initActions: function(hammerManager) {
      hammerManager.on("panstart panmove", ev => {
        this.onPan(ev, allCards, lastItemIndex, baseClasses);
      });
      hammerManager.on("swipe", ev => {
        this.onSwipe(ev, allCards, lastItemIndex);
      });
      hammerManager.on("tap", () => {
        this.onTap();
      });
      hammerManager.on("hammer.input", ev => {
        if (ev.isFinal) {
          this.resetElement(
            allCards,
            lastItemIndex,
            `${baseClasses} ${animationClasss}`
          );
        }
      });
      noBtn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        this.pushCardOut(2);
      });
      yesBtn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        this.pushCardOut(4);
      });
    },
    init: function() {
      mc.add(new Hammer.Pan({ threshold: 10, pointers: 0 }));
      mc.add(new Hammer.Swipe()).recognizeWith(mc.get("pan"));
      mc.add(new Hammer.Tap());
      this.initActions(mc, lastItem);
      this.resetElement(
        allCards,
        lastItemIndex,
        `${baseClasses} ${animationClasss}`,
        this.requestElementUpdate
      );
    }
  };
})();
