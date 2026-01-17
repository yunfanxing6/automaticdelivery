import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Cards from './pages/Cards';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">咸鱼自动发货</h1>
            <nav className="flex space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900">仪表盘</Link>
              <Link to="/products" className="text-gray-600 hover:text-gray-900">商品管理</Link>
              <Link to="/cards" className="text-gray-600 hover:text-gray-900">库存管理</Link>
              <Link to="/settings" className="text-gray-600 hover:text-gray-900">系统设置</Link>
            </nav>
          </div>
        </header>
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/cards" element={<Cards />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
