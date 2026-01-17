import { useEffect, useState } from 'react';
import axios from 'axios';

interface Order {
  id: number;
  orderNo: string;
  buyerName: string | null;
  status: string;
  deliveryContent: string | null;
  createdAt: string;
  product: { name: string } | null;
}

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders');
      setOrders(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = {
    total: orders.length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    pending: orders.filter(o => o.status !== 'shipped').length,
    revenue: '¥' + orders.reduce((acc, curr) => acc + (parseFloat(curr.product?.name?.match(/\d+/) ? '0' : '0') || 0), 0).toFixed(2) // 简化版估算，实际应该从订单取价格
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">仪表盘</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500 mb-2">总订单数</div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500 mb-2">已发货</div>
          <div className="text-3xl font-bold text-green-600">{stats.shipped}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500 mb-2">待处理</div>
          <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900">最近订单</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">订单号</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">买家</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">发货内容</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderNo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.product?.name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.buyerName || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    order.status === 'shipped' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs" title={order.deliveryContent || ''}>
                  {order.deliveryContent || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">暂无订单</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
