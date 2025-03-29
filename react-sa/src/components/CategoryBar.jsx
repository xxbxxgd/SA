import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Container } from '@mui/material';

const categories = [
  { id: 'all', label: '全部分類', path: '/' },
  { id: 'furniture', label: '家具家電', path: '/category/furniture' },
  { id: 'books', label: '書籍教材', path: '/category/books' },
  { id: 'daily', label: '生活用品', path: '/category/daily' },
  { id: 'electronics', label: '3C產品', path: '/category/electronics' }
];

const CategoryBar = ({ currentCategory }) => {
  return (
    <Box 
      sx={{ 
        bgcolor: 'background.paper', 
        boxShadow: 1,
        borderBottom: '1px solid #e0e0e0',
        mb: 2
      }}
    >
      <Container maxWidth="lg">
        <Box 
          sx={{ 
            display: 'flex', 
            overflowX: 'auto',
            py: 1,
            '&::-webkit-scrollbar': {
              height: '4px'
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f1f1f1'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#888',
              borderRadius: '4px'
            }
          }}
        >
          {categories.map((category) => (
            <Button
              component={Link}
              to={category.path}
              key={category.id}
              sx={{ 
                mx: 1, 
                whiteSpace: 'nowrap',
                color: currentCategory === category.id ? 'primary.main' : 'text.primary',
                fontWeight: currentCategory === category.id ? 'bold' : 'regular',
                borderBottom: currentCategory === category.id ? 2 : 0,
                borderColor: 'primary.main',
                borderRadius: 0,
                '&:hover': {
                  bgcolor: 'rgba(25, 118, 210, 0.04)',
                  borderBottom: 2,
                  borderColor: 'primary.light'
                }
              }}
            >
              {category.label}
            </Button>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default CategoryBar; 