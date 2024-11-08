export const styles = {
  preview: (dimensions) => ({
    width: dimensions.height,
    height: dimensions.width,
    border: '1px solid #ccc',
    borderRadius: 1,
    position: 'relative',
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
  }),

  safeAreaOutline: (safeArea) => ({
    position: 'absolute',
    left: safeArea.left,
    top: safeArea.top,
    width: `calc(100% - ${safeArea.left + safeArea.right}px)`,
    height: `calc(100% - ${safeArea.top + safeArea.bottom}px)`,
    border: '1px dotted rgba(255, 0, 0, 0.5)',
    pointerEvents: 'none',
    '&.export-mode': {
      display: 'none',
    },
  }),

  contentContainer: (safeArea) => ({
    position: 'absolute',
    left: safeArea.left,
    top: safeArea.top,
    width: `calc(100% - ${safeArea.left + safeArea.right}px)`,
    height: `calc(100% - ${safeArea.top + safeArea.bottom}px)`,
    display: 'flex',
    alignItems: 'center',
  }),
  
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

  lineText: (line) => ({
    fontFamily: line.font,
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
  }),
  
  buttonContainer: {
    display: 'flex',
    gap: 2,
  },
}; 