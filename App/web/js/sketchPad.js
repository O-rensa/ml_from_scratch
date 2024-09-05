class SketchPad{
  constructor(container, size=400) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = size;
    this.canvas.height = size;
    this.canvas.style = `
      background-color:white;
      box-shadow: 0px 0px 10px 2px black
    `;
    container.appendChild(this.canvas);
    
    const linebreak = document.createElement('br');
    container.appendChild(linebreak);
    
    this.undoBtn = document.createElement('button');
    this.undoBtn.innerHTML = 'UNDO';
    this.undoBtn.disabled = true;
    container.appendChild(this.undoBtn);
    
    this.ctx = this.canvas.getContext('2d');
    this.paths = [];
    this.isDrawing = false;
    
    this.reset();

    this._addEventListeners();
  }
  
  _addEventListeners() {
    // mouse event listeners
    this.canvas.onmousedown = (ev) => {
      const mouse = this._getMouse(ev);
      this.paths.push([mouse]);
      this.isDrawing = true;
    }; 
    
    this.canvas.onmousemove = (ev) => {
      if (this.isDrawing) {
        const mouse = this._getMouse(ev);
        const lastPath = this.paths[this.paths.length - 1];
        lastPath.push(mouse);
        this._redraw();
      }
    };
    
    document.onmouseup = () => {
      this.isDrawing = false;
    }
    
    // mobile event listeners
    this.canvas.ontouchstart = (ev) => {
      const location = ev.touches[0];
      this.canvas.onmousedown(location);
    }
    
    this.canvas.ontouchmove = (ev) => {
      const location = ev.touches[0];
      this.canvas.onmousemove(location);
    }
    
    document.ontouchend = () => {
      this.canvas.onmouseup();
    }
    
    // button event listeners
    this.undoBtn.onclick = () => {
      if (undefined != this.paths) this.paths.pop();
      this._redraw();
    }
  } 
  
  _getMouse = (ev) => {
    const rect = this.canvas.getBoundingClientRect();
    return [
      Math.round(ev.clientX - rect.left),
      Math.round(ev.clientY - rect.top),
    ];
  }
  
  _redraw() {
    this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
    if (this.paths.length > 0) {
      this.undoBtn.disabled = false;
      draw.paths(this.ctx, this.paths);
    } else {
      this.undoBtn.disabled = true;
    }
  }

  reset() {
    this.paths = [];
    this.isDrawing = false;
    this._redraw();
  }
}