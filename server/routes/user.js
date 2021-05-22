const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');


//create, find, update, delete
//Home Page
router.get('/', itemController.view);

router.post('/posSubmit', itemController.posSubmit);

// Item Addition
router.get('/addItem', itemController.form);
router.post('/addItem', itemController.addItem);

router.get('/edititem/:itemID', itemController.edit_item);
router.post('/edititem/:itemID', itemController.edit_master);

// stock addition
router.get('/updateItem', itemController.showItem);
router.post('/updateItem', itemController.updateItem);

// Item Deletion
router.get('/:itemID', itemController.itemDelete);

router.get('/addItem/:itemID', itemController.delete);


/*
router.post('/', userController.find);


router.get('/adduser', userController.form);
router.post('/adduser', userController.adduser);

router.get('/edituser/:id', userController.edituser);
router.post('/edituser/:id', userController.updateuser);
router.get('/viewuser/:id', userController.viewuser);
router.get('/:id', userController.delete);

*/

/*
//router
router.get('',(req,res) => {
    res.render('home');
});*/

module.exports=router;