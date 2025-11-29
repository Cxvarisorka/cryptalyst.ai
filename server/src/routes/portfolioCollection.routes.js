const express = require('express');
const router = express.Router();
const portfolioCollectionController = require('../controllers/portfolioCollection.controller');
const { protect } = require('../middleware/auth.middleware');

// Public routes (accessible to all authenticated users)
// Get public collections for a user
router.get('/user/:userId/public', protect, portfolioCollectionController.getUserPublicCollections);

// Get a single public collection with its assets
router.get('/public/:collectionId', protect, portfolioCollectionController.getPublicCollection);

// Protected routes (require authentication and ownership)
// Get all collections for authenticated user
router.get('/', protect, portfolioCollectionController.getCollections);

// Create new collection
router.post('/', protect, portfolioCollectionController.createCollection);

// Get single collection
router.get('/:id', protect, portfolioCollectionController.getCollection);

// Update collection
router.put('/:id', protect, portfolioCollectionController.updateCollection);

// Delete collection
router.delete('/:id', protect, portfolioCollectionController.deleteCollection);

module.exports = router;
