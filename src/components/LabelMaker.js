import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Stack,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import TripOriginIcon from '@mui/icons-material/TripOrigin';
import { toPng } from 'html-to-image';
import { calculatePixelDimensions } from '../utils/calculations';
import UploadIcon from '@mui/icons-material/Upload';
import {
  PhillipsDrive,
  FlatDrive,
  HexDrive,
  RobinsonDrive,
  TorxDrive,
} from '../images/drivers';

import {
  FlatHead,
  HexHead,
  PanHead,
  RoundHead,
} from '../images/heads';

import NutIcon from '../images/nut.svg';
import PrintIcon from '@mui/icons-material/Print';

const iconOptions = {
  types: ['None', 'Screws', 'Nuts', 'Washers'],
  sizes: ['M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M10', 'M12', 'M14', 'M16', 'M18', 'M20'],
  heads: ['Flat', 'Hex', 'Pan', 'Round'],
  drives: ['Hex', 'Phillips', 'Slotted', 'Square', 'Torx'],
};

const fonts = [
  'Arial',
  'Arial Black',
  'Calibri',
  'Cambria',
  'Century Gothic',
  'Comic Sans MS',
  'Consolas',
  'Courier New',
  'Franklin Gothic Medium',
  'Futura',
  'Georgia',
  'Gill Sans',
  'Helvetica',
  'Impact',
  'Lucida Console',
  'Lucida Sans',
  'Palatino',
  'Roboto',
  'Segoe UI',
  'Tahoma',
  'Times New Roman',
  'Trebuchet MS',
  'Ubuntu',
  'Verdana',
  'Open Sans'
];

const tapeWidthOptions = [6, 9, 12, 18, 24, 36];

const fontSizeOptions = Array.from({ length: 113 }, (_, i) => i + 8);

// Create mappings for the SVG files
const driveIcons = {
  Phillips: PhillipsDrive,
  Slotted: FlatDrive,
  Hex: HexDrive,
  Square: RobinsonDrive,
  Torx: TorxDrive,
};

const headIcons = {
  Flat: FlatHead,
  Hex: HexHead,
  Pan: PanHead,
  Round: RoundHead,
};

// Add this helper function to generate the autofill text
const generateAutofillText = (icon) => {
  switch (icon.type) {
    case 'Screws':
      return [`${icon.size}×${icon.length}`, `${icon.head} ${icon.drive}`];
    case 'Nuts':
      return [`${icon.size}`, ''];
    case 'Washers':
      return [`${icon.size}`, ''];
    default:
      return ['', ''];
  }
};

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

  // Update handleConfigChange for fitToLabel
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
      if (category === 'text' && field === 'fitToLabel') {
        if (value) {
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
      }

      return newConfig;
    });
  };

  let firstScrew = true;
  let firstNut = true;
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
          iconPromises.push(loadIcon(NutIcon));
        }

        await Promise.all(iconPromises);

        if (firstScrew && config.icon.type === 'Screws') {
          await toPng(previewRef.current, {
            width: dimensions.height,
            height: dimensions.width,
            style: {
              transform: 'scale(1)',
              margin: 0,
              padding: 0,
            },
            cacheBust: true,
            pixelRatio: 1,
            quality: 1,
          });
          firstScrew = false;
        }
        if (firstNut && config.icon.type === 'Nuts') {
          await toPng(previewRef.current, {
            width: dimensions.height,
            height: dimensions.width,
            style: {
              transform: 'scale(1)',
              margin: 0,
              padding: 0,
            },
            cacheBust: true,
            pixelRatio: 1,
            quality: 1,
          });
          firstNut = false;
        }

        // Generate PNG with strict black and white
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

  // Update useEffect for auto-length calculation
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

  // Update the calculateMaxFontSize function
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

  // Add getIconComponent at the start of the component
  const getIconComponent = useCallback((iconType, drive, head, customIcon, showHeadIcon, showDriveIcon, showIcon) => {
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
        return showIcon ? <TripOriginIcon sx={{ width: '100%', height: '100%' }} /> : null;
      case 'Nuts':
        return showIcon ? (
          <Box
            component="img"
            src={NutIcon}
            alt="Nut icon"
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

      {/* Main layout */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Printer Configuration */}
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Typography variant="h6" gutterBottom>
            Printer Settings
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              type="number"
              label="DPI"
              value={config.printer.rawDpi}
              onChange={(e) => handlePrinterChange('dpi', 'rawDpi', e.target.value)}
              inputProps={{ min: 100, max: 600 }}
            />
            <FormControl fullWidth variant="outlined">
              <InputLabel id="tape-width-label">Tape Width (mm)</InputLabel>
              <Select
                labelId="tape-width-label"
                label="Tape Width (mm)"
                value={config.printer.tapeWidthMm}
                onChange={(e) => handlePrinterChange('tapeWidthMm', 'rawTapeWidth', e.target.value)}
              >
                {tapeWidthOptions.map((width) => (
                  <MenuItem key={width} value={width}>
                    {width}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <TextField
                fullWidth
                type="number"
                label="Tape Length (mm)"
                value={config.printer.rawTapeLength}
                onChange={(e) => handlePrinterChange('tapeLengthMm', 'rawTapeLength', e.target.value)}
                slotProps={{ 
                  input: { 
                    min: 8,
                    max: 100,
                    disabled: !config.printer.customLength
                  }
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={Boolean(config.printer.customLength)}
                    onChange={(e) => handlePrinterChange('customLength', 'customLength', e.target.checked)}
                  />
                }
                label="Custom Length"
                sx={{ mt: -1 }}
              />
            </Box>
            <Typography variant="body2" color="textSecondary">
              Output dimensions: {dimensions.width}px × {dimensions.height}px
            </Typography>
          </Stack>
        </Box>

        {/* Icon Configuration */}
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Typography variant="h6" gutterBottom>
            Icon Settings
          </Typography>
          <Stack spacing={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="types-label">Types</InputLabel>
              <Select
                labelId="types-label"
                label="Types"
                value={config.icon.type}
                onChange={(e) => {
                  handleConfigChange('icon', 'type', e.target.value);
                  handleConfigChange('icon', 'autofill', false);
                }}
              >
                {iconOptions.types.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {config.icon.type !== 'None' && (
              <>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="sizes-label">Sizes</InputLabel>
                  <Select
                    labelId="sizes-label"
                    label="Sizes"
                    value={config.icon.size}
                    onChange={(e) => handleConfigChange('icon', 'size', e.target.value)}
                    MenuProps={{
                      anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'left',
                      },
                      transformOrigin: {
                        vertical: 'top',
                        horizontal: 'left',
                      },
                      PaperProps: {
                        style: {
                          maxHeight: 200,
                        },
                      },
                    }}
                  >
                    {iconOptions.sizes.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {config.icon.type === 'Screws' && (
                  <>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="heads-label">Heads</InputLabel>
                      <Select
                        labelId="heads-label"
                        label="Heads"
                        value={config.icon.head}
                        onChange={(e) => handleConfigChange('icon', 'head', e.target.value)}
                      >
                        {iconOptions.heads.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="drives-label">Drives</InputLabel>
                      <Select
                        labelId="drives-label"
                        label="Drives"
                        value={config.icon.drive}
                        onChange={(e) => handleConfigChange('icon', 'drive', e.target.value)}
                      >
                        {iconOptions.drives.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                      type="number"
                      label="Length (mm)"
                      value={config.icon.length}
                      onChange={(e) => handleConfigChange('icon', 'length', e.target.value)}
                    />
                  </>
                )}

                <Button
                  component="label"
                  variant="outlined"
                  fullWidth
                  startIcon={config.icon.customIcon ? null : <UploadIcon />}
                >
                  {config.icon.customIcon ? 'Change Custom Icon' : 'Upload Custom Icon'}
                  <input
                    type="file"
                    hidden
                    accept="image/svg+xml,image/*"
                    onChange={handleCustomIconUpload}
                  />
                </Button>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={config.icon.autofill || false}
                      onChange={(e) => {
                        handleConfigChange('icon', 'autofill', e.target.checked);
                        if (e.target.checked) {
                          const lines = config.icon.type === 'Screws' ? '2' : '1';
                          handleLinesChange(lines);
                          const [line1, line2] = generateAutofillText(config.icon);
                          setConfig(prev => ({
                            ...prev,
                            text: {
                              ...prev.text,
                              lines: config.icon.type === 'Screws' ? 2 : 1,
                              rawLinesInput: lines,
                              lineContents: [
                                {
                                  ...prev.text.lineContents[0],
                                  text: line1,
                                },
                                ...(config.icon.type === 'Screws' ? [{
                                  ...prev.text.lineContents[1],
                                  text: line2,
                                }] : []),
                              ],
                            },
                          }));
                        }
                      }}
                    />
                  }
                  label="Autofill label text with icon info"
                />

                {config.icon.type === 'Screws' ? (
                  <>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={config.icon.showHeadIcon}
                          onChange={(e) => handleConfigChange('icon', 'showHeadIcon', e.target.checked)}
                        />
                      }
                      label="Show head icon"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={config.icon.showDriveIcon}
                          onChange={(e) => handleConfigChange('icon', 'showDriveIcon', e.target.checked)}
                        />
                      }
                      label="Show drive icon"
                    />
                  </>
                ) : config.icon.type !== 'None' && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={config.icon.showIcon}
                        onChange={(e) => handleConfigChange('icon', 'showIcon', e.target.checked)}
                      />
                    }
                    label="Show icon"
                  />
                )}
              </>
            )}
          </Stack>
        </Box>

        {/* Text Configuration */}
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Typography variant="h6" gutterBottom>
            Text Settings
          </Typography>
          <Stack spacing={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="font-label">Font</InputLabel>
              <Select
                labelId="font-label"
                label="Font"
                value={config.text.font}
                onChange={(e) => handleConfigChange('text', 'font', e.target.value)}
                MenuProps={{
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  },
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}
              >
                {fonts.map((font) => (
                  <MenuItem 
                    key={font} 
                    value={font}
                    sx={{ 
                      fontFamily: font,
                      fontSize: '16px',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'action.selected',
                      },
                    }}
                  >
                    {font}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="number"
              label="Number of Lines"
              value={config.text.rawLinesInput}
              onChange={(e) => handleLinesChange(e.target.value)}
              inputProps={{ min: 0, max: 5 }}
            />
            {/* Dynamic Line Input Fields */}
            {Array.from({ length: config.text.lines }, (_, index) => (
              <Box
                key={`line-${index}`}
                sx={{
                  display: 'flex',
                  alignItems: 'stretch',
                  gap: 2,
                }}
              >
                <TextField
                  sx={{ 
                    flex: 1.2,
                    '& .MuiOutlinedInput-root': {
                      height: '100%',
                    },
                  }}
                  label={`Line ${index + 1}`}
                  value={config.text.lineContents[index]?.text || ''}
                  onChange={(e) => handleLineTextChange(index, e.target.value)}
                />
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: 'fit-content',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >

                  <FormControl variant="outlined" disabled={config.text.fitToLabel}>
                    <InputLabel id={`font-size-label-${index}`}>Size</InputLabel>
                    <Select
                      labelId={`font-size-label-${index}`}
                      label="Size"
                      value={config.text.lineContents[index]?.fontSize || 8}
                      onChange={(e) => handleLineStyleChange(
                        index, 
                        'fontSize', 
                        Number(e.target.value),
                        'rawFontSize'
                      )}
                      sx={{ 
                        width: '80px',
                        '& .MuiInputBase-input': {
                          textAlign: 'right',
                          paddingRight: '24px'
                        }
                      }}
                      MenuProps={{
                        PaperProps: {
                          style: { maxHeight: 200 }
                        }
                      }}
                    >
                      {fontSizeOptions.map((size) => (
                        <MenuItem key={size} value={size}>
                          {size}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Box
                    sx={{
                      display: 'flex',
                      height: '100%',
                      borderLeft: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Button
                      variant={config.text.lineContents[index]?.textAlign === 'left' ? "contained" : "text"}
                      onClick={() => handleLineStyleChange(index, 'textAlign', 'left')}
                      sx={{ 
                        minWidth: '40px',
                        borderRadius: 0,
                        px: 2,
                        borderRight: 1,
                        borderColor: 'divider',
                      }}
                    >
                      <FormatAlignLeftIcon />
                    </Button>
                    <Button
                      variant={config.text.lineContents[index]?.textAlign === 'center' ? "contained" : "text"}
                      onClick={() => handleLineStyleChange(index, 'textAlign', 'center')}
                      sx={{ 
                        minWidth: '40px',
                        borderRadius: 0,
                        px: 2,
                        borderRight: 1,
                        borderColor: 'divider',
                      }}
                    >
                      <FormatAlignCenterIcon />
                    </Button>
                    <Button
                      variant={config.text.lineContents[index]?.textAlign === 'right' ? "contained" : "text"}
                      onClick={() => handleLineStyleChange(index, 'textAlign', 'right')}
                      sx={{ 
                        minWidth: '40px',
                        borderRadius: 0,
                        px: 2,
                        borderRight: 1,
                        borderColor: 'divider',
                      }}
                    >
                      <FormatAlignRightIcon />
                    </Button>
                    <Button
                      variant={config.text.lineContents[index]?.bold ? "contained" : "text"}
                      onClick={() => handleLineStyleChange(index, 'bold', !config.text.lineContents[index]?.bold)}
                      sx={{ 
                        minWidth: '40px',
                        borderRadius: 0,
                        px: 2,
                        borderRight: 1,
                        borderColor: 'divider',
                      }}
                    >
                      B
                    </Button>
                    <Button
                      variant={config.text.lineContents[index]?.italic ? "contained" : "text"}
                      onClick={() => handleLineStyleChange(index, 'italic', !config.text.lineContents[index]?.italic)}
                      sx={{ 
                        minWidth: '40px',
                        borderRadius: 0,
                        px: 2,
                        borderRight: 1,
                        borderColor: 'divider',
                      }}
                    >
                      I
                    </Button>
                    <Button
                      variant={config.text.lineContents[index]?.underline ? "contained" : "text"}
                      onClick={() => handleLineStyleChange(index, 'underline', !config.text.lineContents[index]?.underline)}
                      sx={{ 
                        minWidth: '40px',
                        borderRadius: 0,
                        px: 2,
                        borderRight: 1,
                        borderColor: 'divider',
                      }}
                    >
                      U
                    </Button>
                    <Button
                      variant={config.text.lineContents[index]?.strikethrough ? "contained" : "text"}
                      onClick={() => handleLineStyleChange(index, 'strikethrough', !config.text.lineContents[index]?.strikethrough)}
                      sx={{ 
                        minWidth: '40px',
                        borderRadius: 0,
                        borderRight: 0,
                        borderColor: 'divider',
                        px: 2,
                      }}
                    >
                      S
                    </Button>
                  </Box>
                </Box>
              </Box>
            ))}

            <FormControlLabel
              control={
                <Checkbox
                  checked={config.text.fitToLabel || false}
                  onChange={(e) => handleConfigChange('text', 'fitToLabel', e.target.checked)}
                />
              }
              label="Fit to Label"
            />
          </Stack>
        </Box>
      </Box>

      {/* Preview Section */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Label Preview
        </Typography>
        
        {/* Actual size preview */}
        <Box
          ref={previewRef}
          sx={{
            width: dimensions.height,
            height: dimensions.width,
            border: '1px solid #ccc',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            p: 0,
            mb: 3,
            bgcolor: '#f8f8f2',
            '&.export-mode': {
              border: 'none',
              borderRadius: 0,
              bgcolor: '#FFFFFF',
              p: 0,
              m: 0,
              '& *': {  // Target all children elements in export mode
                color: '#000000 !important',
                fill: '#000000 !important',
                stroke: '#000000 !important',
                border: 'none !important',
                borderRadius: '0 !important',
              },
            },
          }}
        >
          {config.icon.type !== 'None' && (
            <Box 
              sx={{ 
                width: dimensions.width,
                height: dimensions.width,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1,
                flexShrink: 0,
                color: '#282a36',
              }} 
            >
              {getIconComponent(
                config.icon.type, 
                config.icon.drive, 
                config.icon.head, 
                config.icon.customIcon,
                config.icon.showHeadIcon,
                config.icon.showDriveIcon,
                config.icon.showIcon
              )}
            </Box>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {config.text.lineContents.map((line, index) => (
              <Typography
                key={index}
                style={{
                  fontFamily: config.text.font,
                  fontSize: `${line.fontSize}px`,
                  fontWeight: line.bold ? 'bold' : 'normal',
                  fontStyle: line.italic ? 'italic' : 'normal',
                  textDecoration: [
                    line.underline && 'underline',
                    line.strikethrough && 'line-through'
                  ].filter(Boolean).join(' '),
                  marginBottom: 0,
                  textAlign: line.textAlign,
                  width: '100%',
                  color: '#282a36',
                  lineHeight: 1,
                }}
              >
                {line.text || `Line ${index + 1}`}
              </Typography>
            ))}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={exportImage}>
            Export as PNG ({dimensions.height}×{dimensions.width})
          </Button>
          <Button 
            variant="contained" 
            onClick={handlePrint}
            startIcon={<PrintIcon />}
          >
            Print Label
          </Button>
        </Box>
      </Box>
    </Stack>
  );
}

export default LabelMaker;

