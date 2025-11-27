const express = require('express');
const router = express.Router();
const portfolioCollectionController = require('../controllers/portfolioCollection.controller');
const { protect } = require('../middleware/auth.middleware');

// Protected routes (require authentication)
router.use(protect);

// Get all collections for authenticated user
router.get('/', portfolioCollectionController.getCollections);

// Create new collection
router.post('/', portfolioCollectionController.createCollection);

// Get single collection
router.get('/:id', portfolioCollectionController.getCollection);

// Update collection
router.put('/:id', portfolioCollectionController.updateCollection);

// Delete collection
router.delete('/:id', portfolioCollectionController.deleteCollection);

// Get public collections for a user (can be accessed by other users)
router.get('/user/:userId/public', portfolioCollectionController.getUserPublicCollections);

module.exports = router;
