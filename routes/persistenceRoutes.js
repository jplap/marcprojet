var express = require('express');
var router = express.Router();

// Require controller modules
var persistency = require('../controllers/persistency');
 
 
//router.get('/persistency', persistency.persistency_index); 
router.get('/set/:key/:value', persistency.persistency_set);

router.get('/cache/:athleteid/appli/:appliname/hset/:name/:value', persistency.persistency_hset);
router.get('/cache/:athleteid/appli/:appliname/hget/:name', persistency.persistency_hget);
router.get('/cache/:athleteid/appli/:appliname/hgetall', persistency.persistency_hgetall);



/**
  *
  *   Pile de sauvegarde
  */

  
  
  
  
/**
 *  stocker key/value Fifo
 */
router.post('/cache/:athleteid/appli/:appliname/lpush', persistency.persistency_lpush_post);
router.get('/cache/:athleteid/appli/:appliname/lpush', persistency.persistency_lpush_get);

/**
 * lire valeur en fct de key dans fifo
 */
router.get('/cache/:athleteid/appli/:appliname/lpop', persistency.persistency_lpop);


/**
 *  vider la pile et supprimer la key
 */
router.get('/cache/:athleteid/appli/:appliname/del', persistency.persistency_del); 
 
/**
 *
 * La pile existe-elle
 */
router.get('/cache/:athleteid/appli/:appliname/keys', persistency.persistency_keys);
/**
 *
 *  Nombre d'elements dans la pile
 */
router.get('/cache/:athleteid/appli/:appliname/llen', persistency.persistency_llen);




 

module.exports = router;