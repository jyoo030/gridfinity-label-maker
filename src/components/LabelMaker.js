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
} from '@mui/material';
import { toPng } from 'html-to-image';
import { calculatePixelDimensions } from '../utils/calculations';

const iconOptions = {
  types: ['Screws', 'Nuts', 'Washers'],
  sizes: ['M2', 'M3', 'M4', 'M5', 'M6'],
  heads: ['Flat', 'Socket', 'Button'],
  drives: ['Hex', 'Phillips', 'Minus'],
};

const fonts = ['Arial', 'Roboto', 'Helvetica', 'Times New Roman'];

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
      head: 'Socket',
      length: 10,
      drive: 'Hex',
    },
    text: {
      font: 'Arial',
      fontSize: 8,
      lines: 1,
      horizontalAlign: 'left',
      verticalAlign: 'center',
      lineContents: [''],
      rawLinesInput: '1',
    },
  });

  const previewRef = useRef(null);

  const handleConfigChange = (category, field, value) => {
    setConfig(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const exportImage = async () => {
    if (previewRef.current) {
      const dataUrl = await toPng(previewRef.current, {
        width: dimensions.width,
        height: dimensions.height,
        style: {
          transform: 'scale(1)', // Remove preview scaling for export
          margin: 0,
          padding: 0,
        }
      });
      const link = document.createElement('a');
      link.download = 'label.png';
      link.href = dataUrl;
      link.click();
    }
  };

  const handleLineTextChange = (lineIndex, value) => {
    setConfig(prev => ({
      ...prev,
      text: {
        ...prev.text,
        lineContents: prev.text.lineContents.map((content, idx) =>
          idx === lineIndex ? value : content
        ),
      },
    }));
  };

  const handleLinesChange = (newLines) => {
    const numLines = newLines === '' ? 0 : parseInt(newLines) || 0;
    setConfig(prev => ({
      ...prev,
      text: {
        ...prev.text,
        lines: numLines,
        rawLinesInput: newLines,
        lineContents: Array(numLines).fill('').map((_, idx) => 
          prev.text.lineContents[idx] || ''
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

  // Calculate dimensions based on printer settings
  const dimensions = calculatePixelDimensions(
    config.printer.tapeWidthMm,
    config.printer.tapeLengthMm,
    config.printer.dpi
  );

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Label Maker
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
            <TextField
              fullWidth
              type="number"
              label="Tape Width (mm)"
              value={config.printer.rawTapeWidth}
              onChange={(e) => handlePrinterChange('tapeWidthMm', 'rawTapeWidth', e.target.value)}
              inputProps={{ min: 8, max: 16 }}
            />
            <TextField
              fullWidth
              type="number"
              label="Tape Length (mm)"
              value={config.printer.rawTapeLength}
              onChange={(e) => handlePrinterChange('tapeLengthMm', 'rawTapeLength', e.target.value)}
              inputProps={{ min: 8, max: 16 }}
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
            {Object.entries(iconOptions).map(([key, options]) => (
              <FormControl key={key} fullWidth>
                <InputLabel>{key.charAt(0).toUpperCase() + key.slice(1)}</InputLabel>
                <Select
                  value={config.icon[key.replace('s', '')]}
                  onChange={(e) => handleConfigChange('icon', key.replace('s', ''), e.target.value)}
                >
                  {options.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
            <TextField
              fullWidth
              type="number"
              label="Length (mm)"
              value={config.icon.length}
              onChange={(e) => handleConfigChange('icon', 'length', e.target.value)}
            />
          </Stack>
        </Box>

        {/* Text Configuration */}
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Typography variant="h6" gutterBottom>
            Text Settings
          </Typography>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Font</InputLabel>
              <Select
                value={config.text.font}
                onChange={(e) => handleConfigChange('text', 'font', e.target.value)}
              >
                {fonts.map((font) => (
                  <MenuItem key={font} value={font}>
                    {font}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="number"
              label="Font Size (px)"
              value={config.text.fontSize}
              onChange={(e) => handleConfigChange('text', 'fontSize', Number(e.target.value))}
              inputProps={{ min: 1, max: 72 }}
            />
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
              <TextField
                key={`line-${index}`}
                fullWidth
                label={`Line ${index + 1}`}
                value={config.text.lineContents[index] || ''}
                onChange={(e) => handleLineTextChange(index, e.target.value)}
              />
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Preview Section */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Preview
        </Typography>
        
        {/* Actual size preview */}
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          Actual Size (1:1)
        </Typography>
        <Box
          ref={previewRef}
          sx={{
            width: dimensions.height,
            height: dimensions.width,
            border: '1px solid #ccc',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            p: 1,
            mb: 3,
          }}
        >
          <Box 
            sx={{ 
              width: dimensions.width * 0.8,
              height: dimensions.width * 0.8,
              bgcolor: '#ccc',
              mr: 1,
              flexShrink: 0
            }} 
          />
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {config.text.lineContents.map((line, index) => (
              <Typography
                key={index}
                style={{
                  fontFamily: config.text.font,
                  fontSize: `${config.text.fontSize}px`,
                  marginBottom: index < config.text.lines - 1 ? '2px' : 0,
                }}
              >
                {line || `Line ${index + 1}`}
              </Typography>
            ))}
          </Box>
        </Box>

        {/* Scaled preview */}
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          Enlarged Preview (Scaled for visibility)
        </Typography>
        <Box
          sx={{
            width: dimensions.height,
            height: dimensions.width,
            border: '1px solid #ccc',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            p: 1,
            mb: 2,
            transform: `scale(${Math.min(2, 300 / dimensions.height)})`,
            transformOrigin: 'left top',
            marginBottom: `${dimensions.width * Math.min(2, 300 / dimensions.height) + 16}px`,
          }}
        >
          <Box 
            sx={{ 
              width: dimensions.width * 0.8,
              height: dimensions.width * 0.8,
              bgcolor: '#ccc',
              mr: 1,
              flexShrink: 0
            }} 
          />
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {config.text.lineContents.map((line, index) => (
              <Typography
                key={index}
                style={{
                  fontFamily: config.text.font,
                  fontSize: `${config.text.fontSize}px`,
                  marginBottom: index < config.text.lines - 1 ? '2px' : 0,
                }}
              >
                {line || `Line ${index + 1}`}
              </Typography>
            ))}
          </Box>
        </Box>

        <Button variant="contained" onClick={exportImage}>
          Export as PNG ({dimensions.width}×{dimensions.height})
        </Button>
      </Box>
    </Stack>
  );
}

export default LabelMaker;

