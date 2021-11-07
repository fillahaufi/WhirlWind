    let scene, camera, renderer;

    // set up the environment - 
    // initiallize scene, camera, objects and renderer
    let init = function() {
        // 1. create the scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x474747);

        renderer = new THREE.WebGLRenderer( { canvas: game } );   
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        
        // 2. create an locate the camera       
        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.set(0,0,500);
//         
        // 3. create an locate the object on the scene         
        

    };
    
    // function cubeOne() {
    // }

    let mainLoop = function() {
        // cubeOne();
        // textOne();
        // controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(mainLoop);
    };
    
    ///////////////////////////////////////////////
    init();
    mainLoop();
