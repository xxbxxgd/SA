import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Button, 
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOrder } from '../contexts/OrderContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import zhTW from 'date-fns/locale/zh-TW';

const SelectTransactionTime = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { createNewOrder } = useOrder();
  const { cartItems, clearCart } = useCart();
  const { currentUser } = useAuth();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!currentUser) {
        throw new Error('請先登入後再結帳');
      }

      if (cartItems.length === 0) {
        throw new Error('購物車是空的');
      }

      // 合併日期和時間
      const transactionDateTime = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes()
      );

      // 為每個商品創建訂單
      for (const item of cartItems) {
        const orderData = {
          productId: item.id,
          productName: item.name,
          price: item.price,
          quantity: item.quantity,
          sellerId: item.userId,
          sellerName: item.userName,
          imageUrl: item.imageUrl,
          transactionDateTime: transactionDateTime.toISOString(),
        };

        await createNewOrder(orderData);
      }

      // 清空購物車
      clearCart();
      
      // 跳轉到訂單頁面
      navigate('/orders');
    } catch (error) {
      setError(error.message || '創建訂單時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          選擇交易時間
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhTW}>
                <DatePicker
                  label="選擇日期"
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={new Date()}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhTW}>
                <TimePicker
                  label="選擇時間"
                  value={selectedTime}
                  onChange={(newValue) => setSelectedTime(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Typography color="error" align="center">
                  {error}
                </Typography>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/cart')}
                  disabled={loading}
                >
                  返回購物車
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? '處理中...' : '確認訂單'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default SelectTransactionTime; 