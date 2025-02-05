exports.createOrGetConversation = async (req, res) => {
  try {
    const { listingId } = req.body;
    const buyerId = req.user._id; // L'utilisateur connecté est l'acheteur

    // Récupérer l'annonce pour obtenir le sellerId
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Annonce non trouvée" });
    }

    // Recherche d'une conversation existante spécifique à cet acheteur
    let conversation = await Conversation.findOne({
      listingId,
      buyerId,
      sellerId: listing.userId
    });

    // Si aucune conversation n'existe pour cet acheteur, en créer une nouvelle
    if (!conversation) {
      conversation = await Conversation.create({
        listingId,
        buyerId,
        sellerId: listing.userId,
        messages: []
      });
    }

    // Peupler les informations nécessaires
    await conversation.populate('buyerId', 'name');
    await conversation.populate('sellerId', 'name');
    await conversation.populate('listingId', 'title');

    res.status(200).json(conversation);
  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error);
    res.status(500).json({ message: "Erreur lors de la création de la conversation" });
  }
};

exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Récupère toutes les conversations où l'utilisateur est soit vendeur soit acheteur
    const conversations = await Conversation.find({
      $or: [
        { sellerId: userId },
        { buyerId: userId }
      ]
    })
    .populate('buyerId', 'name')
    .populate('sellerId', 'name')
    .populate('listingId', 'title')
    .sort({ 'messages.timestamp': -1 });

    res.status(200).json(conversations);
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des conversations" });
  }
}; 