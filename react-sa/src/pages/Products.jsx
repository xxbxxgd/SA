import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const productsData = [];
        querySnapshot.forEach((doc) => {
          productsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setProducts(productsData);
      } catch (err) {
        console.error('獲取商品錯誤:', err);
        setError('無法載入商品。請稍後再試。');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">載入中...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="alert alert-danger">{error}</div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>商品列表</h2>
        {currentUser && (
          <Link to="/add-product">
            <Button variant="primary">上架新商品</Button>
          </Link>
        )}
      </div>
      
      {products.length === 0 ? (
        <div className="text-center py-5">
          <p>目前沒有上架的商品。</p>
          {currentUser && (
            <Link to="/add-product">
              <Button variant="primary">上架新商品</Button>
            </Link>
          )}
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {products.map((product) => (
            <Col key={product.id}>
              <Card className="h-100">
                <Card.Img 
                  variant="top" 
                  src={product.images && product.images.length > 0 ? product.images[0] : "https://via.placeholder.com/300x200?text=無圖片"} 
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <Card.Body>
                  <Card.Title>{product.name}</Card.Title>
                  <Card.Text className="text-truncate">{product.description || "無描述"}</Card.Text>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fs-5 fw-bold text-primary">NT$ {product.price}</span>
                    <span className="badge bg-secondary">庫存: {product.stock}</span>
                  </div>
                </Card.Body>
                <Card.Footer>
                  <Link to={`/product/${product.id}`}>
                    <Button variant="outline-primary" className="w-100">查看詳情</Button>
                  </Link>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Products; 