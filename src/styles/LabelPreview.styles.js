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
      width: `calc(${dimensions.height}px - ${dimensions.safeArea.left + dimensions.safeArea.right}px)`,
      height: `calc(${dimensions.width}px - ${dimensions.safeArea.top + dimensions.safeArea.bottom}px)`,
      border: 'none',
      borderRadius: 0,
      bgcolor: '#FFFFFF',
      p: 0,
      m: 0,
      overflow: 'hidden',
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
    outline: '1px dotted rgba(255, 0, 0, 0.5)',
    pointerEvents: 'none',
    '.export-mode &': {
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
    '.export-mode &': {
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
    },
  }),
  
  iconContainer: ({ config, dimensions, safeArea }) => ({ 
    width: config.icon.type === 'Screws' && config.icon.showHeadIcon && config.icon.showDriveIcon ? 
      (dimensions.width - (safeArea.top + safeArea.bottom)) / 2 : 
      (dimensions.width - (safeArea.top + safeArea.bottom)),
    height: dimensions.width - (safeArea.top + safeArea.bottom),
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