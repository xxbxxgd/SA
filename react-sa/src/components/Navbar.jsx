import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Avatar, 
  Menu, 
  MenuItem, 
  IconButton 
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleMenuClose();
      navigate('/');
    } catch (error) {
      console.error('登出錯誤:', error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {/* 標題 */}
        <Typography
          variant="h6"
          noWrap
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 'bold'
          }}
        >
          輔仁大學外宿生二手交易平台
        </Typography>

        {/* 搜尋欄 - 將在CategoryBar或首頁顯示 */}

        {/* 商品鏈接 - 所有人都可見 */}
        <Button 
          component={Link} 
          to="/products" 
          color="inherit"
          sx={{ mr: 2 }}
        >
          商品列表
        </Button>

        {/* 未登入顯示登入註冊，已登入顯示個人資料 */}
        {currentUser ? (
          <Box>
            <Button 
              component={Link} 
              to="/add-product" 
              color="inherit"
              sx={{ mr: 2 }}
            >
              上架商品
            </Button>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="profile-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar 
                sx={{ width: 32, height: 32 }}
                alt={currentUser.displayName || '用戶'}
                src={currentUser.photoURL}
              >
                {!currentUser.photoURL && (currentUser.displayName ? currentUser.displayName.charAt(0) : currentUser.email.charAt(0).toUpperCase())}
              </Avatar>
            </IconButton>
            <Menu
              id="profile-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem 
                onClick={() => {
                  handleMenuClose();
                  navigate('/profile');
                }}
              >
                個人資料
              </MenuItem>
              <MenuItem onClick={handleLogout}>登出</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box>
            <Button 
              component={Link} 
              to="/login" 
              color="inherit"
              sx={{ mr: 1 }}
            >
              登入
            </Button>
            <Button 
              component={Link} 
              to="/register" 
              color="inherit"
              variant="outlined"
            >
              註冊
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 