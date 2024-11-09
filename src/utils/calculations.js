export const calculatePixelDimensions = (heightMm, lengthMm, dpi) => {
  // Convert mm to inches (1 mm = 0.03937 inches)
  const heightInches = heightMm * 0.03937;
  const lengthInches = lengthMm * 0.03937;

  // Calculate pixels (pixels = inches * DPI)
  const heightPixels = Math.round(heightInches * dpi);
  const lengthPixels = Math.round(lengthInches * dpi);

  return { height: heightPixels, length: lengthPixels };
}; 