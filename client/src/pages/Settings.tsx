import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Settings() {
  const [status, setStatus] = useState('stopped');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [lastLog, setLastLog] = useState('');

  const fetchStatus = async () => {
    try {
      const res = await axios.get('/api/driver/status');
      setStatus(res.data.status);
      setQrCode(res.data.qrCode);
      setLastLog(res.data.lastLog);
    } catch (error) {
      console.error(error);
    }
  };

  const startDriver = async () => {
    try {
      await axios.post('/api/driver/start');
      fetchStatus();
    } catch (error) {
      alert('Failed to start driver');
    }
  };

  const stopDriver = async () => {
    try {
      await axios.post('/api/driver/stop');
      fetchStatus();
    } catch (error) {
      alert('Failed to stop driver');
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">系统设置 & 状态</h2>
      
      <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
        <h3 className="text-lg font-medium mb-4">自动发货驱动</h3>
        
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <span className="text-gray-700">当前状态:</span>
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
              ${status === 'running' ? 'bg-green-100 text-green-800' : 
                status === 'waiting_login' ? 'bg-yellow-100 text-yellow-800' :
                status === 'error' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
              {status.toUpperCase()}
            </span>
          </div>

          <div className="flex space-x-4">
            <button 
              onClick={startDriver}
              disabled={status !== 'stopped' && status !== 'error'}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:bg-gray-400"
            >
              启动驱动
            </button>
            <button 
              onClick={stopDriver}
              disabled={status === 'stopped'}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none disabled:bg-gray-400"
            >
              停止驱动
            </button>
          </div>
        </div>

        {status === 'waiting_login' && qrCode && (
          <div className="mb-6 border-t pt-4">
            <h4 className="text-md font-medium mb-2 text-center text-red-600">请使用手机淘宝/闲鱼扫码登录</h4>
            <div className="flex justify-center">
              <img src={qrCode} alt="Login QR Code" className="border rounded shadow-sm max-w-xs" />
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">最新日志</h4>
          <pre className="bg-gray-100 p-2 rounded text-xs text-gray-600 overflow-x-auto">
            {lastLog || '暂无日志'}
          </pre>
        </div>
      </div>
    </div>
  );
}
