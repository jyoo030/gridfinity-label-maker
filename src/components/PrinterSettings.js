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
} from '@mui/material';
import { styles } from '../styles/PrinterSettings.styles';

const tapeWidthOptions = [6, 9, 12, 18, 24, 36];

function PrinterSettings({ config, handlePrinterChange, dimensions }) {
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
        <Box sx={styles.lengthContainer}>
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
            sx={styles.customLengthCheckbox}
          />
        </Box>
        <Typography variant="body2" color="textSecondary">
          Output dimensions: {dimensions.width}px × {dimensions.height}px
        </Typography>
      </Stack>
    </Box>
  );
}

export default PrinterSettings; 