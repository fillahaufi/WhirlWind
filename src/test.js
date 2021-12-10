import * as THREE from "../lib/three.module.js";
// import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js";
import { OrbitControls } from "./OrbitControls.js";
import { FBXLoader } from './FBXLoader.js';

var loader = new FBXLoader();
loader.load("model/zidanRunning.fbx", function (model) {
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
	var getHero;
	var hero;
	var mixer;
	var middleLane=0;
	var leftLane=-1;
	var rightLane=1;
	var modposx=0;
	var currentLane = modposx;

	var clock = new THREE.Clock();

	function init() {
		// set up the scene
		createScene();
		
		//call game loop
		update();
	}

	function createScene(){
		
		sceneWidth=window.innerWidth;
		sceneHeight=window.innerHeight;
		scene = new THREE.Scene();
		scene.fog = new THREE.FogExp2( 0xf0fff0, 0.14 );
		camera = new THREE.PerspectiveCamera( 60, sceneWidth / sceneHeight, 0.1, 1000 );//perspective camera
		renderer = new THREE.WebGLRenderer({alpha:true});//renderer with transparent backdrop
		renderer.setClearColor(0xfffafa, 1); 
		renderer.shadowMap.enabled = true; //enable shadow
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		renderer.setSize( sceneWidth, sceneHeight );
		
		dom = document.getElementById('game');
		dom.appendChild(renderer.domElement);

		addWorld();
		addLight();
		addModel();
		
		camera.position.z = 6.5;
		camera.position.y = 3.5;
		orbitControl = new OrbitControls( camera, renderer.domElement ); //helper to rotate around in scene
		orbitControl.addEventListener( 'change', render );
		//orbitControl.enableDamping = true;
		//orbitControl.dampingFactor = 0.8;
		orbitControl.noKeys = true;
		orbitControl.noPan = true;
		orbitControl.enableZoom = true;

		orbitControl.minPolarAngle = 1.1;
		orbitControl.maxPolarAngle = 1.1;
		orbitControl.minAzimuthAngle = -0.2;
		orbitControl.maxAzimuthAngle = 0.2;
		
		window.addEventListener('resize', onWindowResize, false); //resize callback

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
	}

	var jumping;
	var bounceValue;

	function handleKeyDown(keyEvent){
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
			if ( keyEvent.keyCode === 38){//up, jump
				// bounceValue=0.1;
				// jumping=true;
			}
			// validMove=false;
		}
		//heroSphere.position.x=currentLane;
		if(validMove){
			// jumping=true;
			// bounceValue=0.06;
		}
	}

	function addWorld(){
		var sides=50;
		var tiers=50;
		var sphereGeometry = new THREE.SphereGeometry( worldRadius, sides,tiers);
		var sphereMaterial = new THREE.MeshStandardMaterial({color: "rgb(139, 69, 19)", flatShading:THREE.FlatShading})
		
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

	var model;
	function addModel() {
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
			model.scale.x = model.scale.y = model.scale.z = 0.002;
			// currentLane=middleLane;
			// model.position.x=currentLane;
			model.position.set(currentLane, 1.8, 4.8);
			model.rotation.set(0, Math.PI, 0);
			currentLane = middleLane;
			model.position.x = currentLane;
			scene.add(model);
		}
		
	function update(){
		//animate
		const delta = clock.getDelta();

		if (mixer) mixer.update(delta);
		
		model.position.x=THREE.Math.lerp(model.position.x, currentLane, 700*clock.getDelta());//clock.getElapsedTime());
		console.log(currentLane);
		
		rollingGroundSphere.rotation.x += rollingSpeed;
		// objs.forEach(({mixer}) => {mixer.update(clock.getDelta());});
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
});