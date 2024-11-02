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
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import { toPng } from 'html-to-image';
import { calculatePixelDimensions } from '../utils/calculations';

const iconOptions = {
  types: ['None', 'Screws', 'Nuts', 'Washers'],
  sizes: ['M2', 'M3', 'M4', 'M5', 'M6'],
  heads: ['Flat', 'Socket', 'Button'],
  drives: ['Hex', 'Phillips', 'Flat Head'],
};

const fonts = ['Arial', 'Roboto', 'Helvetica', 'Times New Roman'];

const tapeWidthOptions = [6, 9, 12, 18, 24, 36];

const fontSizeOptions = [6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];

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
        width: dimensions.height,
        height: dimensions.width,
        style: {
          transform: 'scale(1)',
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
                    {width} mm
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
            <FormControl fullWidth variant="outlined">
              <InputLabel id="types-label">Types</InputLabel>
              <Select
                labelId="types-label"
                label="Types"
                value={config.icon.type}
                onChange={(e) => handleConfigChange('icon', 'type', e.target.value)}
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
                {Object.entries(iconOptions)
                  .filter(([key]) => key !== 'types') // Skip the types dropdown since it's already shown
                  .map(([key, options]) => (
                    <FormControl key={key} fullWidth variant="outlined">
                      <InputLabel id={`${key}-label`}>{key.charAt(0).toUpperCase() + key.slice(1)}</InputLabel>
                      <Select
                        labelId={`${key}-label`}
                        label={key.charAt(0).toUpperCase() + key.slice(1)}
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
          Preview
        </Typography>
        
        {/* Actual size preview */}
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          Image Export Preview (1:1)
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
          {config.icon.type !== 'None' && (
            <Box 
              sx={{ 
                width: dimensions.width * 0.8,
                height: dimensions.width * 0.8,
                bgcolor: '#ccc',
                mr: 1,
                flexShrink: 0
              }} 
            />
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
                  marginBottom: index < config.text.lines - 1 ? '2px' : 0,
                  textAlign: line.textAlign,
                  width: '100%',
                }}
              >
                {line.text || `Line ${index + 1}`}
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
          {config.icon.type !== 'None' && (
            <Box 
              sx={{ 
                width: dimensions.width * 0.8,
                height: dimensions.width * 0.8,
                bgcolor: '#ccc',
                mr: 1,
                flexShrink: 0
              }} 
            />
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
                  marginBottom: index < config.text.lines - 1 ? '2px' : 0,
                  textAlign: line.textAlign,
                  width: '100%',
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

