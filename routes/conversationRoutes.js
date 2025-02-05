const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

// ... existing code ...

router.post('/create', auth, conversationController.createOrGetConversation);
router.get('/user-conversations', auth, conversationController.getUserConversations);

// Routes pour les messages
router.post('/message', auth, messageController.sendMessage);
router.get('/conversation/:conversationId', auth, messageController.getConversationMessages);

// ... existing code ...

module.exports = router; 