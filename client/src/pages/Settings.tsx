import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

export default function Settings() {
  const [status, setStatus] = useState('stopped');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [lastLog, setLastLog] = useState('');
  const [loading, setLoading] = useState(false);
  const [manualCookie, setManualCookie] = useState('');
  const logRef = useRef<HTMLPreElement>(null);

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
    setLoading(true);
    try {
      await axios.post('/api/driver/start');
      // Wait a bit for status to change
      setTimeout(fetchStatus, 1000);
    } catch (error) {
      alert('启动失败，请检查服务器日志');
    } finally {
      setLoading(false);
    }
  };

  const stopDriver = async () => {
    setLoading(true);
    try {
      await axios.post('/api/driver/stop');
      setTimeout(fetchStatus, 1000);
    } catch (error) {
      alert('停止失败');
    } finally {
      setLoading(false);
    }
  };

  const submitCookie = async () => {
    if (!manualCookie) return;
    try {
      await axios.post('/api/driver/cookie', { cookie: manualCookie });
      alert('Cookie 设置成功，驱动将自动运行');
      fetchStatus();
      setManualCookie('');
    } catch (error) {
      alert('Cookie 设置失败');
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  // Status badge color mapping
  const getStatusColor = (s: string) => {
    switch (s) {
      case 'running': return 'bg-green-100 text-green-800 ring-green-600/20';
      case 'waiting_login': return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
      case 'starting': return 'bg-blue-100 text-blue-800 ring-blue-600/20';
      case 'error': return 'bg-red-100 text-red-800 ring-red-600/20';
      default: return 'bg-gray-100 text-gray-800 ring-gray-600/20';
    }
  };

  const getStatusText = (s: string) => {
    switch (s) {
      case 'running': return '运行中 (已登录)';
      case 'waiting_login': return '等待扫码登录';
      case 'starting': return '启动中...';
      case 'error': return '发生错误';
      case 'stopped': return '已停止';
      default: return s.toUpperCase();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">系统设置 & 状态</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">自动发货驱动</h3>
              <p className="text-sm text-gray-500 mt-1">控制后台浏览器实例，用于监听订单和发送消息</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ring-1 ring-inset ${getStatusColor(status)}`}>
              {getStatusText(status)}
            </span>
          </div>
        </div>
        
        <div className="p-6 bg-gray-50/50">
          <div className="flex space-x-4 mb-8">
            <button 
              onClick={startDriver}
              disabled={status !== 'stopped' && status !== 'error' || loading}
              className={`flex-1 py-3 px-4 rounded-lg shadow-sm text-sm font-semibold text-white transition-all
                ${status !== 'stopped' && status !== 'error' 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow active:scale-[0.98]'}`}
            >
              {loading && status === 'stopped' ? '启动中...' : '启动服务'}
            </button>
            <button 
              onClick={stopDriver}
              disabled={status === 'stopped' || loading}
              className={`flex-1 py-3 px-4 rounded-lg shadow-sm text-sm font-semibold text-white transition-all
                ${status === 'stopped' 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-red-500 hover:bg-red-600 hover:shadow active:scale-[0.98]'}`}
            >
              {loading && status !== 'stopped' ? '停止中...' : '停止服务'}
            </button>
          </div>

          {status === 'waiting_login' && (
            <div className="mb-8 bg-white p-6 rounded-xl border border-yellow-200 shadow-sm text-center animate-fade-in">
              <div className="inline-block p-2 bg-white rounded-lg border border-gray-100 shadow-inner mb-4">
                {qrCode ? (
                  <img src={qrCode} alt="Login QR Code" className="w-64 h-64 object-contain" />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center text-gray-400 bg-gray-50">
                    正在获取二维码...
                  </div>
                )}
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">请使用手机淘宝/闲鱼扫码</h4>
              <p className="text-sm text-gray-500">二维码有效期较短，请尽快扫码。如果过期请重启驱动。</p>
            </div>
          )}

          <div className="bg-gray-900 rounded-lg overflow-hidden shadow-inner">
            <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
              <span className="text-xs font-mono text-gray-400">系统日志</span>
              <span className="flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-2 w-2 rounded-full opacity-75 ${status === 'running' ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${status === 'running' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
              </span>
            </div>
            <pre 
              ref={logRef}
              className="p-4 text-xs font-mono text-green-400 overflow-x-auto whitespace-pre-wrap h-48 scrollbar-thin scrollbar-thumb-gray-700"
            >
              {lastLog ? `> ${lastLog}` : '> 等待日志...'}
            </pre>
          </div>

          <div className="mt-8 border-t pt-8">
            <h4 className="text-md font-medium text-gray-900 mb-4">备用方案：手动 Cookie 登录</h4>
            <div className="flex gap-4">
                <input 
                  type="text" 
                  value={manualCookie}
                  onChange={(e) => setManualCookie(e.target.value)}
                  placeholder="在此粘贴 Cookie (格式: key=value; key2=value2)"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
                <button
                  onClick={submitCookie}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                >
                  提交 Cookie
                </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
                如果扫码登录失败，请在本地浏览器登录闲鱼/淘宝，按 F12 -> Network -> 刷新 -> 找到第一个请求 -> 复制 Request Headers 中的 Cookie 粘贴到此处。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
