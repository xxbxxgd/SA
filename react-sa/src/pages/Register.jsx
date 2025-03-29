import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Box, 
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
  Divider,
  Snackbar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../contexts/AuthContext';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // 當註冊成功時，啟動倒數計時器
  useEffect(() => {
    let timer;
    if (success) {
      // 確保成功時清除任何錯誤訊息
      setError('');
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      } else {
        navigate('/login', { state: { from: 'register', success: true }});
      }
    }
    return () => clearTimeout(timer);
  }, [success, countdown, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // 當用戶開始修改表單時，清除錯誤
    setError('');
  };

  const validateForm = () => {
    // 驗證姓名
    if (!formData.name.trim()) {
      setError('請輸入您的姓名');
      return false;
    }
    
    // 驗證電子郵件
    if (!formData.email.trim()) {
      setError('請輸入您的電子郵件');
      return false;
    }
    // 簡單的電子郵件格式驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('請輸入有效的電子郵件格式');
      return false;
    }
    
    // 驗證密碼
    if (!formData.password) {
      setError('請輸入密碼');
      return false;
    }
    if (formData.password.length < 6) {
      setError('密碼長度至少需要6個字符');
      return false;
    }
    
    // 驗證確認密碼
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
      setSuccess(true); // 設置成功狀態
      setError(''); // 確保成功時清除任何錯誤訊息
      setCountdown(3); // 設置3秒倒數計時
    } catch (error) {
      console.error('註冊失敗:', error);
      console.error('錯誤完整信息:', JSON.stringify(error));
      console.error('錯誤代碼:', error.code);
      console.error('錯誤消息:', error.message);
      
      setSuccess(false); // 確保發生錯誤時重置成功狀態
      
      if (error.code) {
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
            setError(`註冊失敗: ${error.message || '請稍後再試'}`);
        }
      } else {
        setError(`註冊失敗: ${error.message || '請稍後再試'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box 
        sx={{ 
          mt: 8, 
          mb: 4,
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
            註冊新帳號
          </Typography>
          
          {success ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              <Alert severity="success" sx={{ width: '100%', mb: 3 }}>
                註冊成功！{countdown}秒後將自動跳轉至登入頁面。
              </Alert>
              <Button
                component={Link}
                to="/login"
                variant="contained"
                color="primary"
                sx={{ mt: 2, borderRadius: 2, py: 1, px: 4 }}
                state={{ from: 'register', success: true }}
              >
                立即前往登入
              </Button>
            </Box>
          ) : (
            <>
              {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
              
              <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: '100%' }}>
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
                  sx={{ mb: 2 }}
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
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="密碼（至少6個字符）"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
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
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="確認密碼"
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={toggleConfirmPasswordVisibility}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
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
                  sx={{ mt: 2, mb: 2, borderRadius: 2, py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : '註冊'}
                </Button>
              </Box>
              
              <Divider sx={{ width: '100%', my: 2 }} />
              
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <Button 
                  component={Link} 
                  to="/login" 
                  variant="text" 
                  size="small"
                >
                  已有帳號？點此登入
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 