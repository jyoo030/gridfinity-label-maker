export const styles = {
  mainContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 3,
  },
  
  preview: {
    width: (dimensions) => dimensions.height,
    height: (dimensions) => dimensions.width,
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
      '& *': {
        color: '#000000 !important',
        fill: '#000000 !important',
        stroke: '#000000 !important',
        border: 'none !important',
        borderRadius: '0 !important',
      },
    },
  },
  
  iconContainer: ({ config, dimensions }) => ({ 
    width: config.icon.type === 'Screws' && config.icon.showHeadIcon && config.icon.showDriveIcon ? 
      dimensions.width / 2 : dimensions.width,
    height: dimensions.width,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    mr: 1,
    flexShrink: 0,
    color: '#282a36',
  }),
  
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  
  buttonContainer: {
    display: 'flex',
    gap: 2,
  },
}; 