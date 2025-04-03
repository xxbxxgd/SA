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
import InventoryIcon from '@mui/icons-material/Inventory';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import '../styles/components/ProductCard.css';

const ProductCard = ({ product, isOwner = false }) => {
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
    <Card className="productCard">
      <CardActionArea 
        onClick={handleClick} 
        className="cardActionArea"
      >
        {/* 商品圖片 */}
        <CardMedia
          component="img"
          height="200"
          image={product.images && product.images.length > 0 ? product.images[0] : (product.imageUrl || 'https://via.placeholder.com/300x200?text=無圖片')}
          alt={product.name}
          className="productImage"
        />
        
        {/* 分類標籤，定位在圖片左上角 */}
        <Chip 
          label={product.category} 
          size="small" 
          color="primary" 
          variant="filled"
          className="categoryChip"
        />
        
        {/* 庫存標籤，定位在圖片右下角 */}
        <Chip 
          icon={<InventoryIcon style={{ fontSize: '0.8rem', color: 'white' }} />}
          label={`庫存: ${product.stock || 0}`}
          size="small"
          color={product.stock > 0 ? "success" : "error"}
          variant="filled"
          className="stockChip"
        />
        
        <CardContent className="productContent">
          {/* 商品名稱 */}
          <Typography 
            variant="h6" 
            component="div" 
            className="productName"
          >
            {product.name}
          </Typography>
          
          {/* 商品價格 */}
          <Typography 
            variant="h6" 
            color="error" 
            className="productPrice"
          >
            NT$ {product.price.toLocaleString()}
          </Typography>
          
          {/* 位置、上架時間和上架者 */}
          <Box className="productInfo">
            {/* 上架者信息 */}
            <Box className="productSeller">
              <PersonIcon fontSize="small" color="action" sx={{ mr: 0.5, fontSize: '0.9rem' }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                {product.userName || '匿名用戶'}
              </Typography>
            </Box>
          
            {/* 位置信息 */}
            <Box className="productLocation">
              <LocationOnIcon fontSize="small" color="action" sx={{ mr: 0.5, fontSize: '0.9rem' }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                {product.location || '輔仁大學'}
              </Typography>
            </Box>
            
            {/* 上架時間 */}
            <Box className="productDate">
              <CalendarTodayIcon fontSize="small" color="action" sx={{ mr: 0.5, fontSize: '0.9rem' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {product.createdAt ? formatDate(product.createdAt) : ''}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ProductCard; 