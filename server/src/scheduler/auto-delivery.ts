import schedule from 'node-schedule';
import { PrismaClient } from '@prisma/client';
import { xianyuDriver } from '../core/xianyu-driver';

const prisma = new PrismaClient();

// Use the real driver
const driver = xianyuDriver;

export function startScheduler() {
  // Start the driver (browser) if not running
  // In production, we might want to wait for manual start via UI to scan QR code
  // But we can try to start it here.
  // driver.start(); 
  
  // Run every 30 seconds
  schedule.scheduleJob('*/30 * * * * *', async () => {
    try {
      await checkAndDeliver();
    } catch (error) {
      console.error('Scheduler error:', error);
    }
  });
  console.log('Auto delivery scheduler started');
}

async function checkAndDeliver() {
  const newOrders = await driver.checkOrders();
  
  for (const orderData of newOrders) {
    const { orderNo, buyerName, productTitle } = orderData;
    
    // Check if order exists
    const existing = await prisma.order.findUnique({ where: { orderNo } });
    if (existing) continue;

    console.log(`Processing new order: ${orderNo}`);

    // Find matching product
    // We get all auto-delivery products and check keywords
    // Optimization: In real app, might want to be more specific
    const products = await prisma.product.findMany({ where: { autoDelivery: true } });
    const matchedProduct = products.find(p => productTitle.includes(p.keyword));

    const newOrder = await prisma.order.create({
      data: {
        orderNo,
        buyerName,
        status: 'pending',
        productId: matchedProduct?.id
      }
    });

    if (matchedProduct) {
      // Find a card
      const card = await prisma.card.findFirst({
        where: { productId: matchedProduct.id, isUsed: false }
      });

      if (card) {
        // Send delivery
        const success = await driver.sendMessage(orderNo, `Automatic Delivery: ${card.content}`);
        if (success) {
          await driver.markShipped(orderNo);
          
          // Update database
          await prisma.$transaction([
            prisma.card.update({
              where: { id: card.id },
              data: { isUsed: true }
            }),
            prisma.order.update({
              where: { id: newOrder.id },
              data: {
                status: 'shipped',
                deliveryContent: card.content,
                cardId: card.id
              }
            })
          ]);
          console.log(`Order ${orderNo} shipped successfully.`);
        }
      } else {
        console.warn(`No stock for product ${matchedProduct.name} (Order ${orderNo})`);
      }
    } else {
      console.warn(`No matching product for order ${orderNo} (Title: ${productTitle})`);
    }
  }
}
