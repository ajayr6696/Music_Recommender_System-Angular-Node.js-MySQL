var express = require('express');
var router = express.Router();
const contentRecommenderController = require('../controllers/contentRecomender');
const authorize = require('../middlewares/authorize');

router.get('/', contentRecommenderController.fetchSongsList);
router.get('/likedSongs', contentRecommenderController.fetchLikedSongsList);
router.post('/recommendations', contentRecommenderController.fetchRecommendation);
router.post('/login', contentRecommenderController.performLogin);
router.post('/removeLikedSong', contentRecommenderController.removeFromLikedSongs);
router.post('/addLikedSong', contentRecommenderController.addToLikedSongs);

module.exports = router;
