import React, { useLayoutEffect, useRef } from 'react';
import * as pc from 'playcanvas';
import "./PlayCanvas.css"

function PlayCanvas() {
  const canvasRef = useRef(null);
  const appRef = useRef(null);

  let firstUseLayoutEffectCall = true;

  useLayoutEffect(() => {

    if (firstUseLayoutEffectCall) {
      firstUseLayoutEffectCall = false;

      const SOCIAL_LINKS = [{
        image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/476907/social_codepen.png',
        link: 'https://codepen.io/halvves/'
      }, {
        image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/476907/social_github.png',
        link: 'https://github.com/halvves'
      }, {
        image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/476907/social_dribbble.png',
        link: 'https://dribbble.com/halvves'
      }, {
        image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/476907/social_instagram.png',
        link: 'https://www.instagram.com/coolandgood.gif/'
      }, {
        image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/476907/social_twitter.png',
        link: 'https://twitter.com/halvves'
      }, {
        image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/476907/social_tumblr.png',
        link: 'https://halvves.tumblr.com/'
      }];

      /**********************************************
      * SETUP
      * ---------------------------------------------
      * create canvas and add it to the DOM
      * create app and attach canvas and inputs
      * enable crossorigin asset loading
      * setup window resize listeners
      * setup canvasFillMode, canvasResolution,
      *   gammaCorrection, and toneMapping.
      **********************************************/
      //const canvas = document.createElement('canvas');
      //document.body.appendChild(canvas);

      const app = new pc.Application(canvasRef.current, {
        elementInput: new pc.ElementInput(canvasRef.current),
        mouse: new pc.Mouse(canvasRef.current),
        touch: 'ontouchstart' in window ? new pc.TouchDevice(canvasRef.current) : null,
        graphicsDeviceOptions: { alpha: true },
      });

      app.start();

      app.loader.getHandler('texture').crossOrigin = 'anonymous';

      app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
      app.setCanvasResolution(pc.RESOLUTION_AUTO);

      window.addEventListener('resize', function () {
        app.resizeCanvas(canvasRef.current.width, canvasRef.current.height);
      });

      app.scene.gammaCorrection = pc.GAMMA_SRGB;
      app.scene.toneMapping = pc.TONEMAP_ACES;

      const device = pc.Application.getApplication().graphicsDevice;
      //if (highTierDevice) {
      // Use the default device pixel ratio of the device
      device.maxPixelRatio = window.devicePixelRatio;
      //} else {
      // Use the CSS resolution device pixel ratio
      //  device.maxPixelRatio = 1;
      //}

      /**********************************************
      * ASSET: BLACK MARBLE
      * ---------------------------------------------
      * used as in the cubemap for reflections on the
      * central entity and as the diffuse map on the
      * inner surfaces of the environment entity
      **********************************************/
      const blackmarble = new pc.Asset('blackmarble-texture', 'texture', {
        url: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/476907/black-marble.jpg'
      });
      app.assets.add(blackmarble);
      app.assets.load(blackmarble);

      /**********************************************
      * ASSET: INVERTED BLACK MARBLE
      * ---------------------------------------------
      * used as the diffuse map on the face of the
      * central cube entity
      **********************************************/
      const blackmarbleInverted = new pc.Asset('blackmarbleInverted-texture', 'texture', {
        url: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/476907/black-marble--inverted.jpg',
      });
      app.assets.add(blackmarbleInverted);
      app.assets.load(blackmarbleInverted);

      /**********************************************
      * ASSET: CUBEMAP
      * ---------------------------------------------
      * used for reflections etc on the
      * central cube entity
      **********************************************/
      const cubemapAsset = new pc.Asset('blackmarble-map', 'cubemap', null, {
        'textures': [
          blackmarble.id,
          blackmarble.id,
          blackmarble.id,
          blackmarble.id,
          blackmarble.id,
          blackmarble.id
        ],
        'magFilter': 1,
        'minFilter': 5,
        'anisotropy': 1,
        'name': 'blackmarble',
      });
      app.assets.add(cubemapAsset);
      app.assets.load(cubemapAsset);

      /**********************************************
      * SCRIPT: CAMERA DRIFT
      * ---------------------------------------------
      * uses mouse and touch events to cause an
      * entity to drift in the general direction
      * of user input
      **********************************************/
      const CameraDrift = pc.createScript('camera-drift');
      CameraDrift.prototype.initialize = function () {
        this.toPos = new pc.Vec3(0, 0, 2);
        this.currPos = new pc.Vec3().copy(this.toPos)
        if (this.app.touch) {
          this.app.touch.on(pc.EVENT_TOUCHMOVE, this.handleMove, this);
        } else {
          this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.handleMove, this);
        }
      };
      CameraDrift.prototype.update = function (dt) {
        this.currPos.lerp(this.entity.getPosition(), this.toPos, dt);
        this.entity.setPosition(this.currPos);
      };
      CameraDrift.prototype.handleMove = function (e) {
        return //jb
        const min = (e.event.view.innerWidth, e.event.view.innerHeight);
        const x = e.event.type === pc.EVENT_TOUCHMOVE ? e.touches[0].x : e.x;
        const y = e.event.type === pc.EVENT_TOUCHMOVE ? e.touches[0].y : e.y;
        this.toPos.x = 0.5 * (x - e.event.view.innerWidth / 2) / min;
        this.toPos.y = 0.5 * (y - e.event.view.innerHeight / 2) / -min;
      };

      /**********************************************
      * ENTITY: CAMERA
      * ---------------------------------------------
      * add and setup camera to render the scene
      * attach the CameraDrift script
      **********************************************/
      const camera = new pc.Entity();
      camera.addComponent('camera', { clearColor: new pc.Color(0, 0, 0, 0) });

      camera.addComponent('script');
      camera.script.create(CameraDrift.__name);
      app.root.addChild(camera);

      /**********************************************
      * SCRIPT: INERTIAL SPIN
      * ---------------------------------------------
      * uses mouse and touch events to a allow a user
      * to spin an entity with inertia
      **********************************************/
      const InertialSpin = pc.createScript('inertial-spin');
      InertialSpin.prototype.initialize = function () {
        this.ROTATION_SPEED = 0.25;
        this.DRAG = 0.95;
        this.MIN_DELTA = 0.001;
        this.MOVE_RELEASE_DELTA = 50;

        this.horizontalQuat = new pc.Quat();
        this.verticalQuat = new pc.Quat();
        this.resultQuat = new pc.Quat();

        this.dx = 0;
        this.dy = 0;
        this.lastPoint = new pc.Vec2(0, 0);
        this.isUserControlling = false;
        this.isMouseInsideCanvas = false;

        if (this.app.touch) {
          this.app.touch.on(pc.EVENT_TOUCHSTART, this.handleStart, this);
          this.app.touch.on(pc.EVENT_TOUCHMOVE, this.handleMove, this);
          this.app.touch.on(pc.EVENT_TOUCHEND, this.handleEnd, this);
        } else {
          // allow to keep mouse tracking when mouse leaves canvas
          canvasRef.current.addEventListener('mouseleave', (event) => {
            this.isMouseInsideCanvas = false;
          });
          canvasRef.current.addEventListener('mouseenter', (event) => {
            this.isMouseInsideCanvas = true;
          });
          document.addEventListener('mousemove', (event) => {
            this.handleMoveMouse(event);
          });
          document.addEventListener('mouseup', (event) => {
            this.handleEnd(event);
          });
          document.addEventListener('mousedown', (event) => {
            if (this.isMouseInsideCanvas)
              this.handleStartMouse(event);
          });
          //this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.handleStart, this);
          //this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.handleMove, this);
          //this.app.mouse.on(pc.EVENT_MOUSEUP, this.handleEnd, this);
        }



      };
      InertialSpin.prototype.update = function () {
        if (!this.isUserControlling) {
          this.dx = Math.abs(this.dx) > this.MIN_DELTA
            ? this.dx * this.DRAG
            : 0;
          this.dy = Math.abs(this.dy) > this.MIN_DELTA
            ? this.dy * this.DRAG
            : 0;
          if (this.dx && this.dx) {
            this.rotate();
          }
        }
      };
      InertialSpin.prototype.rotate = function () {
        this.horizontalQuat.setFromAxisAngle(this.app.root.up, this.dx);
        this.verticalQuat.setFromAxisAngle(this.app.root.right, this.dy);
        this.resultQuat.mul2(this.horizontalQuat, this.verticalQuat);
        this.resultQuat.mul(this.entity.getRotation());
        this.entity.setRotation(this.resultQuat);
      };
      InertialSpin.prototype.updateDeltas = function (x, y) {
        this.dx = (x - this.lastPoint.x) * this.ROTATION_SPEED;
        this.dy = (y - this.lastPoint.y) * this.ROTATION_SPEED;
        this.lastPoint.set(x, y);
      }
      InertialSpin.prototype.handleStart = function (e) {
        this.isUserControlling = true;
        if (e.event.type === pc.EVENT_TOUCHSTART) {
          this.lastPoint.set(e.touches[0].x, e.touches[0].y);
        } else {
          this.lastPoint.set(e.x, e.y);
        }
      };
      InertialSpin.prototype.handleStartMouse = function (e) {
        this.isUserControlling = true;
        this.lastPoint.set(e.x, e.y);
      };
      InertialSpin.prototype.handleMove = function (e) {

        if (e.event.type === pc.EVENT_TOUCHMOVE) {
          this.updateDeltas(e.touches[0].x, e.touches[0].y);
          this.rotate();
        } else if (this.app.mouse.isPressed(pc.MOUSEBUTTON_LEFT)) {
          this.updateDeltas(e.x, e.y);
          this.rotate();
        }

      }
      InertialSpin.prototype.handleMoveMouse = function (e) {
        if (this.app.mouse.isPressed(pc.MOUSEBUTTON_LEFT) && (this.isUserControlling)) {
          this.updateDeltas(e.x, e.y);
          this.rotate();
        }

      }
      InertialSpin.prototype.handleEnd = function (e) {
        this.isUserControlling = false;
      }

      
      /**********************************************
      * ENTITY: MULTITEX CUBE
      * ---------------------------------------------
      * creates an entity that contains several
      * plane entities arranged in the shape of a cube
      *
      * this allows for setting individual textures on
      * each face of the cube
      *
      * face orientation is written as such:
      *  [
      *    ...
      *    [[posX, poxY, posZ], [rotX, rotY, rotZ]],
      *    ...
      *  ]
      **********************************************/
      class MultiTexCube extends pc.Entity {
        constructor(...p) {
          super(...p);
          this.faces = [
            [[0.5, 0, 0], [0, 0, -90]],
            [[-0.5, 0, 0], [0, 0, 90]],
            [[0, 0.5, 0], [0, 0, 0]],
            [[0, -0.5, 0], [180, 0, 0]],
            [[0, 0, 0.5], [90, 0, 0]],
            [[0, 0, -0.5], [-90, 0, 0]]
          ].map(([p, r]) => {
            const mat = new pc.StandardMaterial();
            const face = new pc.Entity();
            face.setLocalEulerAngles(r[0], r[1], r[2]);
            face.setLocalPosition(p[0], p[1], p[2]);
            face.addComponent('model', { type: 'plane' });
            face.model.model.meshInstances[0].material = mat;
            this.addChild(face);
            return face;
          });
        }

        setLinks(urls) {
          if (!Array.isArray(urls) || !urls.length) return;
          urls.slice(0, 6).forEach((url, i) => {
            this.faces[i].onClick = function () {
              window.open(url, '_blank', 'noopener,noreferrer')
              const initialColor = document.body.style.backgroundColor
              document.body.style.backgroundColor = 'red'
              setTimeout(() => {
                document.body.style.backgroundColor = initialColor;
              },1000)
            }
          })
        }

        setTextures(urls) {
          if (!Array.isArray(urls) || !urls.length) return;
          urls.slice(0, 6).forEach((url, i) => {
            const mat = this.faces[i].model.model.meshInstances[0].material;
            const asset = new pc.Asset(url, 'texture', { url });
            app.assets.add(asset);
            app.assets.load(asset);

            asset.ready(() => {
              asset.resource.addressU = pc.ADDRESS_CLAMP_TO_EDGE;
              asset.resource.addressV = pc.ADDRESS_CLAMP_TO_EDGE;
              mat.shininess = 95;
              mat.useMetalness = true;
              mat.metalnessMapOffset.set(-0.5, -0.5);
              mat.metalnessMapTiling.set(2, 2);
              mat.metalnessMap = asset.resource;
              mat.update();
            });
          });
        }

        setDiffuseMap(asset) {
          asset.ready(() => {
            this.faces.forEach(f => {
              const mat = f.model.model.meshInstances[0].material;
              mat.diffuseMap = asset.resource;
              mat.update();
            });
          })
        };

        setCubemap(cubemap) {
          cubemap.ready(() => {
            this.faces.forEach(f => {
              const mat = f.model.model.meshInstances[0].material;
              //mat.cubeMap = cubemap.resources; //jb
              //mat.update(); //jb
            });
          });
        }
      }

      const cube = new MultiTexCube();
      cube.setLinks(SOCIAL_LINKS.map(l => l.link));
      cube.setTextures(SOCIAL_LINKS.map(l => l.image));
      cube.setDiffuseMap(blackmarbleInverted);
      cube.setCubemap(cubemapAsset);
      cube.addComponent('script');
      cube.script.create(InertialSpin.__name);
      cube.setLocalScale(0.8, 0.8, 0.8);
      app.root.addChild(cube);

      /**********************************************
      * ENTITY: ENVIRONMENT CUBE
      * ---------------------------------------------
      * creates a simple cube that is inverted
      * to display textures on the inner surfaces
      **********************************************/
      /*
       const environment = new pc.Entity();
       const environmentMaterial = new pc.StandardMaterial();
       environment.addComponent('model', { type: 'box', isStatic: true });
       environment.setLocalScale(-7, 7, -7);
       app.root.addChild(environment);
       blackmarble.ready(() => {
         environment.model.model.meshInstances[0].material = environmentMaterial;
         environmentMaterial.cull = pc.CULLFACE_FRONT;
         environmentMaterial.diffuseMap = blackmarble.resource;
         environmentMaterial.update();
       });
       */
      /**********************************************
      * ENTITIES: LIGHTS
      * ---------------------------------------------
      * creates and places lights throughout
      * the scene
      **********************************************/
      const lightA = new pc.Entity();
      lightA.addComponent('light', {
        type: 'point',
        range: 20,
        intensity: 0.9,
      });
      lightA.setPosition(-4, 6, 2);
      app.root.addChild(lightA);

      const lightB = new pc.Entity();
      lightB.addComponent('light', {
        type: 'point',
        range: 20,
      });
      lightB.setPosition(4, -6, -6);
      app.root.addChild(lightB);

      const lightC = new pc.Entity();
      lightC.addComponent('light', {
        type: 'point',
        range: 20,
        intensity: 0.9,
      });
      lightC.setPosition(4, -6, 6);
      app.root.addChild(lightC);





      /*
          const app = new pc.Application(
            canvasRef.current,
            { graphicsDeviceOptions: { alpha: true } }
          );
      
          app.start();
      
          app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
          app.setCanvasResolution(pc.RESOLUTION_AUTO);
      
          window.addEventListener('resize', function () {
            app.resizeCanvas();
          });
      
          const cube = new pc.Entity('cube');
          cube.addComponent('model', {
            type: 'box',
          });
      
          // make the cube red
          cube.model.material = new pc.StandardMaterial();
          cube.model.material.diffuse = new pc.Color(1, 0, 0);
          
          // add vite.svg as a texture
          const texture = new pc.Texture(app.graphicsDevice, {
            format: pc.PIXELFORMAT_R8_G8_B8_A8,
            autoMipmap: false,
          });
          texture.setSource('./watercolor.png');
          cube.model.material.diffuseMap = texture;
      
      
          const camera = new pc.Entity('camera');
          camera.addComponent('camera', {
            clearColor: new pc.Color(0.0, 0.0, 0.0, 0.0),
          });
      
          const light = new pc.Entity('light');
          light.addComponent('light');
      
          app.root.addChild(cube);
          app.root.addChild(light);
      
          app.scene.ambientLight = new pc.Color(0.2, 0.2, 0.2);
      
      
          camera.setPosition(0, 0, 3);
          light.setEulerAngles(45, 0, 0);
          app.root.addChild(camera);
      
          console.log('V --------------------------------- V');
          console.log(canvasRef.current.style.top);
          console.log('^ --------------------------------- ^');
      
          let canvasX = window.innerWidth/2;
          let canvasY = window.innerHeight/2;
      
          app.on('update', (deltaTime) => {
            cube.rotate(10 * deltaTime, 20 * deltaTime, 30 * deltaTime);
      
            canvasRef.current.style.left = `${canvasX}px`;
            canvasRef.current.style.top = `${canvasY}px`;
      
            canvasX += Math.random() * 2 - 1;
            canvasY += Math.random() * 2 - 1;
      
          });
      */
      appRef.current = app;
    }
  }, []);

  return (
    <a>
      <canvas ref={canvasRef} className="playcanvas" />
    </a>
  );
}


export default PlayCanvas;