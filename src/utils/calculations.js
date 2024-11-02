export const calculatePixelDimensions = (widthMm, lengthMm, dpi) => {
  // Convert mm to inches (1 mm = 0.03937 inches)
  const widthInches = widthMm * 0.03937;
  const lengthInches = lengthMm * 0.03937;

  // Calculate pixels (pixels = inches * DPI)
  const widthPixels = Math.round(widthInches * dpi);
  const heightPixels = Math.round(lengthInches * dpi);

  return { width: widthPixels, height: heightPixels };
}; 