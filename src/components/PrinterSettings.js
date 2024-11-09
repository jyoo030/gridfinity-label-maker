import React from 'react';
import {
  Stack,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import { styles } from '../styles/PrinterSettings.styles';

const tapeWidthOptions = [6, 9, 12, 18, 24, 36];

function PrinterSettings({ config, handlePrinterChange, dimensions }) {
  const handleMarginChange = (field, value) => {
    const stringValue = value === '' ? '0' : value;
    handlePrinterChange(
      'margins',
      field,
      stringValue,
      `raw${field.charAt(0).toUpperCase() + field.slice(1)}`
    );
  };

  return (
    <Box sx={styles.container}>
      <Typography variant="h6" gutterBottom>
        Printer Settings
      </Typography>
      <Stack spacing={2}>
        <TextField
          fullWidth
          type="number"
          label="DPI"
          value={config.printer.rawDpi}
          onChange={(e) => handlePrinterChange(
            'printer',
            'dpi',
            e.target.value,
            'rawDpi'
          )}
          inputProps={{ min: 100, max: 600 }}
        />
        <FormControl fullWidth variant="outlined">
          <InputLabel id="tape-width-label">Tape Width (mm)</InputLabel>
          <Select
            labelId="tape-width-label"
            label="Tape Width (mm)"
            value={config.printer.tapeHeightMm}
            onChange={(e) => handlePrinterChange(
              'printer',
              'tapeHeightMm',
              e.target.value,
              'rawTapeWidth'
            )}
          >
            {tapeWidthOptions.map((width) => (
              <MenuItem key={width} value={width}>
                {width}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={styles.lengthContainer}>
          <TextField
            fullWidth
            type="number"
            label="Tape Length (mm)"
            value={config.printer.rawTapeLength}
            onChange={(e) => handlePrinterChange(
              'printer',
              'tapeLengthMm',
              e.target.value,
              'rawTapeLength'
            )}
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
                onChange={(e) => handlePrinterChange(
                  'printer',
                  'customLength',
                  e.target.checked,
                  'customLength'
                )}
              />
            }
            label="Custom Length"
            sx={styles.customLengthCheckbox}
          />
        </Box>
        <Typography variant="body2" color="textSecondary">
          Output dimensions: {dimensions.height}px × {dimensions.length}px
        </Typography>
      </Stack>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="subtitle1" gutterBottom>
        Margins (mm)
      </Typography>
      
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Left"
          type="number"
          value={config.printer.margins.rawLeft}
          onChange={(e) => handleMarginChange('left', e.target.value)}
          inputProps={{ min: 0, max: config.printer.tapeHeightMm / 2, step: 0.5 }}
          size="small"
        />
        <TextField
          label="Right"
          type="number"
          value={config.printer.margins.rawRight}
          onChange={(e) => handleMarginChange('right', e.target.value)}
          inputProps={{ min: 0, max: config.printer.tapeHeightMm / 2, step: 0.5 }}
          size="small"
        />
      </Stack>
      
      <Stack direction="row" spacing={2}>
        <TextField
          label="Top"
          type="number"
          value={config.printer.margins.rawTop}
          onChange={(e) => handleMarginChange('top', e.target.value)}
          inputProps={{ min: 0, max: config.printer.tapeHeightMm / 2, step: 0.5 }}
          size="small"
        />
        <TextField
          label="Bottom"
          type="number"
          value={config.printer.margins.rawBottom}
          onChange={(e) => handleMarginChange('bottom', e.target.value)}
          inputProps={{ min: 0, max: config.printer.tapeHeightMm / 2, step: 0.5 }}
          size="small"
        />
      </Stack>
    </Box>
  );
}

export default PrinterSettings; 