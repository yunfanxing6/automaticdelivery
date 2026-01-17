import { Router } from 'express';
import { xianyuDriver } from '../core/xianyu-driver';

const router = Router();

router.get('/status', (req, res) => {
  res.json({
    status: xianyuDriver.status,
    qrCode: xianyuDriver.qrCodeBase64,
    lastLog: xianyuDriver.lastLog
  });
});

router.post('/start', async (req, res) => {
  if (xianyuDriver.status === 'stopped' || xianyuDriver.status === 'error') {
    xianyuDriver.start(); // Async, don't wait
    res.json({ message: 'Driver starting...' });
  } else {
    res.json({ message: 'Driver already running or starting' });
  }
});

router.post('/stop', async (req, res) => {
  await xianyuDriver.stop();
  res.json({ message: 'Driver stopped' });
});

export const driverRouter = router;
