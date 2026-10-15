let worker = new Worker("bust-worker.js")
// let offscreen = new OffscreenCtmap()
let offscreen;
let nextTCJSgameFrame = false
function upgradePerform() {
  display.OffscreenCanvas = document.createElement("canvas")
  display.Offscreen = document.createElement("canvas").getContext("bitmaprenderer")
  offscreen = display.OffscreenCanvas.transferControlToOffscreen()
    Display.prototype.perform = function () {
  Display.prototype.start = function (
    width = 480,
    height = 270,
    no = document.body,
  ) {
    this.canvas.width = width;
    this.ff = 0
    this.canvas.height = height;
    offscreen.width = width;
    offscreen.height = height;
    no.insertBefore(this.canvas, no.childNodes[0]);
    this.clearMargin = [width * width, height * height];
    console.log(display.clearMargin);
    TCJSgameVariable.TCJSgameGameArea = new Component(
      display.clearMargin[0],
      display.clearMargin[1],
      "black",
      display.camera.x,
      display.camera.y,
    );
    TCJSgameGameArea = TCJSgameVariable.TCJSgameGameArea;
    this.interval = ani();
    display.timing = 0;
    this.mapWidth = this.canvas.width;
    this.mapHeight = this.canvas.height;
    this.cachePic;
    this.time;
    this.deltaTime = 0;
    this.timeFromPreviousFrames = 0;
    display.contTime = 1; //develop's business
    this.addEventListeners();
    this.once = true;
    fake.start();
    worker.postMessage(offscreen, [offscreen])
  };
};
function ani(time) {
  
  let data;
  display.timeFromAllFrames = time;
  display.ff++
  // display.deltaTime =
  //   display.timeFromAllFrames - display.timeFromPreviousFrames;

  display.time = time;

  display.timing = display.time - display.contTime;
  if (time < 10) {
    display.deltaTime = 0;
  } else {
    display.deltaTime = 1 / display.fps
  }

  // Update delta time logic

  if (display.timing >= 1000) {
    display.contTime = display.time;

    display.fps = display.frame;
    display.frame = 0;
    TCJSgameVariable.refresh = false;
    
    //display.deltaTime = 1 / display.fps
  }
  
  //if (refresh) {

  //}
  // STEP 1: Render to fake canvas (offscreen buffer)

  if (display.once) {
    fake.context.clearRect(0, 0, fake.canvas.width, fake.canvas.height);
    fake.context.save();
    fake.context.translate(-fake.camera.x, -fake.camera.y);
    if (fake.bgComm) {
      //garii
      if (fake.bgComm.angularMovement) {
        fake.bgComm.moveAngle();
      } else {
        fake.bgComm.move();
      }
      try {
        fake.bgComm.update(fake.context);
      } catch {
        //pass
      }
    }
    // Render all components to fake canvas
    TCJSgameVariable.tileComm.forEach((component) => {
      if (component.layer == fake.scene) {
        if (component.x.angularMovement) {
          component.x.moveAngle();
        } else {
          component.x.move();
        }
        try {
          component.x.update(fake.context);
        } catch {
          //pass
        }
      }
    });
    TCJSgameVariable.commp.forEach((component) => {
      if (component.scene == fake.scene) {
        if (component.x.angularMovement) {
          component.x.moveAngle();
        } else {
          component.x.move();
        }
        try {
          // Use the bUpdate method which doesn't have angle transformations
          component.x.bUpdate(fake.context);
        } catch (e) {
          console.error("Fake canvas render error:", e);
        }
      }
    });
    fake.context.restore();
    if (display.frame > 2) {
      display.once = false;
      //display.cachePic = new Component(fake.canvas.width, fake.canvas.height,
      //fake.canvas.toDataURL(),
      //0, 0, "image")
      
      
    }
  }
  // try {
  //   update(dt = display.deltaTime / 1000); // Pass deltaTime to your update function
  // } catch (e) {
  //   console.error("Update error:", e);
  // }
  if(display.frame>2){
    try {
      update(dt = display.deltaTime); // Pass deltaTime to your update function
    } catch (e) {
      console.error("Update error:", e);
    }
    data = {"varible":TCJSgameVariable,"margin":display.clearMargin, "scene":display.scene, "camera":display.camera, "dt":display.deltaTime/1000, time:time}

    worker.postMessage(data)
    // console.log("Sent "+ display.ff)
  }
  // STEP 2: Now render fake canvas content to main display
  try {
    update(dt = display.deltaTime); // Pass deltaTime to your update function
  } catch (e) {
    console.error("Update error:", e);
  }
  display.clear();
  display.context.save();
  if (display.camera.rotationShake !== 0) {
    const centerX = display.canvas.width / 2;
    const centerY = display.canvas.height / 2;
    display.context.translate(centerX, centerY);
    display.context.rotate(display.camera.rotationShake);
    display.context.translate(-centerX, -centerY);
  }
  
  display.context.translate(-display.camera.x, -display.camera.y);
  
  // Draw the cached fake canvas as an image to main display
  
  display.context.drawImage(fake.canvas, 0, 0);
  
  // Update game logic
  
  // Render the cached image to main display
  
  // Also render any dynamic components that need real-time updates
  
  if(nextTCJSgameFrame){
    
    display.frame++
    display.Offscreen.transferFromImageBitmap(nextTCJSgameFrame)
    display.context.drawImage(display.Offscreen.canvas, display.camera.x, display.camera.y);
    display.timeFromPreviousFrames = time;
    // display.context.restore();
    nextTCJSgameFrame = false
    
    }
  
  display.frame++
  display.clear()
  display.context.drawImage(fake.canvas, 0, 0);
  TCJSgameVariable.comm.forEach((component) => {
    if (component.scene == display.scene) {
      if (component.x.angularMovement) {
        component.x.moveAngle();
      } else {
        component.x.move();
      }
      if (TCJSgameVariable.TCJSgameGameArea.crashWith(component.x)) {
        try {
          component.x.update(display.context);
        } catch (e) {
          // console.error("Main display render error:", e)
        }
      }
    }
  });
  // display.timeFromPreviousFrames = time;
  

  display.context.restore();
  
  
  return requestAnimationFrame(ani);
}
}
worker.onmessage = function(e){
  nextTCJSgameFrame = e.data
  // console.log("Recieved "+ display.ff)
 
}