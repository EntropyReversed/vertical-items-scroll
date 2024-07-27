import './style.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';



const lenis = new Lenis();

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

gsap.registerPlugin(ScrollTrigger);

class VerticalCardsAnimation {
  constructor(selector) {
    this.cards = document.querySelectorAll(selector);
    this.initAnimation();
  }

  initAnimation() {
    this.cards.forEach((card, index) => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: () => `top-=${card.offsetHeight * 2} center`,
          end: () =>
            `bottom+=${card.offsetHeight * 1} center-=${card.offsetHeight * 3}`,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
      const cardInner = card.querySelector('.inner');

      timeline.to(cardInner, {
        scale: 1,
        opacity: 1,
        duration: 1.5,
      });

      if (index !== this.cards.length - 1) {
        timeline
          .to(cardInner, {
            scale: 0.3,
            duration: 2,
          })
          .to(
            cardInner,
            {
              opacity: 0.1,
              duration: 1,
            },
            '<'
          );
      } else {
        timeline.to({}, { duration: 2 });
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const verticalCardsWrap = document.querySelector('.cards');

  if (verticalCardsWrap) {
    new VerticalCardsAnimation('.card');
  }
});
