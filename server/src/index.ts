import express from 'express';
import cors from 'cors';
import path from 'path';
import { productRouter } from './routes/product.routes';
import { cardRouter } from './routes/card.routes';
import { orderRouter } from './routes/order.routes';
import { driverRouter } from './routes/driver.routes';
import { startScheduler } from './scheduler/auto-delivery';
import { xianyuDriver } from './core/xianyu-driver';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/products', productRouter);
app.use('/api/cards', cardRouter);
app.use('/api/orders', orderRouter);
app.use('/api/driver', driverRouter);

// Serve static files from client/dist in production
const clientDistPath = path.join(__dirname, '../../client/dist');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientDistPath));
  
  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start Scheduler
startScheduler();

// Auto start driver
xianyuDriver.start();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
