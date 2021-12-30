import { threadId } from 'worker_threads';
import * as THREE from '../es_modules/three/build/three.module.js';
import { OrbitControls } from "../es_modules/three/examples/jsm/controls/OrbitControls.js"

export class Simulator {
  constructor(){
    this.canvas = document.getElementById("creatjscanvas");
    this.stage = new createjs.Stage(this.canvas);
    const s = new createjs.Shape();
    const g = s.graphics;
    this.g = g;
    this.stage.addChild(s);

    this.container = {width:500,height:500};

    const cnt = document.getElementById("threejscanvas");

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize( this.container.width, this.container.height );
    cnt.appendChild( renderer.domElement );

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera( 75, this.container.width/this.container.height, 0.1, 1000 );

    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);

    /*
    const geometry = new THREE.SphereGeometry( 1, 32, 16 );
    const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
    const sphere = new THREE.Mesh( geometry, material );
    sphere.position.z = -5;
    scene.add( sphere );
    */

    const axesHelper = new THREE.AxesHelper( 10 );
    scene.add( axesHelper );

    const controls = new OrbitControls( camera, renderer.domElement );

    //controls.update() must be called after any manual changes to the camera's transform
    camera.position.set( 0, 5, 5 );
    controls.update();

    function animate() {

      requestAnimationFrame( animate );

      // required if controls.enableDamping or controls.autoRotate are set to true
      controls.update();

      renderer.render( scene, camera );

    }
    animate();
    this.scene = scene;
  }

  simulate(cmds){
    console.log("count =>> ",cmds.length)
    const g = this.g;
    g.clear();
    const w = 0;

    const reducer = 100;
    if(this.shape) {
      this.stage.removeChild(this.shape);
    }

    const shape = new THREE.Shape();
    const fill = undefined;

    cmds.forEach((c) => {
      console.log(c)
      switch(c.cmd) {
        case "beginFill":
            g.beginFill(c.color);
            fill = c.color;
            break;
        case "endFill":
            g.endFill();
            break;
        case "moveTo":
            g.moveTo(c.x+w,c.y+w); 
            shape.moveTo(c.x/reducer,c.y/reducer);            
            break;
        case "bezierCurveTo":
            g.bezierCurveTo(c.cp1x+w,c.cp1y+w,c.cp2x+w,c.cp2y+w,c.x+w,c.y+w);
            shape.bezierCurveTo(c.cp1x/reducer, c.cp1y/reducer, c.cp2x/reducer, c.cp2y/reducer, c.x/reducer, c.y/reducer);
            break;
        case "lineTo":
            g.lineTo(c.x+w,c.y+w);
            shape.lineTo(c.x/reducer,c.y/reducer);
            break;
        default:
      }
    });

    this.stage.update();

    const extrudeSettings = {
      steps: 20,
      depth: 1,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.1,
      bevelOffset: 0,
      bevelSegments: 3
    };
    
    const geometryFace = new THREE.ExtrudeGeometry( shape, extrudeSettings );
    const lowestPoint =  new THREE.Vector3(0,0,0);
    const highestPoint = new THREE.Vector3(0,0,0);
    geometryFace.vertices.forEach(p => {
        if(p.x < lowestPoint.x)
            lowestPoint.x = p.x;
        if(p.y < lowestPoint.y)
            lowestPoint.y = p.y;
        if(p.x > highestPoint.x)
            highestPoint.x = p.x;
        if(p.y > highestPoint.y)
            highestPoint.y = p.y;
    })

    geometryFace.faceVertexUvs[0] = [];
    geometryFace.faces.forEach(f => geometryFace.faceVertexUvs[0].push([
        new THREE.Vector2(
            THREE.Math.mapLinear(geometryFace.vertices[f.a].x,lowestPoint.x,highestPoint.x,0,1),
            THREE.Math.mapLinear(geometryFace.vertices[f.a].y,lowestPoint.y,highestPoint.y,0,1),
        ),
        new THREE.Vector2(
            THREE.Math.mapLinear(geometryFace.vertices[f.b].x,lowestPoint.x,highestPoint.x,0,1),
            THREE.Math.mapLinear(geometryFace.vertices[f.b].y,lowestPoint.y,highestPoint.y,0,1),
        ),
        new THREE.Vector2(
            THREE.Math.mapLinear(geometryFace.vertices[f.c].x,lowestPoint.x,highestPoint.x,0,1),
            THREE.Math.mapLinear(geometryFace.vertices[f.c].y,lowestPoint.y,highestPoint.y,0,1),
        )
    ]));
    geometryFace.computeFaceNormals();

    this.mainMaterial = null;
    this.mainMaterial = new THREE.MeshStandardMaterial({color:new THREE.Color(fill)});
    this.mainMaterial.roughness = 0.2;
    this.mainMaterial.metalness = 0.1;

    this.mesh = new THREE.Mesh( geometryFace, this.mainMaterial ) ;
    this.shape = this.mesh;
    this.mesh.position.x -= this.container.width/2/reducer; 
    this.mesh.position.y -= this.container.height/2/reducer; 
    this.mesh.position.z -= extrudeSettings.depth/2; 
    /*
    this.mesh.rotation.z = - Math.PI;
    this.mesh.position.z = -5;
    */
    this.scene.add(this.mesh); 
    
  }
}