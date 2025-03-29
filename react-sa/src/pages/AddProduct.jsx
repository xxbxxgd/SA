import React, { useState } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { collection, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // 處理圖片上傳預覽
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    
    const previewURLs = files.map(file => URL.createObjectURL(file));
    setImages(previewURLs);
  };

  // 上傳圖片到 Firebase Storage
  const uploadImages = async (productId) => {
    const imageUrls = [];
    
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const storageRef = ref(storage, `products/${productId}/${Date.now()}_${file.name}`);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      imageUrls.push(downloadURL);
    }
    
    return imageUrls;
  };

  // 提交表單
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!currentUser) {
        throw new Error('請先登入');
      }
      
      if (!name || !price || !category || !stock) {
        throw new Error('請填寫所有必填欄位');
      }
      
      if (imageFiles.length === 0) {
        throw new Error('請上傳至少一張商品圖片');
      }
      
      // 先加入產品到 Firestore
      const productData = {
        name,
        description,
        price: Number(price),
        category,
        stock: Number(stock),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userId: currentUser.uid,
        images: [] // 初始為空，稍後更新
      };
      
      const docRef = await addDoc(collection(db, 'products'), productData);
      
      // 上傳圖片並獲取 URL
      const imageUrls = await uploadImages(docRef.id);
      
      // 更新產品文檔添加圖片 URL
      await updateDoc(docRef, {
        images: imageUrls
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/products');
      }, 2000);
    } catch (err) {
      setError(err.message);
      console.error('添加產品錯誤:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <h2 className="mb-4">新增商品</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">商品已成功新增！正在跳轉...</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>商品名稱 *</Form.Label>
          <Form.Control 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            required 
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>商品描述</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={3} 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>價格 (NT$) *</Form.Label>
          <Form.Control 
            type="number" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)}
            required 
            min="0"
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>類別 *</Form.Label>
          <Form.Select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">選擇類別</option>
            <option value="electronics">電子產品</option>
            <option value="clothing">服飾</option>
            <option value="food">食品</option>
            <option value="books">書籍</option>
            <option value="toys">玩具</option>
            <option value="homeware">家居用品</option>
            <option value="other">其他</option>
          </Form.Select>
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>庫存數量 *</Form.Label>
          <Form.Control 
            type="number" 
            value={stock} 
            onChange={(e) => setStock(e.target.value)}
            required 
            min="0"
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>商品圖片 *</Form.Label>
          <Form.Control 
            type="file" 
            multiple
            onChange={handleImageChange}
            accept="image/*"
          />
          <Form.Text className="text-muted">
            最多可上傳5張圖片
          </Form.Text>
        </Form.Group>
        
        {images.length > 0 && (
          <div className="mb-3">
            <p>圖片預覽:</p>
            <div className="d-flex flex-wrap gap-2">
              {images.map((url, index) => (
                <img 
                  key={index} 
                  src={url} 
                  alt={`預覽 ${index + 1}`} 
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
                />
              ))}
            </div>
          </div>
        )}
        
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              <span className="ms-2">處理中...</span>
            </>
          ) : '上架商品'}
        </Button>
      </Form>
    </Container>
  );
};

export default AddProduct; 