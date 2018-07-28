/*jshint esversion: 6 */
//----Constructors----//
var renderer = new THREE.WebGLRenderer({
    antialias: true
});
var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(
    camera_view_angle,
    aspect,
    near,
    far
);

//----Variables----//
//DOM element to attach the renderer to
var viewport;

//built-in three.js controls will be attached to this
var controls;

//viewport size
var viewportWidth = 1024;
var viewportHeight = 768;

//camera attributes
var camera_view_angle = 45,
    aspect = viewportWidth / viewportHeight,
    near = 0.1, //near clip-plane
    far = 10000; //far clip-plane

var robot_dae, skin;
var dino_dae;

let arena = {
    "_id": 423432423,
    "status": "in battle",
    "summarized_actions_qt": 6,
    "total_positions": 2500,
    "robots": [
        {
            "_id": "5b5cebb82469046585347dd0",
            "direction": "south",
            "pos_x": 0,
            "pos_y": 0
        },
        {
            "_id": "5b5cabb82469046585347dd0",
            "type": "robot",
            "direction": "north",
            "pos_x": 5,
            "pos_y": 7
        },
        {
            "_id": "5b5cad0d246904661a3f7d11",
            "type": "robot",
            "direction": "west",
            "pos_x": 7,
            "pos_y": 7
        },
        {
            "_id": "5b5cafe224690467e8b27f84",
            "type": "robot",
            "direction": "east",
            "pos_x": 8,
            "pos_y": 7
        }
    ],
    "dinos": [
        {
            "dino_id": 786786,
            "direction": "south",
            "pos_x": 4,
            "pos_y": 7
        }
    ]
};

function getDirection(obj) {
    switch (obj) {
        case "north": return 0;
        case "south": return Math.PI;
        case "west": return Math.PI / 2;
        case "east": return -Math.PI / 2;
        default: return 0;
    }
}

function addToScene(scene, id, pos_x, pos_y, type, direction) {

    let obj = {};

    if (type == "robot") {
        obj = robot_dae.clone();
        obj.scale.x = obj.scale.y = obj.scale.z = 0.04;
    } else {
        obj = dino_dae.clone();
        obj.scale.x = obj.scale.y = obj.scale.z = 0.1;
    }

    obj.position.set(pos_x, 0, pos_y);
    obj.position.x -= 25;
    obj.position.z -= 25;
    obj.position.x += 0.5;
    obj.position.z += 0.5;

    obj.rotation.z = getDirection(direction);

    obj.direction = direction;

    obj.updateMatrix();

    obj.name = id;

    scene.add(obj);
}

function removeFromScene(scene, objName) {

    let obj = scene.getObjectByName(objName);
    scene.remove(obj);
}

function turnLeft(scene, objName, callback) {
    let obj = scene.getObjectByName(objName);

    switch (obj.direction) {
        case "north": obj.direction = "west";
            break;
        case "south": obj.direction = "east";
            break;
        case "east": obj.direction = "north";
            break;
        case "west": obj.direction = "south";
            break;
    }

    let x = 0;

    let smoothness = 20;

    let intervalHandler = setInterval(() => {

        obj.rotation.z += ((Math.PI / 2) / smoothness);


        if (++x === smoothness) {
            clearInterval(intervalHandler);
            callback();
        }
    }, 1000 / smoothness);

}

function turnRight(scene, objName, callback) {
    let obj = scene.getObjectByName(objName);

    switch (obj.direction) {
        case "north": obj.direction = "east";
            break;
        case "south": obj.direction = "west";
            break;
        case "east": obj.direction = "south";
            break;
        case "west": obj.direction = "north";
            break;
    }

    let x = 0;

    let smoothness = 20;

    let intervalHandler = setInterval(() => {

        obj.rotation.z -= ((Math.PI / 2) / smoothness);


        if (++x === smoothness) {
            clearInterval(intervalHandler);
            callback();
        }
    }, 1000 / smoothness);
}

function moveForward(scene, objName, callback) {
    let obj = scene.getObjectByName(objName);

    let x = 0;

    let smoothness = 20;

    let intervalHandler = setInterval(() => {
        switch (obj.direction) {
            case "north": obj.position.z += 1 / smoothness;
                break;
            case "south": obj.position.z -= 1 / smoothness;
                break;
            case "east": obj.position.x -= 1 / smoothness;
                break;
            case "west": obj.position.x += 1 / smoothness;
                break;
        }
        if (++x === smoothness) {
            clearInterval(intervalHandler);
            callback();
        }
    }, 1000 / smoothness);
}

function moveBackward(scene, objName, callback) {
    let obj = scene.getObjectByName(objName);

    let x = 0;

    let smoothness = 20;

    let intervalHandler = setInterval(() => {
        switch (obj.direction) {
            case "north": obj.position.z -= 1 / smoothness;
                break;
            case "south": obj.position.z += 1 / smoothness;
                break;
            case "east": obj.position.x += 1 / smoothness;
                break;
            case "west": obj.position.x -= 1 / smoothness;
                break;
        }
        if (++x === smoothness) {
            clearInterval(intervalHandler);
            callback();
        }
    }, 1000 / smoothness);
}

var socket = io();
socket.on("add_dino", obj => {
    console.log("Adicionando novo dino")
    addToScene(scene, obj.id, obj.pos_x, obj.pos_y, "dino", obj.direction);
});

socket.on("add_robot", obj => {
    console.log("Adicionando novo robot")
    addToScene(scene, obj.id, obj.pos_x, obj.pos_y, "robot", obj.direction);
});

socket.on("move_forward", obj => {
    console.log("Adicionando novo robot")
    moveForward(scene, obj.id);
});


//a cross-browser method for efficient animation, more info at:
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

function initialize() {
    // Grid
    var size = 25, step = 1;
    var geometry = new THREE.Geometry();
    var material = new THREE.LineBasicMaterial({ color: 0xcccccc, opacity: 0.2 });
    for (var i = -size; i <= size; i += step) {
        geometry.vertices.push(new THREE.Vector3(- size, - 0.04, i));
        geometry.vertices.push(new THREE.Vector3(size, - 0.04, i));
        geometry.vertices.push(new THREE.Vector3(i, - 0.04, - size));
        geometry.vertices.push(new THREE.Vector3(i, - 0.04, size));
    }
    var line = new THREE.Line(geometry, material, THREE.LinePieces);
    scene.add(line);
    var light = new THREE.AmbientLight(0xA0A0A0);
    scene.add(light);

    //Sets up the renderer to the same size as a DOM element
    //and attaches it to that element
    renderer.setSize(viewportWidth, viewportHeight);
    viewport = document.getElementById('viewport');
    viewport.appendChild(renderer.domElement);

    camera.rotation.z += Math.PI;
    camera.rotation.x -= 2.5;
    camera.position.set(-20, 8, -31);

    //attaches fly controls to the camera
    controls = new THREE.FlyControls(camera);
    //camera control properties
    controls.movementSpeed = 0.1;
    controls.domElement = viewport;
    controls.rollSpeed = 0.01;
    controls.autoForward = false;
    controls.dragToLook = true;


    var loader = new THREE.ColladaLoader();
    loader.options.convertUpAxis = true;
    loader.load('models/robot_1.dae', function (collada) {

        robot_dae = collada.scene;

        arena.robots.forEach(robot => {

            let robot_obj = {};

            robot_obj = robot_dae.clone();

            robot_obj.scale.x = robot_obj.scale.y = robot_obj.scale.z = 0.04;


            robot_obj.position.set(robot.pos_x, 0, robot.pos_y);
            robot_obj.position.x -= 25;
            robot_obj.position.z -= 25;
            robot_obj.position.x += 0.5;
            robot_obj.position.z += 0.5;

            robot_obj.rotation.z = getDirection(robot.direction);

            robot_obj.direction = robot.direction;

            robot_obj.updateMatrix();

            robot_obj.name = robot._id;

            scene.add(robot_obj);
        });
    });

    loader.load('models/spino.dae', function (collada) {

        dino_dae = collada.scene;

        arena.dinos.forEach(dino => {

            let dino_obj = {};

            dino_obj.id = dino.id;

            dino_obj = dino_dae.clone();

            dino_obj.scale.x = dino_obj.scale.y = dino_obj.scale.z = 0.1;

            dino_obj.position.set(dino.pos_x, 0, dino.pos_y);
            dino_obj.position.x -= 25;
            dino_obj.position.z -= 25;
            dino_obj.position.x += 0.5;
            dino_obj.position.z += 0.5;

            dino_obj.rotation.z = getDirection(dino.direction);

            dino_obj.updateMatrix();

            dino_obj.name = robot._id;
            dino_obj.direction = robot.direction;
            scene.add(dino_obj);
        });
    });

    update();
}
//----Update----//
function update() {
    //requests the browser to call update at it's own pace
    requestAnimFrame(update);

    //update controls
    controls.update(1);

    document.getElementById('viewport');
    document.getElementById("camera_stuff").innerHTML = "position=" +
        camera.position.x + "," +
        camera.position.y + "," +
        camera.position.z + "<br>" +
        "rotation=" +
        camera.rotation.x + "," +
        camera.rotation.y + "," +
        camera.rotation.z + "\n";

    //call draw
    draw();
}
//----Draw----//
function draw() {
    renderer.render(scene, camera);
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}