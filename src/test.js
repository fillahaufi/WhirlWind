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
var rollingSpeed=0.008;
var worldRadius=26;
var difficulty;
var radres;

function init() {
	// set up the scene
	createScene();

	//call game loop
	update();
}

function createScene(){
    
	sceneWidth=window.innerWidth;
    sceneHeight=window.innerHeight;
    scene = new THREE.Scene(); //the 3d scene
    
	camera = new THREE.PerspectiveCamera(60, sceneWidth / sceneHeight, 0.1, 1000 ); //perspective camera
    
	renderer = new THREE.WebGLRenderer({alpha:true}); //renderer with transparent backdrop
    renderer.setClearColor(0xfffafa, 1); 
    renderer.shadowMap.enabled = true; //enable shadow
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize( sceneWidth, sceneHeight );
    
	dom = document.getElementById('game');
	dom.appendChild(renderer.domElement);

	addWorld();
	addLight();
	
	camera.position.z = 6.5;
	camera.position.y = 3.5;
	orbitControl = new THREE.OrbitControls( camera, renderer.domElement ); //helper to rotate around in scene
	
	orbitControl.enableZoom = true;

	orbitControl.minPolarAngle = 1.1;
	orbitControl.maxPolarAngle = 1.1;
	orbitControl.minAzimuthAngle = -0.2;
	orbitControl.maxAzimuthAngle = 0.2;
	
	window.addEventListener('resize', onWindowResize, false); //resize callback

    radres = document.querySelector('input[name="group"]:checked').value;
	difficulty = document.createElement('div');
	difficulty.style.position = 'absolute';
	difficulty.style.width = 100;
	difficulty.style.height = 100;
	//difficulty.style.backgroundColor = "blue";
	// difficulty.innerHTML = "0";
	difficulty.innerHTML = radres;
	difficulty.style.top = 10 + 'px';
	difficulty.style.left = 100 + 'px';
	document.body.appendChild(difficulty);
}

function addWorld(){
	var sides=50;
	var tiers=50;
	var sphereGeometry = new THREE.SphereGeometry( worldRadius, sides,tiers);
	var sphereMaterial = new THREE.MeshStandardMaterial({color: "rgb(139, 69, 19)", shading:THREE.FlatShading})
	
	rollingGroundSphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
	rollingGroundSphere.receiveShadow = true;
	rollingGroundSphere.castShadow=false;
	rollingGroundSphere.rotation.z=-Math.PI/2;
	
	scene.add( rollingGroundSphere );
	
	rollingGroundSphere.position.y=-24;
	rollingGroundSphere.position.z=2;
}

function addLight(){
	var hemisphereLight = new THREE.HemisphereLight(0xfffafa,0x000000, .9)
	scene.add(hemisphereLight);
	
	sun = new THREE.DirectionalLight( 0xcdc1c5, 0.3);
	sun.position.set( 12,6,-7 );
	sun.castShadow = true;
	scene.add(sun);
	
	//Set up shadow properties for the sun light
	sun.shadow.mapSize.width = 256;
	sun.shadow.mapSize.height = 256;
	sun.shadow.camera.near = 0.5;
	sun.shadow.camera.far = 50 ;
}

function update(){
    //animate
    rollingGroundSphere.rotation.x += rollingSpeed;
    
    render();
	requestAnimationFrame(update); //request next update
}

function render(){
    renderer.render(scene, camera); //draw
}

function onWindowResize() {
	//resize & align
	sceneHeight = window.innerHeight;
	sceneWidth = window.innerWidth;
	
	renderer.setSize(sceneWidth, sceneHeight);
	
	camera.aspect = sceneWidth/sceneHeight;
	camera.updateProjectionMatrix();
}
