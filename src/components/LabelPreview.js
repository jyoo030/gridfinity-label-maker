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
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Label Preview
      </Typography>
      
      <Box
        ref={previewRef}
        sx={styles.preview}
      >
        {config.icon.type !== 'None' && (
          <Box sx={() => styles.iconContainer({ config, dimensions })}>
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

      <Box sx={styles.buttonContainer}>
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
  );
}

export default LabelPreview; 