const graphics = {};

graphics.drawPoint = (ctx, loc, color = 'black', size = 8) => {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(...loc, size / 2, 0, Math.PI * 2);
  ctx.fill();
}

graphics.drawText = (ctx, {text, loc, align = 'center', vAlign = 'middle', size = 10, color = 'black'}) => {
  ctx.textAlign = align;
  ctx.textBaseline = vAlign;
  ctx.font = 'bold ' + size + 'px Courier';
  ctx.fillStyle = color;
  ctx.fillText(text, ...loc);
}

graphics.generateImages = (styles, size = 20) => {
  let g = (obj) => {
    const canvas = document.createElement('canvas');
    canvas.width = size + 10;
    canvas.height = size + 10;

    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = size + 'px Courier';

    const colorHueMap = {
      red: 0,
      yellow: 60,
      green: 120,
      cyan: 180,
      blue: 240,
      magenta: 300
    }

    const hue = -45 + colorHueMap[obj.color];
    if (!isNaN(hue)) {
      ctx.filter = `
        brightness(2)
        contrast(0.3)
        sepia(1)
        brightness(0.7)
        hue-rotate(${hue}deg)
        saturate(3)
        contrast(3)
      `
    } else {
      ctx.filter = 'grayscale(1)'
    }

    ctx.fillText(obj.text, canvas.width / 2, canvas.height / 2);

    obj['image'] = new Image();
    obj['image'].src = canvas.toDataURL();
  }

  g(styles.basic);
  g(styles.sport);
}

graphics.drawImage = (ctx, image, loc) => {
  ctx.beginPath();
  ctx.drawImage(image, loc[0] - image.width / 2, loc[1] - image.height / 2, image.width, image.height);
  ctx.fill();
}