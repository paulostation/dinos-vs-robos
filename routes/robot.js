var express = require('express');
var router = express.Router();

/* GET home page. */
router.put('/', function(req, res, next) {
    let obj = req.body;
    res.io.sockets.emit("add_robot", obj);
    
    res.send("OK");
});


module.exports = router;
