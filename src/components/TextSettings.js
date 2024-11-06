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
  Button,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import { styles } from '../styles/TextSettings.styles';

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

const fontSizeOptions = Array.from({ length: 113 }, (_, i) => i + 8);

function TextSettings({ config, handleConfigChange, handleLineTextChange, handleLineStyleChange, handleLinesChange }) {
  return (
    <Box sx={styles.container}>
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
                sx={styles.fontMenuItem}
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
            sx={styles.lineContainer}
          >
            <TextField
              sx={styles.lineTextField}
              label={`Line ${index + 1}`}
              value={config.text.lineContents[index]?.text || ''}
              onChange={(e) => handleLineTextChange(index, e.target.value)}
            />
            <Box sx={styles.controlsContainer}>
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
                  sx={styles.fontSizeSelect}
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
              <Box sx={styles.buttonGroup}>
                <Button
                  variant={config.text.lineContents[index]?.textAlign === 'left' ? "contained" : "text"}
                  onClick={() => handleLineStyleChange(index, 'textAlign', 'left')}
                  sx={styles.formatButton}
                >
                  <FormatAlignLeftIcon />
                </Button>
                <Button
                  variant={config.text.lineContents[index]?.textAlign === 'center' ? "contained" : "text"}
                  onClick={() => handleLineStyleChange(index, 'textAlign', 'center')}
                  sx={styles.formatButton}
                >
                  <FormatAlignCenterIcon />
                </Button>
                <Button
                  variant={config.text.lineContents[index]?.textAlign === 'right' ? "contained" : "text"}
                  onClick={() => handleLineStyleChange(index, 'textAlign', 'right')}
                  sx={styles.formatButton}
                >
                  <FormatAlignRightIcon />
                </Button>
                <Button
                  variant={config.text.lineContents[index]?.bold ? "contained" : "text"}
                  onClick={() => handleLineStyleChange(index, 'bold', !config.text.lineContents[index]?.bold)}
                  sx={styles.formatButton}
                >
                  B
                </Button>
                <Button
                  variant={config.text.lineContents[index]?.italic ? "contained" : "text"}
                  onClick={() => handleLineStyleChange(index, 'italic', !config.text.lineContents[index]?.italic)}
                  sx={styles.formatButton}
                >
                  I
                </Button>
                <Button
                  variant={config.text.lineContents[index]?.underline ? "contained" : "text"}
                  onClick={() => handleLineStyleChange(index, 'underline', !config.text.lineContents[index]?.underline)}
                  sx={styles.formatButton}
                >
                  U
                </Button>
                <Button
                  variant={config.text.lineContents[index]?.strikethrough ? "contained" : "text"}
                  onClick={() => handleLineStyleChange(index, 'strikethrough', !config.text.lineContents[index]?.strikethrough)}
                  sx={styles.lastFormatButton}
                >
                  S
                </Button>
              </Box>
            </Box>
          </Box>
        ))}

        {/* Wrap FormControlLabel in a Box with fit-content width */}
        <Box sx={styles.fitToLabelContainer}>
          <FormControlLabel
            control={
              <Checkbox
                checked={config.text.fitToLabel || false}
                onChange={(e) => handleConfigChange('text', 'fitToLabel', e.target.checked)}
              />
            }
            label="Fit to Label"
          />
        </Box>
      </Stack>
    </Box>
  );
}

export default TextSettings; 