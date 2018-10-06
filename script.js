
var canvas = d3.select("canvas").call(d3.zoom().scaleExtent([1, 10]).on("zoom", zoom)),
    context = canvas.node().getContext("2d"),
    width = canvas.property("width"),
    height = canvas.property("height");

var imageObj = new Image();
imageObj.onload = function(){
    context.drawImage(imageObj,0,0,imageObj.width,imageObj.height,0,0,width,height);
};
imageObj.src = "exported.png";

function zoom() {
  var transform = d3.event.transform;
  context.save();
  context.clearRect(0, 0, width, height);
  context.translate(transform.x, transform.y);
  context.scale(transform.k, transform.k);
  draw();
  context.restore();
}

function draw() {
  canvas.node().getContext("2d");
  context.drawImage(imageObj,0,0,imageObj.width,imageObj.height,0,0,width,height);
}
