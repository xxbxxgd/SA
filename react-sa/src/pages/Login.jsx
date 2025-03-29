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

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
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

  return (
    <Container component="main" maxWidth="xs">
      <Box 
        sx={{ 
          mt: 8, 
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
            登入
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
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="密碼"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? '登入中...' : '登入'}
            </Button>
            <Grid container>
              <Grid item xs>
                <Button 
                  component={Link} 
                  to="/forgot-password" 
                  variant="text" 
                  size="small"
                >
                  忘記密碼？
                </Button>
              </Grid>
              <Grid item>
                <Button 
                  component={Link} 
                  to="/register" 
                  variant="text" 
                  size="small"
                >
                  還沒有帳號？點此註冊
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