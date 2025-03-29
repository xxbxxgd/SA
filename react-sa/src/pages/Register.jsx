import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Box, 
  Grid, 
  Alert,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    if (!formData.name) {
      setError('請輸入您的姓名');
      return false;
    }
    
    if (!formData.email) {
      setError('請輸入您的電子郵件');
      return false;
    }
    
    if (!formData.password) {
      setError('請輸入密碼');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('密碼長度至少需要6個字符');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('兩次輸入的密碼不一致');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      // 使用AuthContext中的signup函數
      await signup(formData.email, formData.password, formData.name);
      setSuccess(true);
      
      // 3秒後跳轉至登入頁面
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('註冊失敗:', error);
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('此電子郵件已被註冊');
          break;
        case 'auth/invalid-email':
          setError('無效的電子郵件格式');
          break;
        case 'auth/weak-password':
          setError('密碼強度不足');
          break;
        default:
          setError('註冊失敗，請稍後再試');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box 
        sx={{ 
          mt: 8, 
          mb: 4,
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}
      >
        <Box sx={{ position: 'absolute', top: 90, right: 24 }}>
          <IconButton 
            component={Link} 
            to="/" 
            color="primary" 
            aria-label="返回首頁"
          >
            <ArrowBackIcon /> <Typography variant="button" sx={{ ml: 1 }}>返回首頁</Typography>
          </IconButton>
        </Box>

        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            註冊
          </Typography>
          
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          {success && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              註冊成功！3秒後將自動跳轉至登入頁面。
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="姓名"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              disabled={success}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="電子郵件"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              disabled={success}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="密碼（至少6個字符）"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              disabled={success}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="確認密碼"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={success}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading || success}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? '註冊中...' : '註冊'}
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Button 
                  component={Link} 
                  to="/login" 
                  variant="text" 
                  size="small"
                >
                  已有帳號？點此登入
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 