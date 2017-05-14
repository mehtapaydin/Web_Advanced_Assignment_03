// each user/client/browser opens a socket and sessionId is its identifier.
var socket = io();
var sessionId = '';
paths = {};

tool.maxDistance=20

socket.on('connect', function() {

  // when client connected to the server, set its id as sessionId
  sessionId = socket.id;

  // put session id to the screen
  var text = new PointText(new Point(10, 10));
  text.fillColor = 'black';
  text.content = 'My identifier (sessionId): ' + sessionId;
  view.draw();

});

socket.on( 'client:startPath', function( data, sessionId ) {
  startPath(data.point, data.color, sessionId);
});

socket.on( 'client:continuePath', function( data, sessionId ) {
  continuePath(data.top, data.bottom, sessionId);
  view.draw();
});

socket.on( 'client:endPath', function( data, sessionId ) {
  endPath(data.point, sessionId);
  view.draw();
});

function randomColor() {
  return {
    hue: Math.random() * 360,
    saturation: 0.8,
    brightness: 0.8,
    alpha: 0.5
  };
}

function onMouseDown(event) {
  color = randomColor();
  startPath(event.point, color, sessionId);
  socket.emit('server:startPath', {point: event.point, color: color}, sessionId);
}

function onMouseDrag(event) {

  var step = event.delta / 2;
  step.angle += 90;
  var top = event.middlePoint + step;
  var bottom = event.middlePoint - step;

  continuePath(top, bottom, sessionId);
  socket.emit('server:continuePath', {top: top, bottom: bottom}, sessionId);
}

function onMouseUp(event) {
  endPath(event.point, sessionId);
  socket.emit('server:endPath', {point: event.point}, sessionId);
}

function startPath( point, color, sessionId ) {
  paths[sessionId] = new Path();
  paths[sessionId].fillColor = color;
  paths[sessionId].add(point);
}

function continuePath(top, bottom, sessionId) {
  var path = paths[sessionId];
  path.add(top);
  path.insert(0, bottom);
}

function endPath(point, sessionId) {
  var path = paths[sessionId];
  path.add(point);
  path.closed = true;
  path.smooth();

  delete paths[sessionId]
}