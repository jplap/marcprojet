var express = require('express');
var router = express.Router();

// Require controller modules
var book_controller = require('../controllers/bookController');
var author_controller = require('../controllers/authorController');
var genre_controller = require('../controllers/genreController');
//var book_instance_controller = require('../controllers/bookinstanceController');

var training_controller = require('../controllers/trainingController');
var training_admin_controller = require('../controllers/trainingAdminController');

/* GET catalog home page. */
//router.get('/', book_controller.index);
router.get('/', training_controller.athlete_index);


/* GET request for creating a Book. NOTE This must come before routes that display Book (uses id) */
router.get('/book/create', book_controller.book_create_get);

/* POST request for creating Book. */
router.post('/book/create', book_controller.book_create_post);

/* GET request to delete Book. */
router.get('/book/:id/delete', book_controller.book_delete_get);

// POST request to delete Book
router.post('/book/:id/delete', book_controller.book_delete_post);

/* GET request to update Book. */
router.get('/book/:id/update', book_controller.book_update_get);

// POST request to update Book
router.post('/book/:id/update', book_controller.book_update_post);

/* GET request for one Book. */
router.get('/book/:id', book_controller.book_detail);

/* GET request for list of all Book items. */
router.get('/books', book_controller.book_list);


/// AUTHOR ROUTES ///

/* GET request for creating Author. NOTE This must come before route for id (i.e. display author) */
router.get('/author/create', author_controller.author_create_get);

/* POST request for creating Author. */
router.post('/author/create', author_controller.author_create_post);

/* GET request to delete Author. */
router.get('/author/:id/delete', author_controller.author_delete_get);

// POST request to delete Author
router.post('/author/:id/delete', author_controller.author_delete_post);

/* GET request to update Author. */
router.get('/author/:id/update', author_controller.author_update_get);

// POST request to update Author
router.post('/author/:id/update', author_controller.author_update_post);

/* GET request for one Author. */
router.get('/author/:id', author_controller.author_detail);

/* GET request for list of all Authors. */
router.get('/authors', author_controller.author_list);

 
/// GENRE ROUTES ///

/* GET request for creating a Genre. NOTE This must come before route that displays Genre (uses id) */
router.get('/genre/create', genre_controller.genre_create_get);

/* POST request for creating Genre. */
router.post('/genre/create', genre_controller.genre_create_post);

/* GET request to delete Genre. */
router.get('/genre/:id/delete', genre_controller.genre_delete_get);

// POST request to delete Genre
router.post('/genre/:id/delete', genre_controller.genre_delete_post);

/* GET request to update Genre. */
router.get('/genre/:id/update', genre_controller.genre_update_get);

// POST request to update Genre
router.post('/genre/:id/update', genre_controller.genre_update_post);

/* GET request for one Genre. */
router.get('/genre/:id', genre_controller.genre_detail);

/* GET request for list of all Genre. */
router.get('/genres', genre_controller.genre_list);

/// Marc ROUTES ///
/* GET catalog home page. */
router.get('/training/athlete/index', training_controller.athlete_mainpage);
router.get('/training/athlete/index/register', training_controller.athlete_register_get);
router.post('/training/athlete/index/register', training_controller.athlete_register_post);
router.get('/training/athlete/index/connect', training_controller.athlete_connect_get);
router.post('/training/athlete/index/connect', training_controller.athlete_connect_post);
//router.get('/training/athlete/:athleteid/training/objectives/inprogress', training_controller.athlete_objective_list_inprogress);
//router.get('/training/athlete/:athleteid/training/objectives/finished', training_controller.athlete_objective_list_finished);

router.get('/training/athlete/:athleteid/training/detail', training_controller.athlete_detail); 
router.post('/training/athlete/:athleteid/training/fileupload', training_controller.training_controller_fileupload_post); 
router.post('/training/athlete/:athleteid/training/view', training_controller.training_controller_viewdata_post);
 
	
router.get('/training/athlete/:athleteid/training/objectives/create', training_controller.athlete_objective_create_get);
router.post('/training/athlete/:athleteid/training/objectives/create', training_controller.athlete_objective_create_post);

router.get('/training/athlete/:athleteid/training/objective/:id', training_controller.athlete_objective_detail);
router.get('/training/athlete/:athleteid/training/objective/:id/delete', training_controller.athlete_objective_delete_get);
router.post('/training/athlete/:athleteid/training/objective/:id/delete', training_controller.athlete_objective_delete_post);
router.get ('/training/athlete/:athleteid/training/objective/:id/update', training_controller.athlete_objective_update_get);
router.post('/training/athlete/:athleteid/training/objective/:id/update', training_controller.athlete_objective_update_post);
router.get('/training/athlete/:athleteid/training/objectives', training_controller.athlete_objective_list_get);
router.post('/training/athlete/:athleteid/training/objectives', training_controller.athlete_objective_list_post);
router.get('/training/athlete/:athleteid/training', training_controller.athlete_training);
/* GET request for one athlete. */


//router.get('/training/athlete/index/:id', training_controller.athlete_detail);

router.get('/training/athlete/:athleteid/disconnect', training_controller.athlete_disconnect);

//router.get('/training/athletes', training_controller.athlete_list);
router.get('/training/athlete/admin', training_admin_controller.athlete_admin_mainpage);
 


 

module.exports = router;