import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { gsap } from "gsap";

import room from '../objs/room.gltf';
import envSky from '../objs/sky.gltf';
import refl from '../img/reflaction.jpg';
import roomDeff from '../img/map.jpg';
import roomalph from '../img/map-alpha.jpg';
import sky from '../img/sky.jpg'

let newEnvMap, exrCubeRenderTarget;

class Viewer {
    constructor(options) {
      
      this.container = document.querySelector(options.dom);
      this.callBack = options.cb;
  
      this.scene = new THREE.Scene();
      this.width = this.container.offsetWidth;
      this.height = this.container.offsetHeight;
      this.viewBoxCoordinates = this.container.getBoundingClientRect();
      this.time = 0;
      this.camera = new THREE.PerspectiveCamera(
        46,
        this.width / this.height,
        0.2,
        300
      );
      
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      
      this.push = false;

      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      this.container.appendChild(this.renderer.domElement);
  
      this.mouse = new THREE.Vector2();
      this.raycaster = new THREE.Raycaster();
    }
  
    run(){
      return new Promise((resolve)=>{
        this.watchResize();
        this.loadEnvMap().then(()=>{
          
          this.setMaterials().then(()=>{
            this.addRoom()
            .then(()=>{
            this.addSky();
            this.watchers();
            this.controls();
            this.cameraPlacement();
          })
          })
        })
        
        
      })
      
    }
  
    setRender() {
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      this.rendererPhys.shadowMap.enabled = true;
      this.rendererPhys.shadowMap.autoUpdate = false;
      const shadowTypes = [THREE.BasicShadowMap, THREE.PCFShadowMap, THREE.PCFSoftShadowMap, THREE.VSMShadowMap]
      this.rendererPhys.shadowMap.type = shadowTypes[1];
      
      this.rendererPhys.setSize(this.width, this.height);
      this.rendererPhys.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      this.container.appendChild(this.rendererPhys.domElement);
    }
  
    loadEnvMap() {
      return new Promise((resolve)=>{
        THREE.DefaultLoadingManager.onLoad = function () {
          pmremGenerator.dispose();
      };
  
      // -----------------
  
      const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      pmremGenerator.compileCubemapShader();
      new THREE.TextureLoader()
      .load(
        refl,
        (texture)=>{
          exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
          
          newEnvMap = exrCubeRenderTarget ? exrCubeRenderTarget.texture : null;
          resolve(newEnvMap)
  
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
          // reflectivity: 0.9,
          refractionRatio: 0.6,
          opacity: 0.9,
          transparent: true,
          envMap: newEnvMap,
          color: '#2596be'
        })
        this.buttonHovered = new THREE.MeshBasicMaterial({
          reflectivity: 0.2,
          refractionRatio: 0.6,
          opacity: 0.8,
          transparent: true,
          envMap: newEnvMap,
          color: "rgb(50, 255, 50)"
        })
          let texture = new THREE.TextureLoader().load(roomDeff)
          texture.flipY = false;
        this.frameMat = new THREE.MeshBasicMaterial({
          reflectivity: 0.2,
          opacity: 1,
          // transparent: true,
          map: texture,
          envMap: newEnvMap,
          color: 'white'
        })
        resolve()
      })
      
    }
  
    resize() {
      this.width = this.container.offsetWidth;
      this.height = this.container.offsetHeight;
      this.renderer.setSize(this.width, this.height);
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.viewBoxCoordinates = this.container.getBoundingClientRect();
    }

    cameraPlacement() {
      const cameraPointContr = [1, 1, 1]
      this.camera.position.set(...cameraPointContr);
      this.scene.add(this.camera)
      this.OrbitControl.target.set(0,0.5,0)
      this.OrbitControl.update();
    }
  
    controls() {
      this.OrbitControl = new OrbitControls(
        this.camera,
        this.renderer.domElement
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
                let alph = new THREE.TextureLoader().load(roomalph);
                alph.flipY = false;
                texture.flipY = false;
                THREE.DefaultLoadingManager.onLoad = ()=>{
                  resolve(true)
                };
                mesh.material = new THREE.MeshBasicMaterial({
                            map: texture,
                            alphaMap: alph,
                            transparent: true,
                            side: THREE.DoubleSide,
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
        // console.log(this.scene)
      })
    }
    )
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
        // this.button[0].material = this.buttonPassive;
        
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
      this.requestFrame =  window.requestAnimationFrame(this.render.bind(this));
    }
  }
export { Viewer }