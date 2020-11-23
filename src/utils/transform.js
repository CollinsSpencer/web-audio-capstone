// Source:
// https://stackoverflow.com/a/38230545/7577035
// https://stackoverflow.com/questions/38224875/replacing-d3-transform-in-d3-v4/38230545#38230545
export const getTranslation = (transform) => {
  if (!transform) {
    return {
      translateX: 0,
      translateY: 0,
    };
  }
  // Create a dummy g for calculation purposes only. This will never
  // be appended to the DOM and will be discarded once this function
  // returns.
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  // Set the transform attribute to the provided string value.
  g.setAttributeNS(null, 'transform', transform);

  // consolidate the SVGTransformList containing all transformations
  // to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
  // its SVGMatrix.
  const { matrix } = g.transform.baseVal.consolidate();

  // As per definition values e and f are the ones for the translation.
  return {
    translateX: matrix.e,
    translateY: matrix.f,
  };
};

export const getTransformation = (transform) => {
  // Create a dummy g for calculation purposes only. This will never
  // be appended to the DOM and will be discarded once this function
  // returns.
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  // Set the transform attribute to the provided string value.
  g.setAttributeNS(null, 'transform', transform);

  // consolidate the SVGTransformList containing all transformations
  // to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
  // its SVGMatrix.
  const { matrix } = g.transform.baseVal.consolidate();

  // Below calculations are taken and adapted from the private function
  // transform/decompose.js of D3's module d3-interpolate.
  let { a, b, c, d } = matrix;
  const { e, f } = matrix;
  let scaleX;
  let scaleY;
  let skewX;
  if (a && b) {
    scaleX = Math.sqrt(a * a + b * b);
    a /= scaleX;
    b /= scaleX;
  }
  if (a && b && c && d) {
    skewX = a * c + b * d;
    c -= a * skewX;
    d -= b * skewX;
  }
  if (c && d) {
    scaleY = Math.sqrt(c * c + d * d);
    c /= scaleY;
    d /= scaleY;
    skewX /= scaleY;
  }
  if (a * d < b * c) {
    a = -a;
    b = -b;
    skewX = -skewX;
    scaleX = -scaleX;
  }
  return {
    translateX: e,
    translateY: f,
    rotate: (Math.atan2(b, a) * 180) / Math.PI,
    skewX: (Math.atan(skewX) * 180) / Math.PI,
    scaleX,
    scaleY,
  };
};
