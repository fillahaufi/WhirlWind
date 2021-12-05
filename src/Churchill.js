import * as THREE from "../lib/three.module.js";
// import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js";
import { OrbitControls } from "./OrbitControls.js";
import { FBXLoader } from './FBXLoader.js';

// document.getElementById('myForm').addEventListener("submit", init);
window.addEventListener("load", init, false);

var sceneWidth;
var sceneHeight;
var camera;
var scene;
var renderer;
var dom;
var sun;
var orbitControl;
var mixer;

var clock = new THREE.Clock();

function init() {
	// set up the scene
	createScene();

	//call game loop
	update();
}

function createScene(){
    
	dom = document.getElementById('Churchill');
	sceneWidth= 600;
    sceneHeight= 500;
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x474747 )
    scene.fog = new THREE.FogExp2( 0xf0fff0, 0.14 );
    camera = new THREE.PerspectiveCamera( 60, sceneWidth / sceneHeight, 0.1, 1000 );//perspective camera
    renderer = new THREE.WebGLRenderer({alpha:true});//renderer with transparent backdrop
    renderer.setClearColor(0xfffafa, 1); 
    renderer.shadowMap.enabled = true; //enable shadow
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize( sceneWidth, sceneHeight );
    
	dom.appendChild(renderer.domElement);

	// addWorld();
	addLight();
	addModel();
	
	camera.position.z = 4.8;
	camera.position.y = 2.35;
	orbitControl = new OrbitControls( camera, renderer.domElement ); //helper to rotate around in scene
	
	// orbitControl.enableZoom = true;

	orbitControl.minPolarAngle = 1.1;
	orbitControl.maxPolarAngle = 1.1;
	orbitControl.minAzimuthAngle = -0.2;
	orbitControl.maxAzimuthAngle = 0.2;
	
	window.addEventListener('resize', onWindowResize, false); //resize callback

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

function addModel() {
	var loader = new FBXLoader();
	loader.load("model/ceweDancing.fbx", function (model) {
		mixer = new THREE.AnimationMixer(model);

		var action = mixer.clipAction(model.animations[0]);
		action.play();

		model.traverse(function (child) {
			if (child.isMesh) {
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});
		model.scale.x = model.scale.y = model.scale.z = 0.002;
		model.position.set(0, 2, 4.5);
		model.rotation.set(0, 0, 0);
		scene.add(model);
	});
}

function update(){
    //animate
	const delta = clock.getDelta();

	if (mixer) mixer.update(delta);

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