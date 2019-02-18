"use strict";

var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");
var canvas2 = document.getElementById("scoreCanvas");
var ctx2 = canvas2.getContext("2d");

var gameArea = undefined;
var DirectionEnum = Object.freeze({UP:1, RIGHT:2, DOWN:3, LEFT:4});
var snakeAlive;
var direction;
var size;
var snake = [];
var food = {};
var score;

function initializeVars() {
  size = 10;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas2.width = window.innerWidth;
  canvas2.height = window.innerHeight;

  var gameStartX = normalizeLengthsBySize((canvas.width/2)-250);
  var gameEndX = normalizeLengthsBySize((canvas.width/2)+250);
  var gameStartY = normalizeLengthsBySize((canvas.height/2)-250);
  var gameEndY = normalizeLengthsBySize((canvas.height/2)+250);
  gameArea = { startX: gameStartX, startY: gameStartY,
              endX: gameEndX, endY: gameEndY };

  snakeAlive = true;
  direction = DirectionEnum.RIGHT;
  snake = [];
  for(var i=0; i<4; i++)
    snake.push({x: gameStartX+30+i, y: gameStartY+30});
  food = createFood();
  score = 0;
}

function initializeCanvas() {
  initializeVars();
  clearCanvas(canvas);
  clearCanvas(canvas2);
  redraw ();
}

function normalizeLengthsBySize(number) {
  return Math.round(number/size)*size;
}

function clearCanvasArea(ctx, area) {
  ctx.clearRect(area.startX, area.startY, area.endX-area.startX, area.endY-area.startY);
}

function clearCanvas(canvas) {
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function redraw() {
  clearCanvasArea(ctx, gameArea);

  ctx.strokeStyle = 'blue';
  ctx.lineWidth = '0.5';

  ctx.strokeRect(gameArea.startX, gameArea.startY,
    gameArea.endX-gameArea.startX, gameArea.endY-gameArea.startY);

  drawfood(food.x, food.y, size, size);
  drawSnake();
  drawScore();
  advanceSnake();

  if(snakeAlive === true)
    setTimeout(redraw, 200);
  else {
    gameOver();
  }
}

function drawSnake() {
  snake.forEach(function(snakePart, index) {
    drawSnakePart(snakePart.x, snakePart.y, size);
  });
}

function drawScore() {
  ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
  ctx2.font = "20px Arial";
  ctx2.fillStyle = "yellow";
  ctx2.strokeStyle = "none";
  ctx.textAlign = "center";
  //ctx2.fillText("SCORE : "+score, gameArea.endX-150, 25);
  ctx2.fillText("SCORE : "+score,
                  gameArea.startX,
                  gameArea.startY-20);
}

function drawSnakePart(x, y, size) {
  ctx.beginPath();
  ctx.rect(x, y, size, size);
  ctx.fillStyle = "yellow";
  ctx.strokeStyle = "green";
  ctx.fill();
  ctx.stroke();
}

function drawfood(x, y, size) {
  ctx.beginPath();
  ctx.fillStyle = "orange";
  ctx.fillRect(x, y, size, size);
}

function changeSnakeDirection(newDirection) {
  if((direction + newDirection) % 2 == 0)
    return; //don't allow 180 degree turnarounds
  direction = newDirection;
}

function advanceSnake() {
  const head = {x: snake[0].x, y: snake[0].y};
  var gameOver = checkIfHitWalls(head);
  var ateFood = checkIfHitFood(head);
  switch(direction) {
    case DirectionEnum.UP : head.y -= size; break;
    case DirectionEnum.DOWN : head.y += size; break;
    case DirectionEnum.RIGHT : head.x += size; break;
    case DirectionEnum.LEFT : head.x -= size; break;
  }
  if(!gameOver)
    snake.unshift(head);
  if(ateFood !== true)
    snake.pop();
}

function getRandom(min, max) {
  var random = min + (Math.random() * (max-min));
  return normalizeLengthsBySize(random);
}

function createFood() {
  var foodX = getRandom(gameArea.startX, gameArea.endX);
  var foodY = getRandom(gameArea.startY, gameArea.endY);
  var food = { x: foodX, y: foodY };
  return food;
}

function checkIfHitWalls(head) {
  if(head.x == gameArea.startX || head.y == gameArea.startY ||
    (gameArea.endX - head.x <= size) || (gameArea.endY - head.y <= size) ) {
    snakeAlive = false;
    return true;
  }
  return false;
}

function checkIfHitFood(head) {
  if(head.x == food.x && head.y == food.y) {
    score += 10;
    food = createFood();
    return true;
  }
  return false;
}

function gameOver() {
  ctx.font = "60px Impact";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER",
                (gameArea.endX-gameArea.startX)/2 + gameArea.startX,
                (gameArea.endY-gameArea.startY)/2  + gameArea.startY);

  ctx.font = "20px Impact";
  ctx.fillText("Press <space> to play again",
                (gameArea.endX-gameArea.startX)/2 + gameArea.startX,
                (gameArea.endY-gameArea.startY)/2 + gameArea.startY + 30);
}

document.onkeydown = changeDirection;
function changeDirection(e) {
  e = e || window.event;
  if(e.keyCode === 38) //up arrow
    changeSnakeDirection(DirectionEnum.UP);

  else if(e.keyCode === 40) //down arrow
    changeSnakeDirection(DirectionEnum.DOWN);

  else if(e.keyCode === 37) //left arrow
    changeSnakeDirection(DirectionEnum.LEFT);

  else if(e.keyCode === 39) //right arrow
    changeSnakeDirection(DirectionEnum.RIGHT);

  else if(e.keyCode === 32) //space. Hidden Trick: can fasten the game too!
    initializeCanvas();
}


initializeCanvas();
