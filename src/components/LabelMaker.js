import { useState, useRef } from 'react';
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
  SlottedDrive,
  HexDrive,
  SquareDrive,
  TorxDrive,
} from '../images/drivers';

import {
  FlatHead,
  HexHead,
  ButtonHead,
  PanHead,
  RoundHead,
} from '../images/heads';

import NutIcon from '../images/nut.svg';

const iconOptions = {
  types: ['None', 'Screws', 'Nuts', 'Washers'],
  sizes: ['M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M10', 'M12', 'M14', 'M16', 'M18', 'M20'],
  heads: ['Flat', 'Hex', 'Button', 'Pan', 'Round'],
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

const fontSizeOptions = [6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];

// Create mappings for the SVG files
const driveIcons = {
  Phillips: PhillipsDrive,
  Slotted: SlottedDrive,
  Hex: HexDrive,
  Square: SquareDrive,
  Torx: TorxDrive,
};

const headIcons = {
  Flat: FlatHead,
  Hex: HexHead,
  Button: ButtonHead,
  Pan: PanHead,
  Round: RoundHead,
};

// Update the getIconComponent function
const getIconComponent = (iconType, drive, head, customIcon, showHeadIcon, showDriveIcon, showIcon) => {
  if (customIcon) {
    return showIcon ? (
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
    ) : null;
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
        <Stack direction="row" spacing={1} sx={{ width: '100%', height: '100%' }}>
          {headIcon && showHeadIcon && (
            <Box
              component="img"
              src={headIcon}
              alt={`${head} head icon`}
              sx={{
                width: showDriveIcon ? '50%' : '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          )}
          {driveIcon && showDriveIcon && (
            <Box
              component="img"
              src={driveIcon}
              alt={`${drive} drive icon`}
              sx={{
                width: showHeadIcon ? '50%' : '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          )}
        </Stack>
      );
    default:
      return null;
  }
};

// Add this helper function to generate the autofill text
const generateAutofillText = (icon) => {
  switch (icon.type) {
    case 'Screws':
      return [`${icon.size} × ${icon.length}mm`, `${icon.head} Head ${icon.drive}`];
    case 'Nuts':
      return [`${icon.size} Nut`, ''];
    case 'Washers':
      return [`${icon.size} Washer`, ''];
    default:
      return ['', ''];
  }
};

function LabelMaker() {
  const [config, setConfig] = useState({
    printer: {
      dpi: 200,
      tapeLengthMm: 36,
      tapeWidthMm: 12,
      rawDpi: '200',
      rawTapeLength: '36',
      rawTapeWidth: '12',
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

  const handleConfigChange = (category, field, value) => {
    setConfig(prev => {
      const newConfig = {
        ...prev,
        [category]: {
          ...prev[category],
          [field]: value,
        },
      };

      // If changing icon properties and autofill is enabled, update the text
      if (category === 'icon' && prev.icon.autofill && prev.icon.type === 'Screws') {
        const [line1, line2] = generateAutofillText(newConfig.icon);
        return {
          ...newConfig,
          text: {
            ...newConfig.text,
            lines: 2,
            rawLinesInput: '2',
            lineContents: [
              {
                ...newConfig.text.lineContents[0],
                text: line1,
              },
              {
                ...newConfig.text.lineContents[1],
                text: line2,
              },
            ],
          },
        };
      }

      return newConfig;
    });
  };

  const exportImage = async () => {
    if (previewRef.current) {
      try {
        // Add export-mode class before generating image
        previewRef.current.classList.add('export-mode');

        // Create an array of promises for all possible icons that need to be loaded
        const iconPromises = [];

        // Helper function to create image load promise
        const createImageLoadPromise = (src) => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";  // Add this to handle CORS
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
          });
        };

        // Add custom icon if present
        if (config.icon.customIcon) {
          iconPromises.push(createImageLoadPromise(config.icon.customIcon));
        }

        // Add nut icon if needed
        if (config.icon.type === 'Nuts' && config.icon.showIcon) {
          iconPromises.push(createImageLoadPromise(NutIcon));
        }

        // Add screw icons if needed
        if (config.icon.type === 'Screws') {
          if (config.icon.showHeadIcon) {
            const headIcon = headIcons[config.icon.head];
            iconPromises.push(createImageLoadPromise(headIcon));
          }
          if (config.icon.showDriveIcon) {
            const driveIcon = driveIcons[config.icon.drive];
            iconPromises.push(createImageLoadPromise(driveIcon));
          }
        }

        // Wait for all icons to load
        await Promise.all(iconPromises);

        // Add a small delay to ensure DOM updates are complete
        await new Promise(resolve => setTimeout(resolve, 100));

        // Generate the PNG
        const dataUrl = await toPng(previewRef.current, {
          width: dimensions.height,
          height: dimensions.width,
          style: {
            transform: 'scale(1)',
            margin: 0,
            padding: 0,
            backgroundColor: '#FFFFFF',
          },
          backgroundColor: '#FFFFFF',
          cacheBust: true,
          pixelRatio: 1,
          quality: 1,
          includeQueryParams: true,
          skipAutoScale: true,
          canvasWidth: dimensions.height,
          canvasHeight: dimensions.width,
        });

        // Remove export-mode class after generating image
        previewRef.current.classList.remove('export-mode');

        const link = document.createElement('a');
        link.download = 'label.png';
        link.href = dataUrl;
        link.click();

      } catch (error) {
        // Remove export-mode class in case of error
        previewRef.current.classList.remove('export-mode');
        console.error('Error generating image:', error);
        // You might want to show an error message to the user here
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

  const handlePrinterChange = (field, rawField, value) => {
    setConfig(prev => ({
      ...prev,
      printer: {
        ...prev.printer,
        [rawField]: value,
        [field]: value === '' ? 0 : Number(value),
      },
    }));
  };

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

  // Calculate dimensions based on printer settings
  const dimensions = calculatePixelDimensions(
    config.printer.tapeWidthMm,
    config.printer.tapeLengthMm,
    config.printer.dpi
  );

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
            <TextField
              fullWidth
              type="number"
              label="Tape Length (mm)"
              value={config.printer.rawTapeLength}
              onChange={(e) => handlePrinterChange('tapeLengthMm', 'rawTapeLength', e.target.value)}
              inputProps={{ min: 8, max: 100 }}
            />
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

                  <FormControl variant="outlined">
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
                      sx={{ 
                        width: '80px',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 0,
                        },
                        '& fieldset': {
                          border: 'none',
                        },
                        '& .MuiSelect-select': {
                          py: 2,
                        },
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
            border: '1px solid #44475a',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            p: 1,
            mb: 3,
            bgcolor: '#f8f8f2',
            '&.export-mode': {
              border: 'none',
              borderRadius: 0,
              bgcolor: '#FFFFFF',
            }
          }}
        >
          {config.icon.type !== 'None' && (
            (config.icon.type === 'Screws' ? 
              (config.icon.showHeadIcon || config.icon.showDriveIcon) : 
              config.icon.showIcon
            ) && (
              <Box 
                sx={{ 
                  width: dimensions.width * 0.8,
                  height: dimensions.width * 0.8,
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
            )
          )}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            width: '100%',
          }}>
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
                  marginBottom: index < config.text.lines - 1 ? '2px' : 0,
                  textAlign: line.textAlign,
                  width: '100%',
                  color: '#282a36',
                }}
              >
                {line.text || `Line ${index + 1}`}
              </Typography>
            ))}
          </Box>
        </Box>

        <Button variant="contained" onClick={exportImage}>
          Export as PNG ({dimensions.height}×{dimensions.width})
        </Button>
      </Box>
    </Stack>
  );
}

export default LabelMaker;

