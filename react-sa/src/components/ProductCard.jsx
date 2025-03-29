import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardActionArea, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  Chip,
  IconButton,
  Badge
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InventoryIcon from '@mui/icons-material/Inventory';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const ProductCard = ({ product, isOwner = false }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };
  
  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/edit-product/${product.id}`);
  };
  
  const handleDelete = (e) => {
    e.stopPropagation();
    // 這裡可以添加確認刪除的邏輯
    if (window.confirm('確定要刪除此商品嗎？')) {
      console.log('刪除商品:', product.id);
      // 實際刪除邏輯將在後續實現
    }
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
        borderRadius: '10px',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.12)'
        }
      }}
    >
      <CardActionArea 
        onClick={handleClick} 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'stretch',
          position: 'relative'
        }}
      >
        {/* 商品圖片 */}
        <CardMedia
          component="img"
          height="200"
          image={product.images && product.images.length > 0 ? product.images[0] : (product.imageUrl || 'https://via.placeholder.com/300x200?text=無圖片')}
          alt={product.name}
          sx={{ 
            objectFit: 'cover',
            backgroundColor: '#f8f9fa'  // 淺灰色背景
          }}
        />
        
        {/* 分類標籤，定位在圖片左上角 */}
        <Chip 
          label={product.category} 
          size="small" 
          color="primary" 
          variant="filled"
          sx={{ 
            position: 'absolute', 
            top: '10px', 
            left: '10px',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            backgroundColor: '#1976d2',
            color: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        />
        
        {/* 庫存標籤，定位在圖片右下角 */}
        <Chip 
          icon={<InventoryIcon style={{ fontSize: '0.8rem', color: 'white' }} />}
          label={`庫存: ${product.stock || 0}`}
          size="small"
          color={product.stock > 0 ? "success" : "error"}
          variant="filled"
          sx={{ 
            position: 'absolute', 
            bottom: '160px', 
            right: '10px',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            color: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        />
        
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
          {/* 商品名稱 */}
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 1,
              fontSize: '1rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              height: '48px'
            }}
          >
            {product.name}
          </Typography>
          
          {/* 商品價格 */}
          <Typography 
            variant="h6" 
            color="error" 
            sx={{ 
              fontWeight: 'bold', 
              mt: 'auto',
              fontSize: '1.2rem'
            }}
          >
            NT$ {product.price.toLocaleString()}
          </Typography>
          
          {/* 位置和上架時間 */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '4px',
            mt: 1 
          }}>
            {/* 位置信息 */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOnIcon fontSize="small" color="action" sx={{ mr: 0.5, fontSize: '0.9rem' }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                {product.location || '輔仁大學'}
              </Typography>
            </Box>
            
            {/* 上架時間 */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarTodayIcon fontSize="small" color="action" sx={{ mr: 0.5, fontSize: '0.9rem' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {product.createdAt ? formatDate(product.createdAt) : ''}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
      
      {/* 若是商品擁有者，顯示編輯和刪除按鈕 */}
      {isOwner && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '10px', 
            right: '10px',
            display: 'flex',
            gap: '4px'
          }}
        >
          <IconButton 
            size="small" 
            onClick={handleEdit}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.8)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' }
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={handleDelete}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.8)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Card>
  );
};

export default ProductCard; 