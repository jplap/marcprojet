var express = require('express');
var router = express.Router();

// Require controller modules
var video = require('../controllers/video');

 
 
router.get('/athlete/:athleteid/videos', video.list);

router.get('/athlete/:athleteid/add', video.addPanel);
router.get('/athlete/:athleteid/query', video.queryPanel);
 


//http://localhost:8082/video/athlete/59cecf6b3bdad328bca96c86/id/video/finale%20lCW%20LinDan?score=1510476207023&tags=[%22match%22]
router.post('/athlete/:athleteid/add/id/:bucket/:id', video.createItemWithTags);
 
router.delete('/athlete/:athleteid/delete/id/:bucket/:id', video.deleteId);


router.get('/athlete/:athleteid/getAllTags/id/:bucket/:id', video.getAllTagsFromId);


//Get all item ids in a bucket
router.get('/athlete/:athleteid/getAllIds/allids/:bucket', video.getAllIdsFromBucket);


//Return the IDs for one or more tags
//
// Liste des videos de buketname video de l'athleId correspondants a une operation (union ou inter   ) sur les tags ....
//  /video/athlete/' + athleteId + '/getTags/tags/' + data.bucket + '?type=' + currentOperationRequired + "&tags=" + JSON.stringify(tags)
router.get('/athlete/:athleteid/getTags/tags/:bucket', video.getTags);


router.get('/athlete/:athleteid/getTopTags/toptags/:bucket/:amount', video.getTopTags);


router.get('/athlete/:athleteid/getBuckets/buckets', video.getBuckets);


router.delete('/athlete/:athleteid/deleteBucket/bucket/:bucket', video.deleteBucket);


 
 

module.exports = router;