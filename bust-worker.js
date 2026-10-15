let once = true
let display; 
let context;
let ctx
let offscreen;
function move(com){
  if (com.physics) {
      com.gravitySpeed += com.gravity;
      com.x += com.speedX;
      com.y += com.speedY + com.gravitySpeed;
    } else {
      com.x += com.speedX;
      com.y += com.speedY;
    }
}
function moveAngle(com){
  com.gravitySpeed += com.gravity;
  com.x += com.speedX * Math.cos(com.angle);
  com.y += com.speedY * Math.sin(com.angle) + com.gravitySpeed;
}
function update(ctx, com){
  
  if (com.type === "text") {
      ctx.font = `${com.width} ${com.height}`;
      ctx.fillStyle = com.color;
      ctx.fillText(com.text, com.x, com.y);
    } else if (com.changeAngle) {
      ctx.save();
      ctx.translate(com.x + com.width / 2, com.y + com.height / 2);
      ctx.rotate(com.angle);
      if (com.type === "image") {
        ctx.drawImage(
          com.image,
          com.width / -2,
          com.height / -2,
          com.width,
          com.height,
        );
      } else {
        ctx.fillStyle = com.color;
        ctx.fillRect(
          com.width / -2,
          com.height / -2,
          com.width,
          com.height,
        );
      }
      ctx.restore();
    } else {
      if (com.type === "image") {
        ctx.drawImage(com.image, com.x, com.y, com.width, com.height);
      } else {
        ctx.fillStyle = com.color;
        ctx.fillRect(com.x, com.y, com.width, com.height);
      }
    }
}
function crashWith(otherobj, com) {
    const centerX = com.x + com.width / 2;
    const centerY = com.y + com.height / 2;
    const otherCenterX = otherobj.x + otherobj.width / 2;
    const otherCenterY = otherobj.y + otherobj.height / 2;

    const rotatedX =
      (otherCenterX - centerX) * Math.cos(-com.angle) -
      (otherCenterY - centerY) * Math.sin(-com.angle) +
      centerX;
    const rotatedY =
      (otherCenterX - centerX) * Math.sin(-com.angle) +
      (otherCenterY - centerY) * Math.cos(-com.angle) +
      centerY;

    const myleft = com.x;
    const myright = com.x + com.width;
    const mytop = com.y;
    const mybottom = com.y + com.height;
    const otherleft = rotatedX - otherobj.width / 2;
    const otherright = rotatedX + otherobj.width / 2;
    const othertop = rotatedY - otherobj.height / 2;
    const otherbottom = rotatedY + otherobj.height / 2;
    let crash = true;
    if (
      mybottom < othertop ||
      mytop > otherbottom ||
      myright < otherleft ||
      myleft > otherright
    ) {
      crash = false;
    }
    return crash;
}

self.onmessage = (e) => {
    if(once){
        once = false
        display = e.data
        offscreen = e.data
        context = display.getContext("2d")
        ctx = context
        console.log(ctx)

    }else{
        display = e.data
        context.clearRect(0,0, e.data.margin[0], e.data.margin[1]);
  context.save();
  if (display.camera.rotationShake !== 0) {
    const centerX = display.canvas.width / 2;
    const centerY = display.canvas.height / 2;
    context.translate(centerX, centerY);
    context.rotate(display.camera.rotationShake);
    context.translate(-centerX, -centerY);
  }

  context.translate(-display.camera.x, -display.camera.y);
  // Draw the cached fake canvas as an image to main display


  // Update game logic

  // Render the cached image to main display
  // Also render any dynamic components that need real-time updates
  display.varible.comm.forEach((component) => {
    if (component.scene == display.scene) {
      if (component.x.angularMovement) {
        moveAngle(component.x);
      } else {
        move(component.x);
      }
      if (crashWith(component.x, display.varible.TCJSgameGameArea)) {
        try {
          update(context, component.x);
        } catch (e) {
          // console.error("Main display render error:", e)
        }
      }
    }
  });

  context.restore();
  self.postMessage(offscreen.transferToImageBitmap())
    }
}