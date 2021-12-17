import * as THREE from "../lib/three.module.js";
// import { THREE as THREEE } from "../lib/three.min.js";
import { OrbitControls } from "./OrbitControls.js";
import { FBXLoader } from './FBXLoader.js';


// window.addEventListener('load', init, false);
document.getElementById('myForm').addEventListener("submit", init);

var sceneWidth;
var sceneHeight;
var camera;
var scene;
var renderer;
var dom;
var sun;
var ground;
var orbitControl;
var rollingGroundSphere;
var rollingSpeed; //0.008
var worldRadius = 26;
var sphericalHelper;
var pathAngleValues;
var leftLane = -1;
var rightLane = 1;
var middleLane = 0;
var currentLane;
var clock;
var trunkReleaseInterval = 1.15; //0.5
var lastTrunkReleaseTime = 0;
var trunksInPath;
var trunksPool;
var particleGeometry;
var particleCount = 20;
var explosionPower = 1.06;
var particles;
var scoreText;
var score;
var hasCollided;
var mixer;
var difficulty;
var radres;
var getHero;
var hero;
var heromodel = new THREE.Object3D();
var elementHighScore = document.getElementById("highscore");
// elementHighScore = localStorage.getItem("highScore");
var highScore = 0;

var clock = new THREE.Clock();

function init() 
{
    // set up the scene
    createScene();

    // call game loop
    update();
}

// scene, camera, renderer, orbitcontrol, scoretext
function createScene() 
{
    // console.log(elementHighScore);
    hasCollided = false;
    score = 0;
    trunksInPath = [];
    trunksPool = [];
    clock.start();

    sphericalHelper = new THREE.Spherical();
    pathAngleValues = [1.52, 1.57, 1.62];

    sceneWidth = window.innerWidth;
    sceneHeight = window.innerHeight;
    scene = new THREE.Scene(); // the 3D scene
    scene.fog = new THREE.FogExp2(0x86BBD8, 0.19); // 0xf0fff0 0.14
    camera = new THREE.PerspectiveCamera(60, sceneWidth / sceneHeight, 0.1, 1000); // perspective camera

    renderer = new THREE.WebGLRenderer({ alpha: true }); // renderer with transparent backdrop
    renderer.setClearColor(0x86BBD8, 1); // background colour 0xfffafa
    renderer.shadowMap.enabled = true; // enable shadow
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(sceneWidth, sceneHeight);

    dom = document.getElementById('game');
    dom.appendChild(renderer.domElement);

    camera.position.z = 6.5;
    camera.position.y = 3.5;

    orbitControl = new OrbitControls(camera, renderer.domElement); // helper to rotate around in scene
    orbitControl.addEventListener('change', render);
    //orbitControl.enableDamping = true;
    //orbitControl.dampingFactor = 0.8;
    orbitControl.noKeys = true;
    orbitControl.noPan = true;
    orbitControl.enableZoom = false;
    orbitControl.minPolarAngle = 1.1;
    orbitControl.maxPolarAngle = 1.1;
    orbitControl.minAzimuthAngle = -0.2;
    orbitControl.maxAzimuthAngle = 0.2;

    window.addEventListener('resize', onWindowResize, false); // resize callback

    document.onkeydown = handleKeyDown;

    radres = document.querySelector('input[name="group"]:checked').value;
    difficulty = document.createElement('div');
    difficulty.style.position = 'absolute';
    difficulty.style.width = 100;
    difficulty.style.height = 100;
    //difficulty.style.backgroundColor = "blue";
    // difficulty.innerHTML = "0";
    difficulty.innerHTML = radres;
    difficulty.style.top = 30 + 'px';
    difficulty.style.left = 100 + 'px';
    document.body.appendChild(difficulty);

    getHero = document.querySelector('input[name="hero"]:checked').value;
    hero = document.createElement('div');
    hero.style.position = 'absolute';
    hero.style.width = 100;
    hero.style.height = 100;
    //hero.style.backgroundColor = "blue";
    // hero.innerHTML = "0";
    hero.innerHTML = getHero;
    hero.style.top = 10 + 'px';
    hero.style.left = 100 + 'px';
    document.body.appendChild(hero);

    scoreText = document.createElement('div');
    scoreText.style.position = 'absolute';
    //text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
    scoreText.style.width = 100;
    scoreText.style.height = 100;
    //scoreText.style.backgroundColor = "blue";
    scoreText.innerHTML = "0";
    scoreText.style.top = 50 + 'px';
    scoreText.style.left = 100 + 'px';
    document.body.appendChild(scoreText);

    addModel();
    createTrunksPool();
    addWorld();
    addLight();
    // addExplosion();
}

// mengatur efek ledakan bersama dengan doTreeLogic, explode, dan doExplosionLogic
function addExplosion() 
{
    particleGeometry = new THREE.BoxGeometry();
    for (var i = 0; i < particleCount; i++) 
    {
        var vertex = new THREE.Vector3();
        particleGeometry.vertices.push(vertex);
    }
    var pMaterial = new THREE.ParticleBasicMaterial
    ({
        color: 0xfffafa,
        size: 0.2
    });
    particles = new THREE.Points(particleGeometry, pMaterial);
    scene.add(particles);
    particles.visible = false;
}

// mengatur banyaknya batang yang ada di jalur runner
function createTrunksPool() 
{
    var maxTrunksInPool = 300; // 10
    var newTrunk;
    for (var i = 0; i < maxTrunksInPool; i++) 
    {
        newTrunk = createTrunk();
        trunksPool.push(newTrunk);
    }
}

var jumping;
// fungsi interaksi player
function handleKeyDown(keyEvent) 
{
    if(jumping)return;
    var validMove=true;
    if ( keyEvent.keyCode === 37) {//left
        if(currentLane==middleLane){
            currentLane=leftLane;
        }else if(currentLane==rightLane){
            currentLane=middleLane;
        }else{
            validMove=false;	
        }
    } else if ( keyEvent.keyCode === 39) {//right
        if(currentLane==middleLane){
            currentLane=rightLane;
        }else if(currentLane==leftLane){
            currentLane=middleLane;
        }else{
            validMove=false;	
        }
    }else{
        if ( keyEvent.keyCode === 38){

        }
    }
    if(validMove){
        
    }
}

// pembuatan world/bumi yaitu sebuah sphere yang berputar 
function addWorld() 
{
    var sides = 150; // 40
    var tiers = 150; // 40
    var sphereGeometry = new THREE.SphereGeometry(worldRadius, sides, tiers);
    var sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xECB365, flatShading: THREE.FlatShading }) // 0xfffafa

    rollingGroundSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    rollingGroundSphere.receiveShadow = true;
    rollingGroundSphere.castShadow = false;
    rollingGroundSphere.rotation.z = -Math.PI / 2;
    scene.add(rollingGroundSphere);

    rollingGroundSphere.position.y = -24;
    rollingGroundSphere.position.z = 2;
    addWorldTrunks();
}

// var model;
function addModel() {
    console.log(getHero);
    var heroChoosed;
    if(getHero == "Hitler") {
        heroChoosed = "model/zidanRunning.fbx"
    }
    else if(getHero == "Stalin") {
        heroChoosed = "model/zombieRunning.fbx"
    }
    else if(getHero == "Churchill") {
        heroChoosed = "model/churchRunning.fbx"
    }
    var loader = new FBXLoader();
    loader.load(heroChoosed, function (model) {
        // var model;
        mixer = new THREE.AnimationMixer(model);

        var action = mixer.clipAction(model.animations[0]);
        action.play();

        model.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        if(getHero == "Hitler") {
            // heroChoosed = "model/zidanRunning.fbx"
            model.scale.x = model.scale.y = model.scale.z = 0.002;
        }
        else {
            model.scale.x = model.scale.y = model.scale.z = 0.004;
        }
        // currentLane=middleLane;
        // model.position.x=currentLane;
        model.position.set(currentLane, 1.8, 4.8);
        model.rotation.set(0, Math.PI, 0);
        currentLane = middleLane;
        model.position.x = currentLane;
        heromodel = model;
        scene.add(model);
    });
    // console.log(heromodel.position.y);

}

// cahaya
function addLight() 
{
    var hemisphereLight = new THREE.HemisphereLight(0xfffafa, 0x000000, .9)
    scene.add(hemisphereLight);
    sun = new THREE.DirectionalLight(0xcdc1c5, 0.1); // 0.9
    sun.position.set(12, 6, -7);
    sun.castShadow = true;
    scene.add(sun);
    
    //Set up shadow properties for the sun light
    sun.shadow.mapSize.width = 256;
    sun.shadow.mapSize.height = 256;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 50;
}

function addPathTrunk() 
{
    var options = [0, 1, 2];
    var lane = Math.floor(Math.random() * 3);
    addTrunk(true, lane);
    options.splice(lane, 1);
    if (Math.random() > 0.5) 
    {
        lane = Math.floor(Math.random() * 2);
        addTrunk(true, options[lane]);
    }
}

// menambahkan batang di luar jalur runner
function addWorldTrunks() 
{
    var numTrunks = 66; // 36
    var gap = 6.28 / 36;
    for (var i = 0; i < numTrunks; i++) 
    {
        addTrunk(false, i * gap, true);
        addTrunk(false, i * gap, false);
    }
}

function addTrunk(inPath, row, isLeft) 
{
    var newTrunk;
    if (inPath) 
    {
        if (trunksPool.length == 0) return;
        newTrunk = trunksPool.pop();
        newTrunk.visible = true;
        //console.log("add tree");
        trunksInPath.push(newTrunk);
        sphericalHelper.set(worldRadius - 0.3, pathAngleValues[row], -rollingGroundSphere.rotation.x + 4);
    } 
    else 
    {
        newTrunk = createTrunk();
        var forestAreaAngle = 0;//[1.52,1.57,1.62];
        if (isLeft) 
        {
            forestAreaAngle = 1.68 + Math.random() * 0.1;
        } 
        else 
        {
            forestAreaAngle = 1.46 - Math.random() * 0.1;
        }
        sphericalHelper.set(worldRadius - 0.3, forestAreaAngle, row);
    }
    newTrunk.position.setFromSpherical(sphericalHelper);
    var rollingGroundVector = rollingGroundSphere.position.clone().normalize();
    var trunkVector = newTrunk.position.clone().normalize();
    newTrunk.quaternion.setFromUnitVectors(trunkVector, rollingGroundVector);
    newTrunk.rotation.x += (Math.random() * (2 * Math.PI / 10)) + -Math.PI / 10;
    rollingGroundSphere.add(newTrunk);
}

// membuat batang pohon sebagai obstacle
function createTrunk() 
{
    var obstacleTrunkGeometry = new THREE.CylinderGeometry(0.3, 0.3, 9); //0.1 0.1 0.5 //0.3 0.3 1.5
    var trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x886633, flatShading: THREE.FlatShading });
    var obstacleTrunk = new THREE.Mesh(obstacleTrunkGeometry, trunkMaterial);
    obstacleTrunk.position.y = 0.25;
    
    var trunk = new THREE.Object3D();
    trunk.add(obstacleTrunk);
    return trunk;
}

function update() 
{
    //animate
    // console.log(radres);
    if(radres == 'easy') {
        rollingSpeed = 0.006;
    }
    else if(radres == 'hard') {
        rollingSpeed = 0.008;
    }
    // console.log(rollingSpeed);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    heromodel.position.x=THREE.Math.lerp(heromodel.position.x, currentLane, 700*clock.getDelta());//clock.getElapsedTime());
    // console.log(currentLane);
    rollingGroundSphere.rotation.x += rollingSpeed;
    trunkReleaseInterval -= 0.0002;
    // untuk menampilkan skor yang berjalan di kiri atas layar
    if (clock.getElapsedTime() > trunkReleaseInterval) 
    {
        clock.start();
        addPathTrunk();
        if (!hasCollided) 
        {
            score += 4 * Math.round(trunkReleaseInterval);
            scoreText.innerHTML = score.toString();
            
            if (score > highScore) {
                highScore = score;
                elementHighScore.innerHTML = highScore;
                localStorage.setItem("highScore", highScore);
            }
        }
    }

    if(hasCollided) {
        rollingGroundSphere.rotation.x = 0;
    }

    doTrunkLogic();
    // doExplosionLogic();
    render();
    requestAnimationFrame(update); // request next update
}

// memeriksa tabrakan dan menghapus obstacle yang sudah di luar pandangan player
function doTrunkLogic() 
{
    var oneTrunk;
    var trunkPos = new THREE.Vector3();

    var trunksToRemove = [];
    trunksInPath.forEach(function (element, index) 
    {
        oneTrunk = trunksInPath[index];
        trunkPos.setFromMatrixPosition(oneTrunk.matrixWorld);
        if (trunkPos.z > 6 && oneTrunk.visible) 
        { // gone out of our view zone
            trunksToRemove.push(oneTrunk);
        }
        
        else
        { // check collision
            if(trunkPos.distanceTo(heromodel.position) <= 0.5)
            {
                console.log("hit");
                hasCollided = true;
                if(!alert('Why u so noob a? Restart?')){window.location.reload();}
                // explode();
            }
        }
    });

    var fromWhere;
    trunksToRemove.forEach(function (element, index) 
    {
        oneTrunk = trunksToRemove[index];
        fromWhere = trunksInPath.indexOf(oneTrunk);
        trunksInPath.splice(fromWhere, 1);
        trunksPool.push(oneTrunk);
        oneTrunk.visible = false;
        console.log("remove obstacle");
    });
}

function doExplosionLogic() 
{
    if (!particles.visible) return;
    for (var i = 0; i < particleCount; i++) 
    {
        particleGeometry.vertices[i].multiplyScalar(explosionPower);
    }
    if (explosionPower > 1.005) 
    {
        explosionPower -= 0.001;
    } 
    else 
    {
        particles.visible = false;
    }
    particleGeometry.verticesNeedUpdate = true;
}

function explode() 
{
    particles.position.y = 2;
    particles.position.z = 4.8;
    particles.position.x = heromodel.position.x;
    for (var i = 0; i < particleCount; i++) 
    {
        var vertex = new THREE.Vector3();
        vertex.x = -0.2 + Math.random() * 0.4;
        vertex.y = -0.2 + Math.random() * 0.4;
        vertex.z = -0.2 + Math.random() * 0.4;
        particleGeometry.vertices[i] = vertex;
    }
    explosionPower = 1.07;
    particles.visible = true;
}

function render() 
{
    renderer.render(scene, camera); // draw
}

function gameOver() 
{
    // cancelAnimationFrame ( globalRenderID );
    // window.clearInterval ( powerupSpawnIntervalID );
}

function onWindowResize() 
{
    //resize & align
    sceneHeight = window.innerHeight;
    sceneWidth = window.innerWidth;
    renderer.setSize(sceneWidth, sceneHeight);
    camera.aspect = sceneWidth / sceneHeight;
    camera.updateProjectionMatrix();
}
