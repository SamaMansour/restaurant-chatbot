/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import { ChatbotEngine } from '../bot/chatbotEngine';

const router = express.Router();
const chatbot = new ChatbotEngine();

router.post('/message', async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing sessionId or message',
      });
    }

    const response = await chatbot.processMessage(sessionId, message);

    res.json({
      success: true,
      data: { response },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

export default router;
