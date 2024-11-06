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
import UploadIcon from '@mui/icons-material/Upload';
import { styles } from '../styles/IconSettings.styles';

const iconOptions = {
  types: ['None', 'Screws', 'Nuts', 'Washers'],
  sizes: ['M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M10', 'M12', 'M14', 'M16', 'M18', 'M20'],
  heads: ['Flat', 'Hex', 'Pan', 'Round'],
  drives: ['Hex', 'Phillips', 'Slotted', 'Square', 'Torx'],
  nutTypes: ['Standard', 'Lock', 'Cap'],
  washerTypes: ['Flat', 'Fender', 'Split', 'Star Exterior', 'Star Interior'],
};

const generateAutofillText = (icon) => {
  switch (icon.type) {
    case 'Screws':
      return [`${icon.size}×${icon.length}`, `${icon.head} ${icon.drive}`];
    case 'Nuts':
      return [`${icon.size}`, `${icon.nutType}`];
    case 'Washers':
      return [`${icon.size}`, `${icon.washerType}`];
    default:
      return ['', ''];
  }
};

function IconSettings({ config, handleConfigChange, handleCustomIconUpload, handleLinesChange, setConfig }) {
  return (
    <Box sx={styles.container}>
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

            {config.icon.type === 'Washers' && (
              <FormControl fullWidth variant="outlined">
                <InputLabel id="washer-type-label">Washer Type</InputLabel>
                <Select
                  labelId="washer-type-label"
                  label="Washer Type"
                  value={config.icon.washerType}
                  onChange={(e) => handleConfigChange('icon', 'washerType', e.target.value)}
                >
                  {iconOptions.washerTypes.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {config.icon.type === 'Nuts' && (
              <FormControl fullWidth variant="outlined">
                <InputLabel id="nut-type-label">Nut Type</InputLabel>
                <Select
                  labelId="nut-type-label"
                  label="Nut Type"
                  value={config.icon.nutType}
                  onChange={(e) => handleConfigChange('icon', 'nutType', e.target.value)}
                >
                  {iconOptions.nutTypes.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

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
  );
}

export default IconSettings; 