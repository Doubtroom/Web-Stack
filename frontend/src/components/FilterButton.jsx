import React from 'react';
import { Filter } from 'lucide-react';
import { Button, styled } from '@mui/material';
import { motion } from 'framer-motion';

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '8px 16px',
  textTransform: 'none',
  transition: 'all 0.3s ease-in-out',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  minWidth: '120px',
  justifyContent: 'center',
  backdropFilter: 'blur(8px)',
  '@media (min-width: 640px)': {
    minWidth: '160px',
  },
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const FilterButton = ({ isActive, onClick, children }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <StyledButton
        variant={isActive ? "contained" : "outlined"}
        onClick={onClick}
        className={`
          ${isActive 
            ? 'bg-primary-600 dark:bg-primary-700 text-white border-primary-600 dark:border-primary-500' 
            : 'bg-transparent dark:bg-transparent text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'
          }
          hover:bg-primary-700 dark:hover:bg-primary-600
          hover:border-primary-700 dark:hover:border-primary-500
          hover:shadow-lg dark:hover:shadow-gray-900/30
          transition-all duration-300
          text-sm sm:text-base
          px-3 sm:px-4
          py-2 sm:py-2.5
        `}
        sx={{
          '& .MuiSvgIcon-root': {
            color: isActive 
              ? 'white' 
              : 'currentColor',
          }
        }}
      >
        <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
        {children}
      </StyledButton>
    </motion.div>
  );
};

export default FilterButton; 