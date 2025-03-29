import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Spinner, Alert, Carousel } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProduct({
            id: docSnap.id,
            ...docSnap.data()
          });
        } else {
          setError('找不到該商品。');
        }
      } catch (err) {
        console.error('獲取商品詳情錯誤:', err);
        setError('無法載入商品詳情。請稍後再試。');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [id]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">載入中...</span>
        </Spinner>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || '無法載入商品。'}</Alert>
        <Button variant="primary" onClick={() => navigate('/products')}>
          返回商品列表
        </Button>
      </Container>
    );
  }

  const isOwner = currentUser && currentUser.uid === product.userId;

  return (
    <Container className="py-5">
      <Button variant="outline-secondary" className="mb-4" onClick={() => navigate('/products')}>
        返回商品列表
      </Button>
      
      <Row>
        <Col md={6} className="mb-4">
          {product.images && product.images.length > 0 ? (
            <Carousel>
              {product.images.map((image, index) => (
                <Carousel.Item key={index}>
                  <img
                    className="d-block w-100"
                    src={image}
                    alt={`${product.name} - 圖片 ${index + 1}`}
                    style={{ height: '400px', objectFit: 'contain', backgroundColor: '#f8f9fa' }}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          ) : (
            <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '400px' }}>
              <p className="text-muted">無圖片</p>
            </div>
          )}
        </Col>
        
        <Col md={6}>
          <h2 className="mb-3">{product.name}</h2>
          
          <div className="mb-4">
            <h3 className="text-primary fs-2 fw-bold">NT$ {product.price}</h3>
            <span className={`badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
              {product.stock > 0 ? `庫存: ${product.stock}` : '售罄'}
            </span>
            <span className="ms-2 badge bg-secondary">{product.category}</span>
          </div>
          
          <div className="mb-4">
            <h5>商品描述:</h5>
            <p className="text-muted">{product.description || '無描述'}</p>
          </div>
          
          <div className="d-grid gap-2">
            {isOwner ? (
              <>
                <Button variant="warning" onClick={() => navigate(`/edit-product/${product.id}`)}>
                  編輯商品
                </Button>
                <Button variant="danger">
                  下架商品
                </Button>
              </>
            ) : (
              <>
                <Button variant="primary" disabled={product.stock <= 0}>
                  {product.stock > 0 ? '加入購物車' : '售罄'}
                </Button>
                <Button variant="outline-primary" disabled={product.stock <= 0}>
                  立即購買
                </Button>
              </>
            )}
          </div>
        </Col>
      </Row>
      
      <hr className="my-5" />
      
      <Row>
        <Col>
          <h4>詳細規格</h4>
          <table className="table">
            <tbody>
              <tr>
                <th style={{ width: '150px' }}>商品類別</th>
                <td>{product.category}</td>
              </tr>
              <tr>
                <th>庫存</th>
                <td>{product.stock}</td>
              </tr>
              <tr>
                <th>上架日期</th>
                <td>
                  {product.createdAt ? 
                    (product.createdAt.toDate ? 
                      new Date(product.createdAt.toDate()).toLocaleDateString('zh-TW') : 
                      new Date(product.createdAt.seconds * 1000).toLocaleDateString('zh-TW')
                    ) : '無資料'
                  }
                </td>
              </tr>
            </tbody>
          </table>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetail; 