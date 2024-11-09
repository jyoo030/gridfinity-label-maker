import { useState, useRef, useEffect, useCallback } from 'react';
import { Stack, Box, Typography } from '@mui/material';
import { toPng } from 'html-to-image';
import { calculatePixelDimensions } from '../utils/calculations';
import IconSettings from './IconSettings';
import PrinterSettings from './PrinterSettings';
import TextSettings from './TextSettings';
import LabelPreview from './LabelPreview';
import { styles } from '../styles/LabelMaker.styles';
import { driveIcons, headIcons, nutIcons, washerIcons } from '../utils/iconMappings';

function LabelMaker() {
  const [config, setConfig] = useState({
    printer: {
      dpi: 180,
      tapeLengthMm: 36,
      tapeHeightMm: 12,
      rawDpi: '180',
      rawTapeLength: '36',
      rawTapeWidth: '12',
      customLength: false,
      margins: {
        left: 2,
        right: 2,
        top: 1,
        bottom: 1,
        rawLeft: '2',
        rawRight: '2',
        rawTop: '1',
        rawBottom: '1',
      },
    },
    icon: {
      type: 'Screws',
      size: 'M3',
      head: 'Flat',
      length: 10,
      drive: 'Phillips',
      customIcon: null,
      showHeadIcon: true,
      showDriveIcon: true,
      showIcon: true,
      nutType: 'Standard',
      washerType: 'Flat',
    },
    text: {
      font: 'Arial',
      lines: 1,
      horizontalAlign: 'left',
      verticalAlign: 'center',
      rawLinesInput: '1',
      lineContents: [{
        text: '',
        fontSize: 12,
        rawFontSize: '12',
        strikethrough: false,
        underline: false,
        bold: false,
        italic: false,
        textAlign: 'left',
      }],
    },
  });

  const previewRef = useRef(null);

  // Calculate dimensions based on printer settings
  const dimensions = calculatePixelDimensions(
    config.printer.tapeHeightMm,
    config.printer.tapeLengthMm,
    config.printer.dpi
  );

  const calculateMaxFontSize = useCallback((lines, length, height, font) => {
    const safeLength = length - (config.printer.margins.left + config.printer.margins.right) * config.printer.dpi / 25.4;
    const safeHeight = height - (config.printer.margins.top + config.printer.margins.bottom) * config.printer.dpi / 25.4;
    
    // Account for icon space in available length
    let availableLength = safeLength;
    if (config.icon.type !== 'None') {
      const iconHeightPixels = config.printer.tapeHeightMm * config.printer.dpi / 25.4;
      if (config.icon.type === 'Screws') {
        if (config.icon.showHeadIcon && config.icon.showDriveIcon) {
          availableLength -= iconHeightPixels / 2;
        } else if (config.icon.showHeadIcon || config.icon.showDriveIcon) {
          availableLength -= iconHeightPixels;
        }
      } else if (config.icon.showIcon) {
        availableLength -= iconHeightPixels;
      }
    }
    
    if (lines.length === 0) return 12;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    let fontSize = 8;
    const maxFontSize = 120;
    const testString = 'AjgqI'; // String containing tall characters to measure max height
    
    while (fontSize < maxFontSize) {
      let maxLineLength = 0;
      let totalHeight = 0;
      
      // First get the max height for this font size using test string
      const fontStyle = `${fontSize}px "${font}"`;
      ctx.font = fontStyle;
      const heightMetrics = ctx.measureText(testString);
      const lineHeight = heightMetrics.actualBoundingBoxAscent + heightMetrics.actualBoundingBoxDescent;
      
      // Check each line
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const text = line.text || `Line ${i + 1}`; // Use placeholder text if no actual text
        
        // Set font properties for length measurement
        const lineFontStyle = `${line.italic ? 'italic ' : ''}${line.bold ? 'bold ' : ''}${fontSize}px "${font}"`;
        ctx.font = lineFontStyle;
        
        // Measure text length
        const metrics = ctx.measureText(text);
        const textLength = metrics.width;
        
        maxLineLength = Math.max(maxLineLength, textLength);
        totalHeight += lineHeight;
      }
      
      // Check if we've exceeded either dimension
      if (maxLineLength >= availableLength || totalHeight >= safeHeight) {
        return Math.max(6, fontSize - 2); // Return previous size, but not smaller than 6px
      }
      
      fontSize += 1;
    }
    
    return Math.min(fontSize, maxFontSize);
  }, [
    config.printer.margins.left,
    config.printer.margins.right,
    config.printer.margins.top,
    config.printer.margins.bottom,
    config.printer.dpi,
    config.printer.tapeHeightMm,
    config.icon.type,
    config.icon.showHeadIcon,
    config.icon.showDriveIcon,
    config.icon.showIcon
  ]);

  const calculateRequiredLength = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let totalLength = config.printer.margins.left + config.printer.margins.right;

    // Calculate icon width if present
    if (config.icon.type !== 'None') {
      if (config.icon.type === 'Screws') {
        if (config.icon.showHeadIcon && config.icon.showDriveIcon) {
          totalLength += config.printer.tapeHeightMm / 2;
        } else if (config.icon.showHeadIcon || config.icon.showDriveIcon) {
          totalLength += config.printer.tapeHeightMm;
        }
      } else if (config.icon.showIcon) {
        totalLength += config.printer.tapeHeightMm;
      }
    }

    // Calculate width needed for text
    let maxTextLength = 0;
    config.text.lineContents.forEach(line => {
      const text = line.text || `Line ${config.text.lineContents.indexOf(line) + 1}`;
      ctx.font = `${line.italic ? 'italic ' : ''}${line.bold ? 'bold ' : ''}${line.fontSize}px "${config.text.font}"`;
      const metrics = ctx.measureText(text);
      maxTextLength = Math.max(maxTextLength, metrics.width);
    });

    // Convert text pixels to mm
    const pixelsPerMm = config.printer.dpi / 25.4;
    const textLengthMm = Math.ceil(maxTextLength / pixelsPerMm);
    
    totalLength += textLengthMm;
    totalLength += 2; 

    return Math.max(totalLength, 8);
  }, [config.icon.type, config.icon.showHeadIcon, config.icon.showDriveIcon, 
      config.icon.showIcon, config.printer.tapeHeightMm, config.printer.dpi, 
      config.text.lineContents, config.text.font, config.printer.margins]);

  // Extract complex expressions for useEffect dependencies
  const textLines = config.text.lineContents.map(line => line.text).join('');
  const textFontSizes = config.text.lineContents.map(line => line.fontSize).join('');
  const textBoldSettings = config.text.lineContents.map(line => line.bold).join('');
  const textItalicSettings = config.text.lineContents.map(line => line.italic).join('');

  // Update handleConfigChange to handle fitToLabel
  const handleConfigChange = (category, field, value) => {
    setConfig(prev => {
      const newConfig = {
        ...prev,
        [category]: {
          ...prev[category],
          [field]: value,
        },
      };

      // If enabling fitToLabel, calculate and set font sizes
      if (category === 'text' && field === 'fitToLabel' && value === true) {
        const availableHeight = dimensions.height;
        const availableLength = dimensions.length;
        
        // Calculate max font size considering all lines together
        const maxSize = calculateMaxFontSize(
          newConfig.text.lineContents,
          availableLength,
          availableHeight,
          newConfig.text.font
        );
        
        // Update all lines to use the same font size
        newConfig.text.lineContents = newConfig.text.lineContents.map(line => ({
          ...line,
          fontSize: maxSize,
          rawFontSize: maxSize.toString(),
        }));
      }

      return newConfig;
    });
  };

  const exportImage = async () => {
    if (previewRef.current) {
      try {
        // Calculate safe area dimensions
        const safeArea = {
          left: (config.printer.margins.left * config.printer.dpi) / 25.4,
          right: (config.printer.margins.right * config.printer.dpi) / 25.4,
          top: (config.printer.margins.top * config.printer.dpi) / 25.4,
          bottom: (config.printer.margins.bottom * config.printer.dpi) / 25.4,
        };

        const safeDimensions = {
          height: dimensions.height - (safeArea.top + safeArea.bottom),
          length: dimensions.length - (safeArea.left + safeArea.right),
        };

        // Add export-mode class before generating image
        previewRef.current.classList.add('export-mode');

        // Wait for icons to be loaded
        const loadIcon = async (src) => {
          if (!src) return null;
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = src;
          });
        };

        // Load all necessary icons
        const iconPromises = [];
        if (config.icon.type === 'Screws') {
          if (config.icon.showHeadIcon) {
            iconPromises.push(loadIcon(headIcons[config.icon.head]));
          }
          if (config.icon.showDriveIcon) {
            iconPromises.push(loadIcon(driveIcons[config.icon.drive]));
          }
        } else if (config.icon.type === 'Nuts') {
          iconPromises.push(loadIcon(nutIcons[config.icon.nutType]));
        }

        await Promise.all(iconPromises);

        const dataUrl = await toPng(previewRef.current, {
          width: safeDimensions.length,
          height: safeDimensions.height,
          style: {
            transform: 'scale(1)',
            margin: 0,
            padding: 0,
            backgroundColor: '#FFFFFF',
          },
          filter: (node) => {
            // Force black color on all elements during export
            if (node instanceof HTMLElement) {
              node.style.color = '#000000';
              node.style.fill = '#000000';
              node.style.stroke = '#000000';
            }
            return true;
          },
          backgroundColor: '#FFFFFF',
          cacheBust: true,
          pixelRatio: 1,
          quality: 1,
          canvasWindow: window,
          imageSmoothingEnabled: false,
        });

        // Remove export-mode class
        previewRef.current.classList.remove('export-mode');

        const link = document.createElement('a');
        link.download = 'label.png';
        link.href = dataUrl;
        link.click();

      } catch (error) {
        previewRef.current.classList.remove('export-mode');
        console.error('Error generating image:', error);
      }
    }
  };

  const handleLineTextChange = (lineIndex, value) => {
    handleLineStyleChange(lineIndex, 'text', value);
  };

  const handleLinesChange = (newLines) => {
    const numLines = newLines === '' ? 0 : parseInt(newLines) || 0;
    setConfig(prev => ({
      ...prev,
      text: {
        ...prev.text,
        lines: numLines,
        rawLinesInput: newLines,
        lineContents: Array(numLines).fill(null).map((_, idx) => 
          prev.text.lineContents[idx] || {
            text: '',
            fontSize: 12,
            rawFontSize: '12',
            strikethrough: false,
            underline: false,
            bold: false,
            italic: false,
            textAlign: 'left',
          }
        ),
      },
    }));
  };

  // Update handlePrinterChange to properly handle margins
  const handlePrinterChange = useCallback((category, field, value, rawField) => {
    setConfig(prev => {
      const newConfig = { ...prev };

      if (category === 'margins') {
        // Handle margin updates
        newConfig.printer = {
          ...prev.printer,
          margins: {
            ...prev.printer.margins,
            [field]: value === '' ? 0 : Number(value),
            [rawField]: value.toString(),
          }
        };
      } else {
        // Handle other printer settings
        newConfig.printer = {
          ...prev.printer,
          [rawField]: value,
          [field]: value === '' ? 0 : Number(value),
      };
      }

      // If we're disabling custom length, immediately calculate and set the required length
      if (field === 'customLength' && value === false) {
        const requiredLength = calculateRequiredLength();
        newConfig.printer.tapeLengthMm = requiredLength;
        newConfig.printer.rawTapeLength = requiredLength.toString();
      }

      return newConfig;
    });
  }, [calculateRequiredLength]);

  const handleLineStyleChange = (lineIndex, field, value, rawField) => {
    setConfig(prev => ({
      ...prev,
      text: {
        ...prev.text,
        lineContents: prev.text.lineContents.map((content, idx) =>
          idx === lineIndex
            ? { 
                ...content, 
                [field]: value,
                ...(rawField && { [rawField]: value.toString() })
              }
            : content
        ),
      },
    }));
  };

  const handleCustomIconUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'image/svg+xml' || file.type.startsWith('image/'))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleConfigChange('icon', 'customIcon', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Update useEffect for font size recalculation
  useEffect(() => {
    if (config.text.fitToLabel) {
      const availableHeight = dimensions.height;
      const availableLength = dimensions.length;
      
      // Calculate max font size considering all lines together
      const maxSize = calculateMaxFontSize(
        config.text.lineContents,
        availableLength,
        availableHeight,
        config.text.font
      );
      
      // Update all lines to use the same font size
      setConfig(prev => ({
        ...prev,
        text: {
          ...prev.text,
          lineContents: prev.text.lineContents.map(line => ({
            ...line,
            fontSize: maxSize,
            rawFontSize: maxSize.toString(),
          })),
        },
      }));
    }
  }, [
    config.text.fitToLabel,
    config.text.lineContents,
    textLines,
    config.text.lines,
    config.text.font,
    dimensions.height, 
    dimensions.length, 
    textBoldSettings,
    textItalicSettings,
    calculateMaxFontSize
  ]);

  useEffect(() => {
    if (!config.printer.customLength) {
      const requiredLength = calculateRequiredLength();
      
      if (Math.abs(requiredLength - config.printer.tapeLengthMm) > 1) {
        handlePrinterChange('printer', 'tapeLengthMm', requiredLength.toString(), 'rawTapeLength');
      }
    }
  }, [
    config.printer.customLength,
    config.printer.tapeLengthMm,
    textLines,
    textFontSizes,
    config.text.font,
    config.icon.type,
    config.icon.showHeadIcon,
    config.icon.showDriveIcon,
    config.icon.showIcon,
    config.printer.margins.left,
    config.printer.margins.right,
    config.printer.margins.top,
    config.printer.margins.bottom,
    config.printer.dpi,
    config.printer.tapeHeightMm,
    calculateRequiredLength,
    handlePrinterChange
  ]);

  const getIconComponent = useCallback((iconType, drive, head, customIcon, showHeadIcon, showDriveIcon, showIcon, nutType, washerType) => {
    if (customIcon) {
      return (
        <Box
          component="img"
          src={customIcon}
          alt="Custom icon"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      );
    }

    switch (iconType) {
      case 'Washers':
        return showIcon ? (
          <Box
            component="img"
            src={washerIcons[washerType]}
            alt={`${washerType} washer icon`}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        ) : null;
      case 'Nuts':
        return showIcon ? (
          <Box
            component="img"
            src={nutIcons[nutType]}
            alt={`${nutType} nut icon`}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        ) : null;
      case 'Screws':
        const driveIcon = driveIcons[drive];
        const headIcon = headIcons[head];
        
        return (
          <Box 
            sx={{ 
              width: '100%', 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 0,
              m: 0,
            }}
          >
            {headIcon && showHeadIcon && (
              <Box
                component="img"
                src={headIcon}
                alt={`${head} head icon`}
                sx={{
                  width: '100%',
                  height: showDriveIcon ? '50%' : '100%',
                  objectFit: 'contain',
                  display: 'block',
                  p: 0,
                  m: 0,
                }}
              />
            )}
            {driveIcon && showDriveIcon && (
              <Box
                component="img"
                src={driveIcon}
                alt={`${drive} drive icon`}
                sx={{
                  width: '100%',
                  height: showHeadIcon ? '50%' : '100%',
                  objectFit: 'contain',
                  display: 'block',
                  p: 0,
                  m: 0,
                }}
              />
            )}
          </Box>
        );
      default:
        return null;
    }
  }, []);

  const handlePrint = useCallback(async () => {
    if (previewRef.current) {
      try {
        // Calculate safe area dimensions
        const safeArea = {
          left: (config.printer.margins.left * config.printer.dpi) / 25.4,
          right: (config.printer.margins.right * config.printer.dpi) / 25.4,
          top: (config.printer.margins.top * config.printer.dpi) / 25.4,
          bottom: (config.printer.margins.bottom * config.printer.dpi) / 25.4,
        };

        const safeDimensions = {
          height: dimensions.height - (safeArea.top + safeArea.bottom),
          length: dimensions.length - (safeArea.left + safeArea.right),
        };

        previewRef.current.classList.add('export-mode');

        // Calculate physical dimensions in mm
        const labelHeightMm = config.printer.tapeHeightMm;
        const labelLengthMm = config.printer.tapeLengthMm;

        // Create an invisible iframe
        const iframe = document.createElement('iframe');
        iframe.style.visibility = 'hidden';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        document.body.appendChild(iframe);

        // Write the print HTML with updated styles
        iframe.contentDocument.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print Label</title>
              <style>
                @page {
                  size: ${labelLengthMm}mm ${labelHeightMm}mm;
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 0;
                  width: ${labelLengthMm}mm;
                  height: ${labelHeightMm}mm;
                  overflow: hidden;
                }
                .print-container {
                  width: ${labelLengthMm}mm;
                  height: ${labelHeightMm}mm;
                  position: relative;
                  background-color: white;
                  transform-origin: top left;
                }
                img {
                  position: absolute;
                  left: ${config.printer.margins.left}mm;
                  top: ${config.printer.margins.top}mm;
                  width: calc(100% - ${config.printer.margins.left + config.printer.margins.right}mm);
                  height: calc(100% - ${config.printer.margins.top + config.printer.margins.bottom}mm);
                  object-fit: contain;
                  display: block;
                }
                @media print {
                  html, body {
                    width: ${labelLengthMm}mm;
                    height: ${labelHeightMm}mm;
                  }
                  .print-container {
                    page-break-inside: avoid;
                    break-inside: avoid;
                  }
                }
              </style>
            </head>
            <body>
              <div class="print-container">
                <img />
              </div>
            </body>
          </html>
        `);

        // Generate the image using safe dimensions
        const dataUrl = await toPng(previewRef.current, {
          width: safeDimensions.length,
          height: safeDimensions.height,
          style: {
            transform: 'scale(1)',
            margin: 0,
            padding: 0,
            backgroundColor: '#FFFFFF',
          },
          filter: (node) => {
            if (node instanceof HTMLElement) {
              node.style.color = '#000000';
              node.style.fill = '#000000';
              node.style.stroke = '#000000';
            }
            return true;
          },
          backgroundColor: '#FFFFFF',
          cacheBust: true,
          pixelRatio: 1,
          quality: 1,
          canvasWindow: window,
          imageSmoothingEnabled: false,
        });

        // Set the image source
        const img = iframe.contentDocument.querySelector('img');
        img.src = dataUrl;

        // Print after image loads
        img.onload = () => {
          iframe.contentDocument.close();
          
          setTimeout(() => {
            iframe.contentWindow.print();
            
            setTimeout(() => {
              document.body.removeChild(iframe);
            }, 1000);
          }, 200);
        };

      } catch (error) {
        console.error('Error printing:', error);
      } finally {
        previewRef.current.classList.remove('export-mode');
      }
    }
  }, [config.printer.tapeHeightMm, config.printer.tapeLengthMm, config.printer.margins, config.printer.dpi, dimensions]);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Gridfinity Label Generator
        </Typography>
      </Box>

      <Box sx={styles.mainContainer}>
        <PrinterSettings 
          config={config}
          handlePrinterChange={handlePrinterChange}
          dimensions={dimensions}
        />

        <IconSettings 
          config={config}
          handleConfigChange={handleConfigChange}
          handleCustomIconUpload={handleCustomIconUpload}
          handleLinesChange={handleLinesChange}
          setConfig={setConfig}
        />

        <TextSettings 
          config={config}
          handleConfigChange={handleConfigChange}
          handleLineTextChange={handleLineTextChange}
          handleLineStyleChange={handleLineStyleChange}
          handleLinesChange={handleLinesChange}
        />
      </Box>

      <LabelPreview 
        previewRef={previewRef}
        config={config}
        dimensions={dimensions}
        getIconComponent={getIconComponent}
        exportImage={exportImage}
        handlePrint={handlePrint}
      />
    </Stack>
  );
}

export default LabelMaker;

