import React, { useState } from 'react';
import { Container, Typography, Button, Grid, Paper, Box, IconButton, Divider, Snackbar, Alert } from '@mui/material';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import '../styles/pages/Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      setSnackbar({
        open: true,
        message: '商品已從購物車移除',
        severity: 'info'
      });
    } else {
      updateQuantity(productId, newQuantity);
      setSnackbar({
        open: true,
        message: '商品數量已更新',
        severity: 'success'
      });
    }
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
    setSnackbar({
      open: true,
      message: '商品已從購物車移除',
      severity: 'info'
    });
  };

  const handleClearCart = () => {
    clearCart();
    setSnackbar({
      open: true,
      message: '購物車已清空',
      severity: 'info'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    setOrderSuccess(true);
    // 這裡可以加清空購物車等動作
    // clearCart();
  };

  // 如果購物車是空的
  if (cartItems.length === 0) {
    return (
      <Container maxWidth="md" className="cart-container">
        <Typography variant="h4" component="h1" gutterBottom align="center" className="cart-title">
          購物車
        </Typography>
        <Paper elevation={3} className="empty-cart">
          <Box sx={{ mb: 2 }}>
            <img src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png" alt="空購物車" style={{ width: 80, opacity: 0.7 }} />
          </Box>
          <Typography variant="h6" align="center" className="empty-cart-text">
            您的購物車是空的，快去挑選喜歡的商品吧！
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            點擊下方「繼續購物」返回商品列表
          </Typography>
          <Button 
            component={Link} 
            to="/" 
            variant="contained" 
            color="primary" 
            className="continue-shopping-btn"
          >
            繼續購物
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" className="cart-container">
      <Typography variant="h4" component="h1" gutterBottom align="center" className="cart-title">
        購物車
      </Typography>

      <Grid container spacing={3}>
        {/* 購物車商品列表 */}
        <Grid item xs={12}>
          <Paper elevation={3} className="cart-items">
            {cartItems.map((item) => (
              <Box key={item.id} className="cart-item">
                <Grid container alignItems="center" spacing={2}>
                  {/* 商品圖片 */}
                  <Grid item xs={12} sm={2}>
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="cart-item-image"
                        style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 100,
                          height: 100,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#f0f0f0',
                          borderRadius: '12px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" align="center">
                          無圖片
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                  
                  {/* 商品資訊 */}
                  <Grid item xs={12} sm={10}>
                    <Grid container alignItems="center" spacing={2}>
                      {/* 商品名稱 */}
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h6" className="cart-item-name" sx={{ fontWeight: 700, fontSize: '1.2rem' }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body1" className="cart-item-price" sx={{ color: '#1976d2', fontWeight: 600, fontSize: '1.1rem' }}>
                          ${item.price}
                        </Typography>
                      </Grid>
                      {/* 小計和刪除按鈕 */}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="h6" className="cart-item-subtotal" sx={{ color: '#d32f2f', fontWeight: 700, fontSize: '1.2rem' }}>
                            ${item.price}
                          </Typography>
                          <IconButton 
                            size="large" 
                            onClick={() => handleRemoveItem(item.id)}
                            className="delete-btn"
                            sx={{ color: '#d32f2f', background: '#fff3e0', ml: 2 }}
                          >
                            <DeleteIcon fontSize="medium" />
                          </IconButton>
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Divider className="item-divider" />
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* 操作按鈕 */}
        <Grid item xs={12} className="cart-actions">
          <Button 
            variant="outlined" 
            color="error" 
            onClick={handleClearCart}
            className="clear-cart-btn"
          >
            清空購物車
          </Button>
          <Button 
            component={Link} 
            to="/" 
            variant="outlined" 
            color="primary"
            className="continue-shopping-btn"
          >
            繼續購物
          </Button>
        </Grid>

        {/* 購物車摘要 */}
        <Grid item xs={12}>
          <Paper elevation={3} className="cart-summary">
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <Typography variant="h6" className="total-title" sx={{ fontWeight: 700, fontSize: '1.3rem' }}>
                  總計：
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="h4" className="total-amount" sx={{ color: '#1976d2', fontWeight: 900, fontSize: '2rem' }}>
                  ${getCartTotal()}
                </Typography>
              </Grid>
            </Grid>
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth 
              size="large" 
              className="checkout-btn"
              onClick={handleCheckout}
              sx={{ mt: 2, fontWeight: 700, fontSize: '1.2rem', borderRadius: '10px' }}
            >
              結帳
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* 通知訊息 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      {/* 下單成功訊息 */}
      <Snackbar
        open={orderSuccess}
        autoHideDuration={2500}
        onClose={() => setOrderSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setOrderSuccess(false)} severity="success" sx={{ width: '100%' }}>
          下單成功！感謝您的購買
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Cart; 