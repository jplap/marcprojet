var express = require('express');
var router = express.Router();

// Require controller modules
var pubsub = require('../controllers/pubsub');



router.get('/athlete/:athleteid/:appliname/:name/panel', pubsub.pubsub_panel);
 
router.get('/:athleteid/appli/:appliname/:name/publish/:message', pubsub.pubsub_publish);
router.get('/:athleteid/appli/:appliname/:name/subscribe', pubsub.pubsub_subscribe);


module.exports = router;