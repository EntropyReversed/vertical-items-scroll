import { createNoise2D } from 'https://unpkg.com/simplex-noise@4.0.2/dist/esm/simplex-noise.js';

export class AnimatedGraph {
  lastTime = 0;
  deltaTime = 0;
  lineResolution = 3;
  isVisible = false;

  constructor({
    wrap,
    vertical,
    amplitude,
    frequency,
    attenuation,
    speed,
    flip,
    trackOpacity,
  }) {
    this.wrap = wrap;
    this.isVertical = vertical;
    this.amplitudeStrength = amplitude;
    this.frequency = frequency;
    this.attenuationPower = attenuation;
    this.speed = speed;
    this.flip = flip;
    this.trackOpacity = trackOpacity;

    this.canvas = document.createElement('canvas');
    this.wrap.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.noise = createNoise2D();

    this.init();
  }

  createGradient(color) {
    const hexColor = this.hexToRgb(color);
    const gradient = this.isVertical
      ? this.ctx.createLinearGradient(0, 0, 0, this.canvas.height)
      : this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);

    gradient.addColorStop(0, `rgba(${hexColor}, 0)`);
    gradient.addColorStop(0.05, `rgba(${hexColor}, 0)`);
    gradient.addColorStop(0.3, `rgba(${hexColor}, 0.2)`);
    gradient.addColorStop(0.5, `rgba(${hexColor}, 1)`);
    gradient.addColorStop(0.7, `rgba(${hexColor}, 0.2)`);
    gradient.addColorStop(0.95, `rgba(${hexColor}, 0)`);
    gradient.addColorStop(1, `rgba(${hexColor}, 0)`);
    return gradient;
  }

  calcLineOffset(value, params, attenuationBase, fullSize) {
    const { amplitude, frequency, noiseOffset, time } = params;
    const noiseValue = this.noise(value * frequency + noiseOffset, time) - 1;
    const attenuation =
      Math.sin((value / attenuationBase) * Math.PI) ** this.attenuationPower;
    return fullSize + noiseValue * amplitude * attenuation;
  }

  updateVisibilityBasedOnOpacity() {
    this.isVisible = parseFloat(window.getComputedStyle(this.wrap).opacity) > 0;
  }

  draw(currentTime) {
    if (this.trackOpacity) {
      this.updateVisibilityBasedOnOpacity();
    }

    if (this.isVisible) {
      this.deltaTime = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.linesParams.forEach((params) => {
        const gradient = this.createGradient(params.color);
        this.ctx.beginPath();

        if (this.isVertical) {
          this.ctx.moveTo(this.canvas.width, 0);
          for (let y = 0; y < this.canvas.height; y += this.lineResolution) {
            const x = this.calcLineOffset(
              y,
              params,
              this.canvas.height,
              this.canvas.width
            );
            this.ctx.lineTo(x, y);
          }
        } else {
          this.ctx.moveTo(0, this.canvas.height);
          for (let x = 0; x < this.canvas.width; x += this.lineResolution) {
            const y = this.calcLineOffset(
              x,
              params,
              this.canvas.width,
              this.canvas.height
            );
            this.ctx.lineTo(x, y);
          }
        }
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 1.5 * this.ratio;
        this.ctx.stroke();
        params.time +=
          this.deltaTime * 0.05 * (this.speed + Math.random() * 0.5);
      });
    }

    requestAnimationFrame(this.draw.bind(this));
  }

  hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  }

  setUpSize() {
    this.scaleCanvas(this.wrap.offsetWidth, this.wrap.offsetHeight);

    const resizeObserver = new ResizeObserver(() => {
      this.scaleCanvas(this.wrap.offsetWidth, this.wrap.offsetHeight);
      this.updateAmplitude(
        this.isVertical
          ? this.canvas.width * 0.5 * this.amplitudeStrength
          : this.canvas.height * 0.5 * this.amplitudeStrength
      );
    });

    resizeObserver.observe(this.wrap);
  }

  scaleCanvas(width, height) {
    if (typeof window === undefined) return null;
    this.ratio = Math.max(1.5, window.devicePixelRatio);
    this.canvas.width = width * this.ratio;
    this.canvas.height = height * this.ratio;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
  }

  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.isVisible = entry.isIntersecting;
      });
    }, options);

    observer.observe(this.wrap);
  }

  updateAmplitude(amp) {
    this.linesParams.forEach((param) => (param.amplitude = amp));
  }

  spreadColors(colors, finalLength) {
    if (colors.length === 4 && finalLength === 6) {
      return [colors[0], colors[0], colors[1], colors[1], colors[2], colors[3]];
    }

    const result = [];
    const repetitions = Math.ceil(finalLength / colors.length);

    let colorIndex = 0;
    for (let i = 0; i < finalLength; i++) {
      if (i % repetitions === 0 && i !== 0) {
        colorIndex++;
      }
      result.push(colors[colorIndex % colors.length]);
    }

    return result;
  }

  nameToHex(colorName) {
    this.ctx.fillStyle = colorName;
    return this.ctx.fillStyle;
  }

  setUpLines() {
    const defaultColor = this.nameToHex('#39EED8');
    const { colorOne, colorTwo, colorThree, colorFour } = this.wrap.dataset;

    const formatedColors = [colorOne, colorTwo, colorThree, colorFour]
      .filter(Boolean)
      .map((color) => this.nameToHex(color));

    if (formatedColors.length === 0) {
      formatedColors.push(defaultColor);
    }

    this.linesParams = this.spreadColors(formatedColors, 6).map((color) => ({
      color,
      amplitude: 1,
      frequency: (0.01 * this.frequency) / this.ratio + Math.random() * 0.001,
      noiseOffset: Math.random() * 1000,
      time: 0,
    }));

    if (this.flip) {
      this.canvas.style.transform = `scale${this.isVertical ? 'X' : 'Y'}(-1)`;
    }
  }

  init() {
    this.setUpSize();
    this.setUpLines();
    this.setupIntersectionObserver();
    if (this.trackOpacity) {
      this.updateVisibilityBasedOnOpacity();
    }
    this.draw(0);
  }
}
