import React, { useState } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // 輔大宿舍列表
  const dormitoryOptions = [
    { value: '文園宿舍', label: '文園宿舍' },
    { value: '格物學苑宿舍', label: '格物學苑宿舍' },
    { value: '信義和平學苑宿舍', label: '信義和平學苑宿舍' },
    { value: '立言學苑宿舍', label: '立言學苑宿舍' },
    { value: '宜聖學苑宿舍', label: '宜聖學苑宿舍' },
    { value: '其他', label: '其他' }
  ];

  // 處理圖片上傳預覽
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 5) {
      setError('最多只能上傳5張圖片');
      return;
    }
    
    // 檢查文件大小
    for (const file of files) {
      if (file.size > 2 * 1024 * 1024) { // 2MB上限
        setError('圖片大小不能超過2MB');
        return;
      }
    }
    
    setImageFiles(files);
    setError(''); // 清除錯誤消息
    
    // 創建預覽
    const previewURLs = [];
    
    files.forEach((file) => {
      const fileReader = new FileReader();
      
      fileReader.onload = () => {
        previewURLs.push(fileReader.result);
        if (previewURLs.length === files.length) {
          setImages(previewURLs);
        }
      };
      
      fileReader.readAsDataURL(file);
    });
  };

  // 壓縮圖片並轉換為Base64
  const compressAndConvertToBase64 = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          // 創建canvas進行壓縮
          const canvas = document.createElement('canvas');
          // 設定適當的尺寸，控制大小，最大寬度或高度為800像素
          const MAX_SIZE = 800;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // 壓縮為JPEG，品質0.7（70%）
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedBase64);
        };
      };
    });
  };

  // 處理所有圖片壓縮
  const convertImagesToBase64 = async () => {
    const compressedImages = [];
    
    for (const file of imageFiles) {
      const compressed = await compressAndConvertToBase64(file);
      compressedImages.push(compressed);
    }
    
    return compressedImages;
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
      
      if (!name || !price || !category || !stock || !location) {
        throw new Error('請填寫所有必填欄位');
      }
      
      if (imageFiles.length === 0) {
        throw new Error('請上傳至少一張商品圖片');
      }
      
      if (!category || category === '') {
        throw new Error('請選擇有效的商品分類');
      }
      
      // 壓縮並獲取Base64圖片數據
      const imageBase64List = await convertImagesToBase64();
      
      // 直接將產品數據與圖片一起保存到Firestore
      const productData = {
        name,
        description,
        price: Number(price),
        category,
        stock: Number(stock),
        location,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || '未知用戶',
        images: imageBase64List  // 存儲壓縮後的Base64圖片
      };
      
      await addDoc(collection(db, 'products'), productData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/my-products');
      }, 2000);
    } catch (err) {
      setError(err.message);
      console.error('添加產品錯誤:', err);
    } finally {
      setLoading(false);
    }
  };

  // 處理類別選擇變更
  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setCategory(selectedCategory);
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
            onChange={handleCategoryChange}
            required
          >
            <option value="">選擇類別</option>
            <option value="家具家電">家具家電</option>
            <option value="書籍教材">書籍教材</option>
            <option value="生活用品">生活用品</option>
            <option value="3C產品">3C產品</option>
            <option value="服飾">服飾</option>
            <option value="交通工具">交通工具</option>
            <option value="美妝保養">美妝保養</option>
            <option value="其他">其他</option>
          </Form.Select>
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>宿舍位置 *</Form.Label>
          <Form.Select 
            value={location} 
            onChange={(e) => setLocation(e.target.value)}
            required
          >
            <option value="">選擇宿舍位置</option>
            {dormitoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
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
            最多可上傳5張圖片，每張不超過2MB
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