import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardActionArea, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  Chip
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };
  
  // 格式化時間戳
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      // 處理不同類型的時間戳
      if (timestamp.toDate) {
        // Firestore Timestamp 對象
        return timestamp.toDate().toLocaleDateString('zh-TW');
      } else if (timestamp.seconds) {
        // Timestamp 被轉換為帶 seconds 的對象
        return new Date(timestamp.seconds * 1000).toLocaleDateString('zh-TW');
      } else if (typeof timestamp === 'string') {
        // ISO 字串格式
        return new Date(timestamp).toLocaleDateString('zh-TW');
      }
      
      // 其他格式，嘗試直接轉換
      return new Date(timestamp).toLocaleDateString('zh-TW');
    } catch (error) {
      console.error('日期格式化錯誤:', error);
      return '';
    }
  };
  
  return (
    <Card 
      sx={{ 
        maxWidth: '100%', 
        height: '100%',
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
        }
      }}
    >
      <CardActionArea onClick={handleClick} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <CardMedia
          component="img"
          height="200"
          image={product.images && product.images.length > 0 ? product.images[0] : (product.imageUrl || 'https://via.placeholder.com/300x200?text=無圖片')}
          alt={product.name}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Chip 
              label={product.category} 
              size="small" 
              color="primary" 
              variant="outlined"
              sx={{ height: '20px', fontSize: '0.7rem' }}
            />
            <Typography variant="caption" color="text.secondary">
              {product.createdAt ? formatDate(product.createdAt) : ''}
            </Typography>
          </Box>
          
          <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
            {product.name}
          </Typography>
          
          <Typography variant="h6" color="error" sx={{ fontWeight: 'bold', mt: 'auto' }}>
            NT$ {product.price.toLocaleString()}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <LocationOnIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {product.location || '輔仁大學'}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ProductCard; 