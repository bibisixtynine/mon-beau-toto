import React, { useLayoutEffect, useRef } from 'react';
import * as pc from 'playcanvas';
import "./PlayCanvas.css"

const PlayCanvas = () => {
  const canvasRef = useRef(null);
  const appRef = useRef(null);

  useLayoutEffect(() => {
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

    const camera = new pc.Entity('camera');
    camera.addComponent('camera', {
      clearColor: new pc.Color(0.0, 0.0, 0.0, 0.0),
    });

    const light = new pc.Entity('light');
    light.addComponent('light');

    app.root.addChild(cube);
    app.root.addChild(light);

    camera.setPosition(0, 0, 3);
    light.setEulerAngles(45, 0, 0);
    app.root.addChild(camera);

    console.log('V --------------------------------- V')
    console.log(canvasRef.current.style.top)
    console.log('^ --------------------------------- ^')

    let canvasX = 100
    let canvasY = 100

    app.on('update', (deltaTime) => {
      cube.rotate(10 * deltaTime, 20 * deltaTime, 30 * deltaTime);
      
      canvasRef.current.style.left = `${canvasX}px`
      canvasRef.current.style.top = `${canvasY}px`

      canvasX += Math.random() * 2 - 1
      canvasY += Math.random() * 2 - 1

    });

    appRef.current = app;

  }, []);

  return (
    <div>
      <canvas ref={canvasRef} className="playcanvas" />
    </div>
  );
};

export default PlayCanvas;