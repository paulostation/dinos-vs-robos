var express = require('express');
var router = express.Router();

/* GET home page. */
router.put('/', function(req, res, next) {
    let obj = req.body;
    res.io.sockets.emit("add_dino", obj);
    
    res.send("OK");
});

/* GET home page. */
router.put('/forward', function(req, res, next) {
    let obj = req.body;
    res.io.sockets.emit("move_forward", obj);
    
    res.send("OK");
});


module.exports = router;
