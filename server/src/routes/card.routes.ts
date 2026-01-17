import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Add cards (batch)
router.post('/', async (req, res) => {
  try {
    const { productId, content } = req.body;
    // content might be multiline
    const lines = content.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
    
    if (lines.length === 0) {
      return res.status(400).json({ error: 'No content provided' });
    }

    const createdCards = [];
    for (const line of lines) {
      const card = await prisma.card.create({
        data: {
          productId: Number(productId),
          content: line
        }
      });
      createdCards.push(card);
    }
    
    res.json({ message: `Added ${createdCards.length} cards`, count: createdCards.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add cards' });
  }
});

// Get cards by product
router.get('/', async (req, res) => {
  try {
    const { productId } = req.query;
    const where = productId ? { productId: Number(productId) } : {};
    
    const cards = await prisma.card.findMany({
      where,
      include: { product: true },
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit for performance
    });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

export const cardRouter = router;
