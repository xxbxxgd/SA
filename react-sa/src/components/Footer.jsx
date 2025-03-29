import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Link, 
  Divider,
  Grid,
  IconButton
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';

const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 4, 
        px: 2, 
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100]
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              輔仁大學外宿生二手交易平台
            </Typography>
            <Typography variant="body2" color="text.secondary">
              為輔仁大學外宿生提供可靠、便捷的二手交易服務，
              讓閒置物品找到新主人，讓需求得到滿足。
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              快速連結
            </Typography>
            <Link href="/" color="inherit" display="block" sx={{ mb: 1 }}>
              首頁
            </Link>
            <Link href="/about" color="inherit" display="block" sx={{ mb: 1 }}>
              關於我們
            </Link>
            <Link href="/terms" color="inherit" display="block" sx={{ mb: 1 }}>
              使用條款
            </Link>
            <Link href="/privacy" color="inherit" display="block">
              隱私政策
            </Link>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              聯絡我們
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              電子郵件: contact@fjusecondhand.com
            </Typography>
            <Box>
              <IconButton aria-label="facebook">
                <FacebookIcon />
              </IconButton>
              <IconButton aria-label="instagram">
                <InstagramIcon />
              </IconButton>
              <IconButton aria-label="twitter">
                <TwitterIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {new Date().getFullYear()}
          {' 輔仁大學外宿生二手交易平台. All rights reserved.'}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 