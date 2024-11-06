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
      tapeWidthMm: 12,
      rawDpi: '180',
      rawTapeLength: '36',
      rawTapeWidth: '12',
      customLength: false,
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
    config.printer.tapeWidthMm,
    config.printer.tapeLengthMm,
    config.printer.dpi
  );

  // Wrap calculateRequiredLength in useCallback
  const calculateRequiredLength = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let totalWidth = 0;

    // Calculate icon width if present
    if (config.icon.type !== 'None' && 
        ((config.icon.type === 'Screws' && (config.icon.showHeadIcon || config.icon.showDriveIcon)) || 
         (config.icon.type !== 'Screws' && config.icon.showIcon))) {
      totalWidth += config.printer.tapeWidthMm;
    }

    // Calculate width needed for text
    let maxTextWidth = 0;
    config.text.lineContents.forEach(line => {
      const text = line.text || `Line ${config.text.lineContents.indexOf(line) + 1}`;
      ctx.font = `${line.italic ? 'italic ' : ''}${line.bold ? 'bold ' : ''}${line.fontSize}px "${config.text.font}"`;
      const metrics = ctx.measureText(text);
      maxTextWidth = Math.max(maxTextWidth, metrics.width);
    });

    // Convert text pixels to mm
    const pixelsPerMm = config.printer.dpi / 25.4;
    const textWidthMm = Math.ceil(maxTextWidth / pixelsPerMm);
    
    totalWidth += textWidthMm;
    totalWidth += 2;

    return Math.max(totalWidth, 8);
  }, [config.icon.type, config.icon.showHeadIcon, config.icon.showDriveIcon, 
      config.icon.showIcon, config.printer.tapeWidthMm, config.printer.dpi, 
      config.text.lineContents, config.text.font]);

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
        const availableHeight = dimensions.width; // Full height available
        const availableWidth = dimensions.height; // Full width available
        
        // Calculate max font size considering all lines together
        const maxSize = calculateMaxFontSize(
          newConfig.text.lineContents,
          availableWidth,
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
          width: dimensions.height,
          height: dimensions.width,
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

  // Wrap handlePrinterChange in useCallback
  const handlePrinterChange = useCallback((field, rawField, value) => {
    setConfig(prev => {
      const newConfig = {
        ...prev,
        printer: {
          ...prev.printer,
          [rawField]: value,
          [field]: value === '' ? 0 : Number(value),
        },
      };

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
      const availableHeight = dimensions.width; // Full height available
      const availableWidth = dimensions.height; // Full width available
      
      // Calculate max font size considering all lines together
      const maxSize = calculateMaxFontSize(
        config.text.lineContents,
        availableWidth,
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
    textLines,
    config.text.lines,
    config.text.font,
    dimensions.width,
    dimensions.height,
    textBoldSettings,
    textItalicSettings
  ]);

  useEffect(() => {
    if (!config.printer.customLength) {
      const requiredLength = calculateRequiredLength();
      if (Math.abs(requiredLength - config.printer.tapeLengthMm) > 1) {
        handlePrinterChange('tapeLengthMm', 'rawTapeLength', requiredLength.toString());
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
    calculateRequiredLength,
    handlePrinterChange
  ]);

  const calculateMaxFontSize = (lines, width, height, font) => {
    if (lines.length === 0) return 12; // Default size for no text
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    let fontSize = 8;
    const maxFontSize = 120;
    const testString = 'AjgqI'; // String containing tall characters to measure max height
    
    while (fontSize < maxFontSize) {
      let maxLineWidth = 0;
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
        
        // Set font properties for width measurement
        const lineFontStyle = `${line.italic ? 'italic ' : ''}${line.bold ? 'bold ' : ''}${fontSize}px "${font}"`;
        ctx.font = lineFontStyle;
        
        // Measure text width
        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        
        maxLineWidth = Math.max(maxLineWidth, textWidth);
        totalHeight += lineHeight;
      }
      
      // Check if we've exceeded either dimension
      if (maxLineWidth >= width || totalHeight >= height) {
        return Math.max(6, fontSize - 2); // Return previous size, but not smaller than 6px
      }
      
      fontSize += 1;
    }
    
    return Math.min(fontSize, maxFontSize);
  };

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
        // Add export-mode class before generating image
        previewRef.current.classList.add('export-mode');

        // Calculate physical dimensions in mm
        const labelWidthMm = config.printer.tapeWidthMm;
        const labelLengthMm = config.printer.tapeLengthMm;

        // Create an invisible iframe
        const iframe = document.createElement('iframe');
        iframe.style.visibility = 'hidden';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        document.body.appendChild(iframe);

        // Write the print HTML with updated styles
        iframe.contentDocument.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print Label</title>
              <style>
                @page {
                  size: ${labelLengthMm}mm ${labelWidthMm}mm;
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 0;
                  width: ${labelLengthMm}mm;
                  height: ${labelWidthMm}mm;
                  overflow: hidden;
                }
                .print-container {
                  width: ${labelLengthMm}mm;
                  height: ${labelWidthMm}mm;
                  position: relative;
                  background-color: white;
                  transform-origin: top left;
                }
                img {
                  width: 100%;
                  height: 100%;
                  object-fit: contain;
                  display: block;
                }
                @media print {
                  html, body {
                    width: ${labelLengthMm}mm;
                    height: ${labelWidthMm}mm;
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

        // Generate the image
        const dataUrl = await toPng(previewRef.current, {
          width: dimensions.height,
          height: dimensions.width,
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
          
          // Short delay to ensure styles are applied
          setTimeout(() => {
            iframe.contentWindow.print();
            
            // Remove iframe after printing
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
  }, [config.printer.tapeWidthMm, config.printer.tapeLengthMm, dimensions.height, dimensions.width]);

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

