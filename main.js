import './style.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatedGraph } from './AnimatedGraph';
import Lenis from 'lenis';

const lenis = new Lenis({
  lerp: 0.15
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

gsap.registerPlugin(ScrollTrigger);

class VerticalCardsAnimation {
  constructor({ wrapSelector, cardSelector, graphSelector, imgSelector }) {
    this.wrap = document.querySelector(wrapSelector);
    this.cards = this.wrap.querySelectorAll(cardSelector);
    this.graphs = this.wrap.querySelectorAll(graphSelector);
    this.images = this.wrap.querySelectorAll(imgSelector);
    this.initAnimation();
  }

  initAnimation() {
    this.cards.forEach((card, index) => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: () => `top bottom-=20%`,
          end: () => `top top`,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      const cardInner = card.querySelector('.inner');

      timeline
        .to(cardInner, {
          scale: 1,
          opacity: 1,
          duration: 1.5,
        }, 'start')
        .to(
          this.graphs[index],
          {
            opacity: 1,
            scale: 1,
            duration: 1.5,
          },
          'start'
        )
        .to(
          this.images[index],
          {
            opacity: 1,
            duration: 1.5,
          },
          'start'
        )


      if (index !== this.cards.length - 1) {
        timeline
          .to(
            cardInner,
            {
              scale: 0.3,
              duration: 2,
            }
          )
          .to(
            cardInner,
            {
              opacity: 0.1,
              duration: 1,
            },
            '<'
          )        
          .to(this.graphs[index], {
            opacity: 0,
            scale: 0.8,
            delay: 0.2,
            duration: 1,
          }, 'start+=1.5')
          .to(this.images[index], {
            opacity: 0,
            delay: 0.2,
            duration: 1,
          }, 'start+=1.5');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const selectors = {
    cardsSelector: '.vertical-cards',
    graphSelector: '.animated-graph',
    imgSelector: '.vertical-cards__img',
  };
  const verticalCardsWrap = document.querySelector(selectors.cardsSelector);
  const allAnimatedGraphs = document.querySelectorAll(selectors.graphSelector);

  if (verticalCardsWrap) {
    new VerticalCardsAnimation({
      wrapSelector: selectors.cardsSelector,
      cardSelector: '.card',
      graphSelector: selectors.graphSelector,
      imgSelector: selectors.imgSelector,
    });
  }

  if (allAnimatedGraphs.length) {
    allAnimatedGraphs.forEach((wrap) => {
      const {
        vertical,
        amplitude,
        frequency,
        attenuation,
        speed,
        flip,
        trackOpacity,
      } = wrap.dataset;

      new AnimatedGraph({
        wrap,
        vertical: vertical === 'true',
        amplitude: Number(amplitude ?? 1),
        frequency: Number(frequency ?? 1),
        attenuation: Number(attenuation ?? 2),
        speed: Number(speed ?? 1),
        flip: flip === 'true',
        trackOpacity: trackOpacity === 'true',
      });
    });
  }
});

