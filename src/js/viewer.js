import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { gsap } from "gsap";

import room from '../objs/room.gltf';
import envSky from '../objs/sky.gltf';
import refl from '../img/reflaction.jpg';
import roomDeff from '../img/map.jpg';
import sky from '../img/sky.jpg'

class Viewer {
    constructor(options) {
      
      this.container = document.querySelector(options.dom);
      this.callBack = options.cb;
      this.newEnvMap = null;
      this.exrCubeRenderTarget = null;
      this.scene = new THREE.Scene();
      this.sceneB = new THREE.Scene();
      this.width = this.container.offsetWidth;
      this.height = this.container.offsetHeight;
      this.viewBoxCoordinates = this.container.getBoundingClientRect();
      
      this.camera = new THREE.PerspectiveCamera(
        46,
        this.width / this.height,
        0.2,
        300
      );
      
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
      });

      
      this.renderer.setSize(this.width, this.height);
            
      this.container.appendChild(this.renderer.domElement);
  
      this.mouse = new THREE.Vector2();
      this.raycaster = new THREE.Raycaster();
    }
  
    run(){
        this.watchResize();
        this.setotherRender();
        this.loadEnvMap()
        .then(this.setMaterials.bind(this))
        .then(this.addRoom.bind(this))
        .then(this.addSky.bind(this))
        .then(()=>{
          this.watchers();
          this.replcae();
          this.controls();
          this.cameraPlacement();
          this.createPlane(
            1280 , 720,
            new THREE.Vector3( -3.5, 1.5, 0 ),
            new THREE.Euler( 0, 90 * THREE.MathUtils.DEG2RAD, 0 )
          );
          this.render();
        })            
    }
  
    setotherRender() {
      this.cssRenderer = new CSS3DRenderer();
			this.cssRenderer.setSize( this.width, this.height );
			this.cssRenderer.domElement.style.position = 'fixed';
      this.cssRenderer.domElement.style.left = Math.round(this.viewBoxCoordinates.left) + 'px'
     
			this.container.appendChild( this.cssRenderer.domElement );

      this.rendererB = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      this.rendererB.setSize(this.width, this.height);
      this.rendererB.domElement.style.position = 'absolute';
      this.rendererB.domElement.style.pointerEvents = 'none';
      this.container.appendChild( this.rendererB.domElement );
    }
    
    createPlane( width, height, pos, rot ) {
      const element = document.createElement( 'div' );
      element.style.width = width + 'px';
      element.style.height = height + 'px';
      element.style.opacity = 1;

      const object = new CSS3DObject( element );
      object.position.copy( pos );
      object.rotation.copy( rot );
      object.scale.set(1/333, 1/333, 1/333)
      this.scene.add( object );
    }

    loadEnvMap() {
      return new Promise((resolve)=>{
        THREE.DefaultLoadingManager.onLoad = function () {
          pmremGenerator.dispose();
      };
  
      const pmremGenerator = new THREE.PMREMGenerator(this.rendererB);
      pmremGenerator.compileCubemapShader();
      new THREE.TextureLoader()
      .load(
        refl,
        (texture)=>{
          this.exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
          
          this.newEnvMap = this.exrCubeRenderTarget ? this.exrCubeRenderTarget.texture : null;
          resolve(this.newEnvMap)
  
          pmremGenerator.dispose()
          texture.dispose();
          }
        )
      })
      
    }
  
    watchResize() {
      window.addEventListener("resize", this.resize.bind(this));
      window.addEventListener("scroll", this.resize.bind(this));
    }

    watchers(){
      this.container.addEventListener("mousemove", this.mouseHover.bind(this));
      this.container.addEventListener("click", this.mouseClick.bind(this));
    }
  
    setMaterials() {
      return new Promise((resolve)=>{
        this.buttonPassive = new THREE.MeshBasicMaterial({
          refractionRatio: 0.6,
          opacity: 0.9,
          transparent: true,
          envMap: this.newEnvMap,
          color: '#2596be'
        })
        this.buttonHovered = new THREE.MeshBasicMaterial({
          reflectivity: 0.2,
          refractionRatio: 0.6,
          opacity: 0.8,
          transparent: true,
          envMap: this.newEnvMap,
          color: "rgb(50, 255, 50)"
        })
          let texture = new THREE.TextureLoader().load(roomDeff)
          texture.flipY = false;
        this.frameMat = new THREE.MeshBasicMaterial({
          reflectivity: 0.2,
          opacity: 1,
          map: texture,
          envMap: this.newEnvMap,
          color: 'white'
        })
        resolve()
      })
      
    }
  
    resize() {
      this.width = this.container.offsetWidth;
      this.height = this.container.offsetHeight;
      this.renderer.setSize(this.width, this.height);
      this.cssRenderer.setSize(this.width, this.height);
      this.rendererB.setSize(this.width, this.height);
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.viewBoxCoordinates = this.container.getBoundingClientRect();
      this.cssRenderer.domElement.style.left = Math.round(this.viewBoxCoordinates.left) + 'px';
      this.cssRenderer.domElement.style.top = Math.round(this.viewBoxCoordinates.top) + 'px';
    }

    cameraPlacement() {
      const cameraPointContr = [1, 1, 1]
      this.camera.position.set(...cameraPointContr);
      this.scene.add(this.camera)
      this.OrbitControl.target.set(0,0.5,0)
      this.OrbitControl.update();
    }
  
    cameraToOpen(){
        const cam = gsap.timeline()
        cam.to(this.camera.position,{
        x: 0.9909573482408557,
        y: 0.7690411865791031,
        z: -0.02832073862241287,
        duration: 1,
        ease: 'power1.inOut',
      });
        cam.to(this.camera.rotation,{
        x: 1.731800365477846,
        y: 1.536151456479124,
        z: -1.731895374273244,
        duration: 2,
        ease: 'power1.inOut',
      }, '<');
        cam.to(this.OrbitControl.target,{
        x: 0,
        y: 0.85,
        z: 0,
        duration: 2,
        ease: 'power1.inOut',
      }, '<');
        this.OrbitControl.camera = this.camera;
        this.OrbitControl.update();

    }

    controls() {
      this.OrbitControl = new OrbitControls(
        this.camera,
        this.cssRenderer.domElement
      ); 
      this.OrbitControl.maxPolarAngle = 100 * (Math.PI/180)  
      this.OrbitControl.minDistance = 0.5;
      this.OrbitControl.maxDistance = 2.6;
      this.OrbitControl.update();
    }
  
    addRoom() {
      let loader = new GLTFLoader();
      return new Promise((resolve)=>{
        loader.load(
          room,
          (object) => {
            const meshes = object.scene.children;
            
            meshes.forEach(mesh=>{
             if(mesh.name !== "button"){
                let texture = new THREE.TextureLoader().load(roomDeff)
                texture.flipY = false;
                THREE.DefaultLoadingManager.onLoad = ()=>{
                  resolve(true)
                };
                mesh.material = new THREE.MeshBasicMaterial({
                            map: texture,
                          })
             } else {
              this.button = [mesh];
              mesh.material = this.buttonPassive;
             }
             if(mesh.name === "frame"){
              mesh.material = this.frameMat;
             }
          },
          (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
          },
          (error) => {
            console.log(error);
          }
        );
        this.scene.add(object.scene);
      })
    }
    )
    }

    replcae(){
    const list = ['box', 'frame', 'button'];
    list.forEach(item=>{
      const target = this.scene.getObjectByName(item);
      this.sceneB.add(target);
      this.scene.remove(target)
    })

    }

    addSky(){
      let loader = new GLTFLoader();
      return new Promise((resolve)=>{
        loader.load(
          envSky,
          (object) => {
            const meshes = object.scene.children;
            
            meshes.forEach(mesh=>{
                let texture = new THREE.TextureLoader().load(sky)
                texture.flipY = false;
                THREE.DefaultLoadingManager.onLoad = ()=>{
                  resolve(true)
                };
                mesh.material = new THREE.MeshBasicMaterial({
                            map: texture,
                          })
          },
          (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
          },
          (error) => {
            console.log(error);
          }
        );
        this.scene.add(object.scene);
      })
    }
    )
    }
    mouseHover(evt){
      this.mouse.x = ((evt.clientX - this.viewBoxCoordinates.left) / this.width) * 2 - 1;
      this.mouse.y = -((evt.clientY - this.viewBoxCoordinates.top) / this.height) * 2 + 1;
  
      this.raycaster.setFromCamera(this.mouse, this.camera);
      let intersects = this.raycaster.intersectObjects(this.button);
      
      if (intersects.length > 0 && evt.buttons === 0){
        this.button[0].material = this.buttonHovered;
        this.container.style.cursor = 'pointer';
      } else {
        this.button[0].material = this.buttonPassive;
        this.container.style.cursor = 'auto';
      }
    }

    mouseClick(evt){
      this.mouse.x = ((evt.clientX - this.viewBoxCoordinates.left) / this.width) * 2 - 1;
      this.mouse.y = -((evt.clientY - this.viewBoxCoordinates.top) / this.height) * 2 + 1;
  
      this.raycaster.setFromCamera(this.mouse, this.camera);
      let intersects = this.raycaster.intersectObjects(this.button);
      
      if (intersects.length > 0){
              
        const push = gsap.timeline();
        push.to(this.button[0].position,{
          y: 0.57,
          duration: 0.5,
          onComplete: this.callBack,
        });
        push.to(this.button[0].material.color,{
          r: 1,
          g: 0,
          b: 0,
          duration: 0.5,
        }, '<');
        push.to(this.button[0].position,{
          y: 0.6,
          duration: 0.5,
        })
        push.to(this.button[0].material.color,{
          r: 0.19,
          g: 1,
          b: 0.19,
          duration: 0.5,
        }, '<');
      }
    }

    render() {
      this.renderer.render(this.scene, this.camera);
      this.cssRenderer.render(this.scene, this.camera);
      this.rendererB.render(this.sceneB, this.camera);
      this.requestFrame =  window.requestAnimationFrame(this.render.bind(this));
    }
  }
export { Viewer }