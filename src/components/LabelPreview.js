import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { styles } from '../styles/LabelPreview.styles';

function LabelPreview({ 
  previewRef, 
  config, 
  dimensions, 
  getIconComponent, 
  exportImage, 
  handlePrint 
}) {
  const safeArea = {
    left: (config.printer.margins.left * config.printer.dpi) / 25.4,
    right: (config.printer.margins.right * config.printer.dpi) / 25.4,
    top: (config.printer.margins.top * config.printer.dpi) / 25.4,
    bottom: (config.printer.margins.bottom * config.printer.dpi) / 25.4,
  };

  const dimensionsWithSafeArea = {
    ...dimensions,
    safeArea,
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Label Preview
      </Typography>
      
      <Box
        ref={previewRef}
        sx={() => styles.preview(dimensionsWithSafeArea)}
      >
        <Box sx={() => styles.safeAreaOutline(safeArea)} />

        <Box sx={() => styles.contentContainer(safeArea)}>
          {config.icon.type !== 'None' && (
            <Box sx={() => styles.iconContainer({ config, dimensions, safeArea })}>
              {getIconComponent(
                config.icon.type, 
                config.icon.drive, 
                config.icon.head, 
                config.icon.customIcon,
                config.icon.showHeadIcon,
                config.icon.showDriveIcon,
                config.icon.showIcon,
                config.icon.nutType,
                config.icon.washerType
              )}
            </Box>
          )}
          <Box sx={styles.textContainer}>
            {config.text.lineContents.map((line, index) => (
              <Typography
                key={index}
                sx={() => styles.lineText({
                  ...line,
                  font: config.text.font
                })}
              >
                {line.text || `Line ${index + 1}`}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>

      <Box sx={styles.buttonContainer}>
        <Button variant="contained" onClick={exportImage}>
          Export as PNG ({Math.round(dimensions.length - (safeArea.left + safeArea.right))}×
          {Math.round(dimensions.height - (safeArea.top + safeArea.bottom))})
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
  );
}

export default LabelPreview; 