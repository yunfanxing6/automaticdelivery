import { useEffect, useState } from 'react';
import axios from 'axios';

interface Product {
  id: number;
  name: string;
}

export default function Cards() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [content, setContent] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpload = async () => {
    if (!selectedProduct || !content) return;
    try {
      await axios.post('/api/cards', {
        productId: parseInt(selectedProduct),
        content
      });
      alert('Cards uploaded successfully');
      setContent('');
    } catch (error) {
      alert('Failed to upload cards');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">库存/卡密管理</h2>
      
      <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">选择商品</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              value={selectedProduct}
              onChange={e => setSelectedProduct(e.target.value)}
            >
              <option value="">请选择商品...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">卡密内容 (一行一个)</label>
            <textarea
              rows={10}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="CARD_KEY_001&#10;CARD_KEY_002&#10;..."
            />
          </div>

          <div>
            <button 
              onClick={handleUpload}
              disabled={!selectedProduct || !content}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            >
              上传卡密
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
