class Chart {
  constructor(container, samples, options, onClick = null) {
    this.samples = samples;
    
    this.axesLabels = options.axesLabels;
    this.styles = options.styles;
    this.icon = options.icon;
    this.onClick = onClick;
    
    this.canvas = document.createElement('canvas');
    this.canvas.width = options.size;
    this.canvas.height = options.size;
    this.canvas.style = 'background-color: white;';
    container.appendChild(this.canvas);
    
    this.ctx = this.canvas.getContext('2d');
    
    this.margin = options.size * 0.11;
    this.transparency = options.transparency || 1;

    this.dataTrans = {
      offset: [0, 0],
      scale: 1
    };

    this.dragInfo = {
      start: [0, 0],
      end: [0, 0],
      offset: [0, 0],
      dragging: false
    }

    this.hoveredSample = null;
    this.selectedSample = null;
    
    this.pixelBounds = this.#getPixelBounds();
    this.dataBounds = this.#getDataBounds();
    this.defaultDataBounds = this.#getDataBounds();
    
    this.#draw();

    this.#addEventListeners();
  }

  
  #addEventListeners() {
    // dragging event listeners
    this.canvas.onmousedown = (ev) => {
      const dataLoc = this.#getMouse(ev, true);
      this.dragInfo.start = dataLoc;
      this.dragInfo.dragging = true;
      this.dragInfo.end = [0, 0];
      this.dragInfo.offset = [0, 0];
    }

    this.canvas.onmousemove = (ev) => {
      if (this.dragInfo.dragging) {
        const dataLoc = this.#getMouse(ev, true);
        this.dragInfo.end = dataLoc;
        this.dragInfo.offset = math.scale(math.subtract(this.dragInfo.start, this.dragInfo.end), this.dataTrans.scale**2);
        const newOffset = math.add(this.dataTrans.offset, this.dragInfo.offset);

        this.#updateDataBounds(newOffset, this.dataTrans.scale);
        this.#draw();
      }

      const pLoc = this.#getMouse(ev);
      const pPoints = this.samples.map((s) => {
        return math.remapPoint(this.dataBounds, this.pixelBounds, s.point);
      });

      const index = math.getNearest(pLoc, pPoints);
      const nearest = this.samples[index];
      const dist = math.distance(pPoints[index], pLoc);
      if (dist < this.margin / 2) {
        this.hoveredSample = nearest;
      } else {
        this.hoveredSample = null;
      }

      this.#draw();
    }

    this.canvas.onmouseup = () => {
      this.dataTrans.offset = math.add(this.dataTrans.offset, this.dragInfo.offset);
      this.dragInfo.dragging = false;
    }

    // zooming event listeners
    this.canvas.onwheel = (ev) => {
      const dir = Math.sign(ev.deltaY);
      const step = 0.05;
      this.dataTrans.scale += (dir*step);
      this.dataTrans.scale = Math.max(step, Math.min(2, this.dataTrans.scale));

      this.#updateDataBounds(this.dataTrans.offset, this.dataTrans.scale);

      this.#draw();
      ev.preventDefault();
    }

    this.canvas.onclick = () => {
      if (!math.equals(this.dragInfo.offset, [0,0])) {
        return;
      }
      if (this.hoveredSample) {
        if (this.selectedSample == this.hoveredSample) {
          this.selectSample = null;
        } else {
          this.selectedSample = this.hoveredSample;
        }
      } else {
        this.selectSample = null;
      }

      if (this.onClick) {
        this.onClick(this.selectedSample);
      }
      this.#draw();
    }
  };

  #updateDataBounds(offset, scale) {
    this.dataBounds.left = this.defaultDataBounds.left + offset[0];
    this.dataBounds.right = this.defaultDataBounds.right + offset[0];
    this.dataBounds.top = this.defaultDataBounds.top + offset[1];
    this.dataBounds.bottom = this.defaultDataBounds.bottom + offset[1];

    const center = [
      (this.dataBounds.left + this.dataBounds.right) / 2,
      (this.dataBounds.top + this.dataBounds.bottom) / 2,
    ]

    this.dataBounds.left = math.lerp(center[0], this.dataBounds.left, scale**2);
    this.dataBounds.right = math.lerp(center[0], this.dataBounds.right, scale**2);
    this.dataBounds.top = math.lerp(center[1], this.dataBounds.top, scale**2);
    this.dataBounds.bottom = math.lerp(center[1], this.dataBounds.bottom, scale**2);
  }

  #getMouse = (ev, dataSpace = false) => {
    const rect = this.canvas.getBoundingClientRect();
    const pixelLoc = [
      ev.clientX - rect.left,
      ev.clientY - rect.top
    ];

    if (dataSpace) {
      const dataLoc = math.remapPoint(this.pixelBounds, this.defaultDataBounds, pixelLoc);
      return dataLoc;
    }

    return pixelLoc;
  }

  #getPixelBounds() {
    const bounds = {
      left: this.margin,
      right: this.canvas.width - this.margin,
      top: this.margin,
      bottom: this.canvas.height - this.margin,
    }
    
    return bounds;
  }

  #getDataBounds() {
    const x = this.samples.map((s) => { return s.point[0]});
    const y = this.samples.map((s) => { return s.point[1]});
    const minX = Math.min(...x);
    const maxX = Math.max(...x);
    const minY = Math.min(...y);
    const maxY = Math.max(...y);
  
      const bounds = {
        left: minX,
        right: maxX,
        top: maxY,
        bottom: minY
      }
  
      return bounds;
  }
  
  #draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.globalAlpha = this.transparency;
    this.#drawSamples(this.samples);
    
    this.globalAlpha = 1;

    if (this.hoveredSample) {
      this.#emphasizeSample(this.hoveredSample);
    }

    if (this.selectedSample) {
      this.#emphasizeSample(this.selectedSample, 'yellow');
    }

    this.#drawAxes();
  }
  
  #emphasizeSample(sample, color = 'white') {
    const pLoc = math.remapPoint(this.dataBounds, this.pixelBounds, sample.point);

    const grd = this.ctx.createRadialGradient(...pLoc, 0, ...pLoc, this.margin);
    grd.addColorStop(0, color);
    grd.addColorStop(1, 'rgba(255, 255, 255, 0)');
    graphics.drawPoint(this.ctx, pLoc, grd, this.margin*2);
    this.#drawSamples([sample]);
  }

  #drawSamples(samples) {
    for (const sample of samples) {
      const {point, label} = sample;
      const pixelLoc = math.remapPoint(this.dataBounds, this.pixelBounds, point);
      graphics.drawPoint(this.ctx, pixelLoc, this.styles[label]);

      switch(this.icon) {
        case 'image':
          graphics.drawImage(this.ctx, this.styles[label].image, pixelLoc);
          break;
        case 'text':
          graphics.drawText(this.ctx, {
            text: this.styles[label].text,
            loc: pixelLoc,
            size: 20
          });
          break;
        default:
          graphics.drawPoint(this.ctx, pixelLoc, this.styles[label].color);
          break;
      }
    }
  }

  #drawAxes() {
    const {left, right, top, bottom} = this.pixelBounds;

    this.ctx.clearRect(0, 0, this.canvas.width, this.margin);
    this.ctx.clearRect(0, 0, this.margin, this.margin.height);
    this.ctx.clearRect(this.canvas.width - this.margin, 0, this.margin, this.canvas.height);
    this.ctx.clearRect(0, this.canvas.height - this.margin, this.canvas.width, this.margin);

    graphics.drawText(this.ctx, {
      text: this.axesLabels[0],
      loc: [this.canvas.width / 2, bottom + (this.margin / 2)],
      size: this.margin * 0.6,
    });

    this.ctx.save();
    this.ctx.translate(left - (this.margin / 2), this.canvas.height / 2);
    this.ctx.rotate(- Math.PI / 2);
    graphics.drawText(this.ctx, {
      text: this.axesLabels[1],
      loc: [0, 0],
      size: this.margin * 0.6
    });

    this.ctx.restore();

    this.ctx.beginPath();
    this.ctx.moveTo(left, top);
    this.ctx.lineTo(left, bottom);
    this.ctx.lineTo(right, bottom);
    this.ctx.setLineDash([5, 4]);
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = 'lightgray';
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    const dataMin = math.remapPoint(this.pixelBounds, this.dataBounds, [left, bottom]);

    graphics.drawText(this.ctx, {
      text: math.formatNumber(dataMin[0], 2),
      loc: [left, bottom],
      size: this.margin * 0.3,
      align: 'left',
      vAlign: 'top'
    });

    this.ctx.save();
    this.ctx.translate(left, bottom);
    this.ctx.rotate(-Math.PI / 2);
    graphics.drawText(this.ctx, {
      text: math.formatNumber(dataMin[1], 2),
      loc: [0, 0],
      size: this.margin * 0.3,
      align: 'left',
      vAlign: 'bottom'
    });
    this.ctx.restore();

    const dataMax = math.remapPoint(this.pixelBounds, this.dataBounds, [right, top]);

    graphics.drawText(this.ctx, {
      text: math.formatNumber(dataMax[0], 2),
      loc: [right, bottom],
      size: this.margin * 0.3,
      align: 'right',
      vAlign: 'top'
    });

    this.ctx.save();
    this.ctx.translate(left, top);
    this.ctx.rotate(-Math.PI / 2);
    graphics.drawText(this.ctx, {
      text: math.formatNumber(dataMax[1], 2),
      loc: [0, 0],
      size: this.margin * 0.3,
      align: 'right',
      vAlign: 'bottom'
    });
    this.ctx.restore();
  }

  selectSampleFunc(sample) {
    this.selectedSample = sample;
    this.#draw();
  }
}