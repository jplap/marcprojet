var express = require('express');
var router = express.Router();



var training_session_controller = require('../controllers/sessionController');

// creation d'une session d'entrainement
router.get('/training/athlete/:athleteid/session', training_session_controller.session_create_get);
router.post('/training/athlete/:athleteid/session', training_session_controller.session_create_post);
// liste des sessions d'entrainement
router.get('/training/athlete/:athleteid/sessions', training_session_controller.session_list);
// detail d'une session 
router.get('/training/athlete/:athleteid/session/:sessionid', training_session_controller.session_detail);
// liste des objectifs d'une session 
router.get('/training/athlete/:athleteid/session/:sessionid/objectives', training_session_controller.session_objective_list);
router.post('/training/athlete/:athleteid/session/:sessionid/objectives', training_session_controller.session_objective_list);



// Ajout d'un objectif a une session
router.get('/training/athlete/:athleteid/session/:sessionid/objective', training_session_controller.session_add_objective_get);
router.post('/training/athlete/:athleteid/session/:sessionid/objective', training_session_controller.session_add_objective_post);
// get objective
router.get('/training/athlete/:athleteid/session/:sessionid/objective/:objectiveid', training_session_controller.session_objective_get);
// update d'un objectif
router.get('/training/athlete/:athleteid/session/:sessionid/objective/:objectiveid/update', training_session_controller.session_update_objective_get);
router.post('/training/athlete/:athleteid/session/:sessionid/objective/:objectiveid/update', training_session_controller.session_update_objective_post);
router.post('/training/athlete/:athleteid/session/:sessionid/objective/:objectiveid/fileupload', training_session_controller.session_update_fileupload_objective_post);
router.post('/training/athlete/:athleteid/session/:sessionid/objective/:objectiveid/view', training_session_controller.session_update_viewdata_objective_post);
// delete d'un objectif
router.get('/training/athlete/:athleteid/session/:sessionid/objective/:objectiveid/delete', training_session_controller.session_objective_delete_get);
router.post('/training/athlete/:athleteid/session/:sessionid/objective/:objectiveid/delete', training_session_controller.session_objective_delete_post);
 




 

module.exports = router;