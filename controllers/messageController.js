const Message = require('../models/message');
const Conversation = require('../models/conversation');
const Listing = require('../models/listing');

exports.sendMessage = async (req, res) => {
  try {
    const { listingId, content, conversationId } = req.body;
    const senderId = req.user._id;

    // Récupérer l'annonce pour obtenir le sellerId
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Annonce non trouvée" });
    }

    let conversation;

    // Si un conversationId est fourni, utiliser cette conversation existante
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation non trouvée" });
      }

      // Vérifier que l'utilisateur fait partie de cette conversation
      if (conversation.buyerId.toString() !== senderId.toString() && 
          conversation.sellerId.toString() !== senderId.toString()) {
        return res.status(403).json({ message: "Non autorisé à accéder à cette conversation" });
      }
    } else {
      // Si pas de conversationId, chercher ou créer une nouvelle conversation
      if (listing.userId.toString() === senderId.toString()) {
        // Le vendeur ne peut pas initier une conversation
        return res.status(400).json({ message: "Le vendeur ne peut pas initier une conversation" });
      }

      // Chercher une conversation existante pour cet acheteur spécifique
      conversation = await Conversation.findOne({
        listingId,
        buyerId: senderId,
        sellerId: listing.userId
      });

      // Si aucune conversation n'existe, en créer une nouvelle
      if (!conversation) {
        conversation = await Conversation.create({
          listingId,
          buyerId: senderId,
          sellerId: listing.userId,
          messages: []
        });
      }
    }

    // Ajouter le nouveau message à la conversation
    const newMessage = {
      sender: senderId,
      content,
      timestamp: new Date()
    };

    conversation.messages.push(newMessage);
    await conversation.save();

    // Peupler les informations de l'utilisateur pour la réponse
    await conversation.populate('buyerId', 'name');
    await conversation.populate('sellerId', 'name');
    await conversation.populate('listingId', 'title');

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    res.status(500).json({ message: "Erreur lors de l'envoi du message" });
  }
};

exports.getConversationMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      $or: [
        { buyerId: userId },
        { sellerId: userId }
      ]
    })
    .populate('buyerId', 'name')
    .populate('sellerId', 'name')
    .populate('listingId', 'title');

    if (!conversation) {
      return res.status(404).json({ message: "Conversation non trouvée" });
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des messages" });
  }
}; 
}; 