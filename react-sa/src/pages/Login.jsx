import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Box, 
  Grid, 
  Alert,
  IconButton,
  Snackbar,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // 檢查是否有從其他頁面傳來的註冊成功通知
  useEffect(() => {
    // 檢查來自註冊頁面的成功訊息
    if (location.state?.from === 'register' && location.state?.success) {
      setNotification({
        open: true,
        message: '註冊成功！請使用您的帳號密碼登入',
        severity: 'success'
      });
      
      // 清除location.state，避免重新整理頁面時再次顯示通知
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('請輸入電子郵件');
      return;
    }
    
    if (!password) {
      setError('請輸入密碼');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      setNotification({
        open: true,
        message: '登入成功！',
        severity: 'success'
      });
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      console.error('登入失敗:', error);
      switch (error.code) {
        case 'auth/invalid-email':
          setError('無效的電子郵件格式');
          break;
        case 'auth/user-disabled':
          setError('此帳號已被停用');
          break;
        case 'auth/user-not-found':
          setError('找不到此帳號');
          break;
        case 'auth/wrong-password':
          setError('密碼錯誤');
          break;
        default:
          setError('登入失敗，請稍後再試');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
      <Box 
        sx={{ 
          mt: 8, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}
      >

        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%',
            borderRadius: 2,
            bgcolor: 'background.paper',
            boxShadow: '0 3px 15px rgba(0,0,0,0.1)'
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
            帳號登入
          </Typography>
          
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="電子郵件"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="密碼"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ 
                mt: 2, 
                mb: 3, 
                py: 1.2,
                fontWeight: 'bold',
                borderRadius: 2
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : '登入'}
            </Button>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button 
                  component={Link} 
                  to="/forgot-password" 
                  variant="text" 
                  size="small"
                  fullWidth
                  sx={{ textAlign: 'center' }}
                >
                  忘記密碼？
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button 
                  component={Link} 
                  to="/register" 
                  variant="outlined" 
                  size="small"
                  fullWidth
                  sx={{ textAlign: 'center' }}
                >
                  立即註冊新帳號
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 