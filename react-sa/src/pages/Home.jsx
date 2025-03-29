import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Box } from '@mui/material';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';

const Home = ({ currentCategory }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let productQuery;
        
        if (currentCategory && currentCategory !== 'all') {
          productQuery = query(
            collection(db, 'products'),
            where('category', '==', currentCategory),
            orderBy('createdAt', 'desc'),
            limit(12)
          );
        } else {
          productQuery = query(
            collection(db, 'products'),
            orderBy('createdAt', 'desc'),
            limit(12)
          );
        }
        
        const querySnapshot = await getDocs(productQuery);
        const productsData = [];
        
        querySnapshot.forEach((doc) => {
          productsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setProducts(productsData);
      } catch (error) {
        console.error('獲取商品失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentCategory]);

  // 暫時的測試數據
  const dummyProducts = [
    {
      id: '1',
      name: '二手微波爐',
      price: 1200,
      category: '家具家電',
      location: '文舍',
      createdAt: new Date().toISOString(),
      imageUrl: 'https://via.placeholder.com/300x200?text=微波爐'
    },
    {
      id: '2',
      name: '商管數學課本',
      price: 350,
      category: '書籍教材',
      location: '文德宿舍',
      createdAt: new Date().toISOString(),
      imageUrl: 'https://via.placeholder.com/300x200?text=商管數學'
    },
    {
      id: '3',
      name: '腳踏車',
      price: 2500,
      category: '交通工具',
      location: '輔大周邊',
      createdAt: new Date().toISOString(),
      imageUrl: 'https://via.placeholder.com/300x200?text=腳踏車'
    },
    {
      id: '4',
      name: '二手筆電',
      price: 9800,
      category: '3C產品',
      location: '格物學苑宿舍',
      createdAt: new Date().toISOString(),
      imageUrl: 'https://via.placeholder.com/300x200?text=筆電'
    },
  ];

  // 使用測試數據，之後改為从Firestore獲取的數據
  const displayProducts = products.length > 0 ? products : dummyProducts;

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <SearchBar fullWidth />
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {currentCategory === 'all' || !currentCategory 
            ? '最新商品' 
            : `${currentCategory}商品`}
        </Typography>
        {loading ? (
          <Typography>載入中...</Typography>
        ) : (
          <Grid container spacing={3}>
            {displayProducts.map((product) => (
              <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default Home; 