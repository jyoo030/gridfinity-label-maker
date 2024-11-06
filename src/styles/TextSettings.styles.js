export const styles = {
  container: {
    flex: '1 1 300px',
    minWidth: 0,
  },
  
  lineContainer: {
    display: 'flex',
    alignItems: 'stretch',
    gap: 2,
  },
  
  lineTextField: { 
    flex: 1.2,
    '& .MuiOutlinedInput-root': {
      height: '100%',
    },
  },
  
  controlsContainer: {
    display: 'flex',
    alignItems: 'center',
    width: 'fit-content',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 1,
  },
  
  buttonGroup: {
    display: 'flex',
    height: '100%',
    borderLeft: 1,
    borderColor: 'divider',
  },
  
  formatButton: { 
    minWidth: '40px',
    borderRadius: 0,
    px: 2,
    borderRight: 1,
    borderColor: 'divider',
  },
  
  lastFormatButton: {
    minWidth: '40px',
    borderRadius: 0,
    borderRight: 0,
    borderColor: 'divider',
    px: 2,
  },
  
  fontSizeSelect: { 
    width: '80px',
    '& .MuiInputBase-input': {
      textAlign: 'right',
      paddingRight: '24px'
    }
  },
  
  fontMenuItem: {
    fontSize: '16px',
    '&:hover': {
      backgroundColor: 'action.hover',
    },
    '&.Mui-selected': {
      backgroundColor: 'action.selected',
    },
  },
  
  fitToLabelContainer: {
    width: 'fit-content',
    pl: '9px',
  },
}; 