const math = {};

// compare 2 arrays
math.equals = (p1, p2) => {
  return p1[0] == p2[0] && p1[1] == p2[1];
}

// linear interpolation
math.lerp = (a, b, t) => {
  return a + ((b - a) * t);
}

// inverse linear interpolation
math.invLerp = (a, b, v)  => {
  return (v - a) / (b - a);
}

// remap
math.remap = (oldA, oldB, newA, newB, v) => {
  return math.lerp(newA, newB, math.invLerp(oldA, oldB, v));
}

// remap point 
math.remapPoint = (oldBounds, newBounds, point) => {
  return [
    math.remap(oldBounds.left, oldBounds.right,newBounds.left, newBounds.right, point[0]),
    math.remap(oldBounds.top, oldBounds.bottom,newBounds.top, newBounds.bottom, point[1])
  ]
}

// format number
math.formatNumber = (n, dec = 0) => {
  return n.toFixed(dec);
}

// map add 2 points
math.add = (p1, p2) => {
  return [
    p1[0] + p2 [0],
    p1[1] + p2 [1],
  ]
}

// map subtract 2 points
math.subtract = (p1, p2) => {
  return [
    p1[0] - p2 [0],
    p1[1] - p2 [1],
  ]
}

// scale
math.scale = (p, scaler) => {
  return [
    p[0] * scaler,
    p[1] * scaler,
  ]
}

// distance
math.distance = (p1, p2) => {
  return Math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2);
}

// nearest location
math.getNearest = (loc, points) => {
  let minDist = Number.MAX_SAFE_INTEGER;
  let nearestIndex = 0;

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const d = math.distance(loc, point);

    if (d < minDist) {
      minDist = d;
      nearestIndex = i;
    }
  }

  return nearestIndex;
}