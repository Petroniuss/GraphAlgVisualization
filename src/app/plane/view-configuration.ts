// Module reponsible for scaling elements.

export const width = 700;
export const height = 324;

export const nodeRadius = 4;
export const nodeRadiusOnFocus = 9;
export const collisionRadius = nodeRadius;

export function adjustX(x: number): number {
  return adjust(x, nodeRadius, width - nodeRadius);
}

export function adjustY(y: number): number {
  return adjust(y, nodeRadius, height - nodeRadius);
}

function adjust(
  point: number,
  lowerBoundary: number,
  upperBoundary: number
): number {
  return Math.min(upperBoundary, Math.max(lowerBoundary, point));
}
