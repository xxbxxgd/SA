import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Container } from '@mui/material';

const categories = [
  { id: 'all', label: '全部分類', path: '/' },
  { id: '家具家電', label: '家具家電', path: '/category/家具家電' },
  { id: '書籍教材', label: '書籍教材', path: '/category/書籍教材' },
  { id: '生活用品', label: '生活用品', path: '/category/生活用品' },
  { id: '3C產品', label: '3C產品', path: '/category/3C產品' },
  { id: '服飾', label: '服飾', path: '/category/服飾' },
  { id: '交通工具', label: '交通工具', path: '/category/交通工具' },
  { id: '美妝保養', label: '美妝保養', path: '/category/美妝保養' },
  { id: '其他', label: '其他', path: '/category/其他' }
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