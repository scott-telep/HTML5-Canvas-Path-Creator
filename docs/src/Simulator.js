import * as THREE from '../es_modules/three/build/three.module.js';
import { OrbitControls } from "../es_modules/three/examples/jsm/controls/OrbitControls.js";
var Simulator = /** @class */ (function () {
    function Simulator() {
        // Canvas2D
        this.ctxCanvas = document.getElementById("canvas2d");
        this.ctx = this.ctxCanvas.getContext('2d');

        this.drawAxis = () => {
            this.ctx.beginPath();
            this.ctx.strokeStyle = '#7CFC00';
            this.ctx.moveTo(this.ctxCanvas.width / 2, this.ctxCanvas.height / 2);
            this.ctx.lineTo(this.ctxCanvas.width / 2, 0);
            this.ctx.stroke();
            this.ctx.closePath();
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'red';
            this.ctx.moveTo(this.ctxCanvas.width / 2, this.ctxCanvas.height / 2);
            this.ctx.lineTo(this.ctxCanvas.width, this.ctxCanvas.height / 2);
            this.ctx.closePath();
            this.ctx.stroke();
        }
        this.drawAxis();


        // CreateJS
        this.cjsCanvas = document.getElementById("creatjscanvas");
        this.cjsStage = new createjs.Stage(this.cjsCanvas);
        var cjsS = new createjs.Shape();
        var cjsG = cjsS.graphics;
        this.cjsG = cjsG;
        this.cjsStage.addChild(cjsS);
        cjsS.x = this.cjsCanvas.width / 2;
        cjsS.y = this.cjsCanvas.height / 2;
        var axis = new createjs.Shape();
        var ag = axis.graphics;
        ag.beginStroke("#7CFC00");
        ag.moveTo(this.cjsCanvas.width / 2, this.cjsCanvas.height / 2);
        ag.lineTo(this.cjsCanvas.width / 2, 0);
        ag.beginStroke("red");
        ag.moveTo(this.cjsCanvas.width / 2, this.cjsCanvas.height / 2);
        ag.lineTo(this.cjsCanvas.width, this.cjsCanvas.height / 2);
        this.cjsStage.addChild(axis);
        this.cjsStage.update();

        //ThreeJS
        this.container = { width: 500, height: 500 };
        var cnt = document.getElementById("threejscanvas");
        var renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(this.container.width, this.container.height);
        cnt.appendChild(renderer.domElement);
        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(75, this.container.width / this.container.height, 0.1, 1000);
        var color = 0xFFFFFF;
        var intensity = 1;
        var light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
        var axesHelper = new THREE.AxesHelper(10);
        scene.add(axesHelper);
        var controls = new OrbitControls(camera, renderer.domElement);
        //controls.update() must be called after any manual changes to the camera's transform
        camera.position.set(0, 5, 5);
        controls.update();
        function animate() {
            requestAnimationFrame(animate);
            // required if controls.enableDamping or controls.autoRotate are set to true
            controls.update();
            renderer.render(scene, camera);
        }
        animate();
        this.scene = scene;
    }
    Simulator.prototype.simulate = function (cmds) {
        console.log("count =>> ", cmds.length);

        //Canvas2D
        var ctx = this.ctx;
        ctx.save();
        ctx.clearRect(0,0,this.ctxCanvas.width, this.ctxCanvas.height);
        ctx.translate(this.ctxCanvas.width / 2, this.ctxCanvas.height / 2);

        //CreateJs
        var cjsG = this.cjsG;
        cjsG.clear();
        var w = 0;
        var hF = 0;
        var reducer = 100;
        if (this.shape) {
            this.scene.remove(this.shape);
        }
        var shape = new THREE.Shape();
        var fill = undefined;

        cmds.forEach(function (c) {
            console.log(c);
            switch (c.cmd) {
                case "beginFill":
                    ctx.beginPath();
                    ctx.fillStyle = c.color;
                    cjsG.beginFill(c.color);
                    fill = c.color;
                    break;
                case "endFill":
                    ctx.closePath();
                    ctx.fill();
                    cjsG.endFill();
                    break;
                case "moveTo":
                    ctx.moveTo(c.x + w, c.y + w);
                    cjsG.moveTo(c.x + w, c.y + w);
                    shape.moveTo(c.x / reducer, (hF - c.y) / reducer);
                    break;
                case "bezierCurveTo":
                    ctx.bezierCurveTo(c.cp1x + w, c.cp1y + w, c.cp2x + w, c.cp2y + w, c.x + w, c.y + w);
                    cjsG.bezierCurveTo(c.cp1x + w, c.cp1y + w, c.cp2x + w, c.cp2y + w, c.x + w, c.y + w);
                    shape.bezierCurveTo(c.cp1x / reducer, (hF - c.cp1y) / reducer, c.cp2x / reducer, (hF - c.cp2y) / reducer, c.x / reducer, (hF - c.y) / reducer);
                    break;
                case "quadraticCurveTo":
                    ctx.quadraticCurveTo(c.cpx + w, c.cpy + w, c.x + w, c.y + w);
                    cjsG.quadraticCurveTo(c.cpx + w, c.cpy + w, c.x + w, c.y + w);
                    shape.quadraticCurveTo(c.cpx / reducer, (hF - c.cpy) / reducer, c.x / reducer, (hF - c.y) / reducer);
                    break;
                case "lineTo":
                    ctx.lineTo(c.x + w, c.y + w);
                    cjsG.lineTo(c.x + w, c.y + w);
                    shape.lineTo(c.x / reducer, (hF - c.y) / reducer);
                    break;
                default:
            }
        });

        ctx.restore();
        this.drawAxis();
        
        this.cjsStage.update();
        var extrudeSettings = {
            steps: 20,
            depth: 1,
            bevelEnabled: true,
            bevelThickness: 0.01,
            bevelSize: 0.1,
            bevelOffset: 0,
            bevelSegments: 3
        };
        var geometryFace = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        var lowestPoint = new THREE.Vector3(0, 0, 0);
        var highestPoint = new THREE.Vector3(0, 0, 0);
        geometryFace.vertices.forEach(function (p) {
            if (p.x < lowestPoint.x)
                lowestPoint.x = p.x;
            if (p.y < lowestPoint.y)
                lowestPoint.y = p.y;
            if (p.x > highestPoint.x)
                highestPoint.x = p.x;
            if (p.y > highestPoint.y)
                highestPoint.y = p.y;
        });
        geometryFace.faceVertexUvs[0] = [];
        geometryFace.faces.forEach(function (f) { return geometryFace.faceVertexUvs[0].push([
            new THREE.Vector2(THREE.Math.mapLinear(geometryFace.vertices[f.a].x, lowestPoint.x, highestPoint.x, 0, 1), THREE.Math.mapLinear(geometryFace.vertices[f.a].y, lowestPoint.y, highestPoint.y, 0, 1)),
            new THREE.Vector2(THREE.Math.mapLinear(geometryFace.vertices[f.b].x, lowestPoint.x, highestPoint.x, 0, 1), THREE.Math.mapLinear(geometryFace.vertices[f.b].y, lowestPoint.y, highestPoint.y, 0, 1)),
            new THREE.Vector2(THREE.Math.mapLinear(geometryFace.vertices[f.c].x, lowestPoint.x, highestPoint.x, 0, 1), THREE.Math.mapLinear(geometryFace.vertices[f.c].y, lowestPoint.y, highestPoint.y, 0, 1))
        ]); });
        geometryFace.computeFaceNormals();
        this.mainMaterial = null;
        this.mainMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(fill) });
        this.mainMaterial.roughness = 0.2;
        this.mainMaterial.metalness = 0.1;
        this.mesh = new THREE.Mesh(geometryFace, this.mainMaterial);
        this.shape = this.mesh;
        this.mesh.position.z -= extrudeSettings.depth / 2;
        this.scene.add(this.mesh);
    };
    return Simulator;
}());
export { Simulator };
