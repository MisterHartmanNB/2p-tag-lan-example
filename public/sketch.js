var Player = [];
var itDisplay;
var noTagBacks = false;
var timer = 60*60;
var displayTime;
let tileSet = {
  "1": null,
};
var gravity = 2;
var socket = io.connect('127.0.0.1:3000');
let otherPlayers = [];

class tile {
  constructor(xOffset, yOffset) {
    this.xOffset = xOffset;
    this.yOffset = yOffset;
  }
  
  draw(tileMap) {
    if (tileMap.tileData[this.yOffset]) if (tileMap.tileData[this.yOffset][this.xOffset]) {
      let tile = tileMap.tileData[this.yOffset][this.xOffset];
      
      //console.log(tile)
      if (tileSet[tile]) image(tileSet[tile],(this.xOffset * 16), this.yOffset * 16,16,16)
    }
  }
}

class player {
  constructor(x,y,teamColor,mapObj,pnum,isIt) {
    this.x = x;
    this.y = y;
    this.xvel = 0;
    this.yvel = 0;
    this.tileBelow = false;
    this.tileAbove = false;
    this.tileLeft = false;
    this.tileRight = false;
    this.teamColor = teamColor;
    this.mapObj = mapObj;
    this.motion = "none";
    this.isIt = isIt
    //this.isFalling = false;
    switch (pnum) {
      case 0:
        this.up = 87;
        this.left = 65;
        this.right = 68;
        break;
      case 1:
        this.up = UP_ARROW;
        this.left = LEFT_ARROW;
        this.right = RIGHT_ARROW;
        break;
    }
  }
  
  drawPlayer() {
    fill(this.teamColor);
    square(this.x, this.y,20);
  }
  
  horizontalCheck(x,y) {
    return (this.mapObj.getTileAt(x,y)||this.mapObj.getTileAt(x,y+10)||this.mapObj.getTileAt(x,y+20));
  }
  
  verticalCheck(x,y) {
    return (this.mapObj.getTileAt(x,y)||this.mapObj.getTileAt(x+10,y)||this.mapObj.getTileAt(x+20,y));
  }
  
  updatePlayer() {
    this.tileAbove = (this.mapObj.getTileAt(this.x,this.y-1)||this.mapObj.getTileAt(this.x+10,this.y-1)||this.mapObj.getTileAt(this.x+20,this.y-1));
    this.tileLeft = (this.mapObj.getTileAt(this.x-1,this.y)||this.mapObj.getTileAt(this.x-1,this.y+10)||this.mapObj.getTileAt(this.x-1,this.y+20));
    this.tileRight = (this.mapObj.getTileAt(this.x+21,this.y)||this.mapObj.getTileAt(this.x+21,this.y+10)||this.mapObj.getTileAt(this.x+21,this.y+20));
    this.tileBelow = (this.mapObj.getTileAt(this.x,this.y+21)||this.mapObj.getTileAt(this.x+10,this.y+21)||this.mapObj.getTileAt(this.x+20,this.y+21));
    if(this.tileBelow>1) this.tileBelow = 1;
    if(this.tileAbove>1) this.tileAbove = 1;
    //console.log(this.tileBelow);
    //Check if moving all of our yvel would put us into the floor, stop early if it does
    //console.log(this.yvel);
    if((this.yvel>0)&&(this.verticalCheck(this.x,this.y+20+this.yvel))) {
      for(var i = this.yvel;i<0;i--) {
        if(this.verticalCheck(this.x,this.y+20+i)) {
          this.yvel = i;
          //console.log("This activated");
          break;
        }
      }
    }
    //again, but for above us
    if(((this.xvel>0)&&(!this.tileRight))||((this.xvel<0)&&(!this.tileLeft)))this.x += this.xvel;
    if(((this.yvel>0)&&(!this.tileBelow))||((this.yvel<0)&&(!this.tileAbove)))this.y += this.yvel;
    if(!this.tileBelow) this.yvel += gravity;
    //If we're moving left and hit the right side of an object
    
    if(this.tileLeft&&(this.xvel<0)){
      this.xvel = 0;
      //this.x = 16*ceil(this.x/16);
      //console.log(this.mapObj.getTileAt(this.x,this.y+17));
    }
    //If we're moving right and hit the left side of an object
  if(this.tileRight&&(this.xvel>0)){
      this.xvel = 0;
      //this.x = 16*floor(this.x/16);
    }
    
    //If we're moving down and hit the top of an object
    if(this.tileBelow&&(this.yvel>0)){
      this.yvel = 0;
      //this.y = 16*floor(this.y/16)-4;
      //console.log(this.yvel);
      //console.log(this.y);
      //this.tileBelow = true;
    }
    
    //If we're moving up and hit the bottom of an object
    if(this.tileAbove&&(this.yvel<0)){
      this.yvel = 0;
      //this.y = 16*ceil(this.y/16);
    }
    
    //if(this.mapObj.getTileAt(this.x+10,this.y+10)) this.yvel = 10; console.log("In the walll");
    //if we push right/left

    if (this.x>=410) this.x = -5;
    if(this.x<=-10) this.x = 405;
    
    //If we're in a wall, put us on top of it.
    
    if(this.mapObj.getTileAt(this.x,this.y+20)||this.mapObj.getTileAt(this.x+20,this.y+20)) {
        this.y = Math.floor(((this.y+20)/16)-1)*16-5;
       }
    
    //If we hit the ceiling, bump us down
    
    if(this.mapObj.getTileAt(this.x,this.y)||this.mapObj.getTileAt(this.x+20,this.y)) {
      this.y = Math.ceil((this.y/16)-1)*16+15;
    }
  }
  
  move() {
    switch(this.motion) {
      case "left":
        this.xvel = -5;
        break;
      case "right":
        this.xvel = 5;
        break;
      case "none":
        this.xvel = 0;
        break;
    }
  }
  
  setMotion() {
    switch(keyCode) {
      case this.left:
        this.motion = "left";
        //console.log(this.motion);
        break;
      case this.right:
        this.motion = "right";
        break;
    }
  }
  
  stop() {
    if ((keyCode==this.left)||(keyCode==this.right))this.motion = "none";
  }
  
  jump() {
    if((keyCode==this.up)&&(this.tileBelow==true)) {
      this.yvel = -20;
      //this.tileBelow=false;
  }
  }
}

class tileMap {
  constructor(Width, Height) {
    this.tiles = [];
    this.tileData = [];
    
    this.WorldWidth = 0;
    
    this.Width = Width;
    this.Height = Height;
    for (let y = 0; y < Height; y++) {
      let column = [];
      for (let x = 0; x < Width; x++) {
        column.push(new tile(x, y));
      }
      this.tiles.push(column);
    }
  }
  
  draw() {
    for (let y = 0; y < this.Height; y++) {
      for (let x = 0; x < this.Width; x++) {
        this.tiles[y][x].draw(this);
      }
    }
  }
  
  blankLevel(Width,Height) {
    this.tileData = [];
    this.WorldWidth = 0;
    for (let y = 0; y < Height; y++) {
      let column = []
      for (let x = 0; x < Width; x++) {
        if (x > this.WorldWidth) {
          this.WorldWidth = x;
        }
        if (y > Height-3) {
          column.push("1");
        }
        else {
          column.push(0);
        }
      }
      this.tileData.push(column);
    }
    
    this.editorSave = this.tileData;
  }
  
  getTileAt(x,y) {
    x /= 16;
    y /= 16;
    
    x = floor(x);
    y = floor(y);
    
    if (this.tileData[y]) {
      return this.tileData[y][x];
    }
    return this.tileData[y];
  }
}

//      ___           ___                       ___           ___           ___     
//     /\__\         /|  |                     /\  \         /\  \         /\  \    
//    /:/ _/_       |:|  |          ___       |::\  \       /::\  \        \:\  \   
//   /:/ /\  \      |:|  |         /|  |      |:|:\  \     /:/\:\  \        \:\  \  
//  /:/ /::\  \   __|:|  |        |:|  |    __|:|\:\  \   /:/ /::\  \   _____\:\  \ 
// /:/_/:/\:\__\ /\ |:|__|____    |:|  |   /::::|_\:\__\ /:/_/:/\:\__\ /::::::::\__\
// \:\/:/ /:/  / \:\/:::::/__/  __|:|__|   \:\~~\  \/__/ \:\/:/  \/__/ \:\~~\~~\/__/
//  \::/ /:/  /   \::/~~/~     /::::\  \    \:\  \        \::/__/       \:\  \      
//   \/_/:/  /     \:\~~\      ~~~~\:\  \    \:\  \        \:\  \        \:\  \     
//     /:/  /       \:\__\          \:\__\    \:\__\        \:\__\        \:\__\    
//     \/__/         \/__/           \/__/     \/__/         \/__/         \/__/    

let myTilemap = new tileMap(26,26);


let grass;
let wood;


function preload() {
  grass = loadImage("grass.png"); 
  wood = loadImage("wood.jpg");
  tileSet["1"] = grass;
  tileSet["2"] = wood;
  
  
}





function setup() {
  socket.on('player',function(data){
    let newPlayer = true;
    for(let i = 0; i < otherPlayers.length; i++) {
      if(data.id==otherPlayers[i].id) {
        newPlayer = false;
      }
    }
    if(newPlayer) {
      otherPlayers.push(data);
    } else {
      for(let i = 0; i < otherPlayers.length; i++) {
        if(data.id==otherPlayers[i].id) {
          otherPlayers[i].x = data.x;
          otherPlayers[i].y = data.y;
          otherPlayers[i].teamColor = data.teamColor;
        }
      }
    }
  });
  createCanvas(400, 400);
  myTilemap.blankLevel(26,26)
  Player[0] = new player(80,330,'red',myTilemap,0,true); // player1  start Pos
  //Player[1] = new player(300,330,'blue',myTilemap,1,false); // player2 start Pos
  //console.log('HARTMAN WILL HELP ON TUEDSAY!!!');
  itDisplay = createDiv('It:');
  itDisplay.position(0,0);
  itDisplay.style('color','red');
  displayTime = createDiv("Time: "+round(timer/60));
  displayTime.position(width-displayTime.width);
  displayTime.style('color','red');
  myTilemap.tileData = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,2,2,2,2,2,0,0,0,0,0,0,0,0,0,2,2,2,2,2,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ]
}

function draw() {
  background(0, 174, 255);
  myTilemap.draw();
  Player[0].updatePlayer();
  //Player[1].updatePlayer();
  Player[0].drawPlayer();
  //Player[1].drawPlayer();
  Player[0].move();
  //Player[1].move();
  displayIt();
  //pieceContact();
  //timer--;
  if (timer==0) {
    noLoop();
  }
  send();
  drawOtherPlayers();
}
//Draw the other players
function drawOtherPlayers() {
  for (let i = 0; i < otherPlayers.length; i++) {
    console.log(otherPlayers[i]);
    fill(otherPlayers[i].teamColor);
    square(otherPlayers[i].x, otherPlayers[i].y,20);
  }
}
//player controlls
function keyPressed() {
  Player[0].setMotion();
  //Player[1].setMotion();
  Player[0].jump();
  //Player[1].jump();
}

function keyReleased() {
  Player[0].stop();
  //Player[1].stop();
}



function displayIt() {
  if(Player[0].isIt) fill('red'); 
  //if(Player[1].isIt) fill('blue');
  square(15,0,15);
}
/*
function pieceContact() {
  if((Player[0].x==Player[1].x)&&(Player[0].y==Player[1].y)&&(!noTagBacks)) {
    if(Player[0].isIt) {
      Player[0].isIt = false;
    } else if(!Player[0].isIt) {
      Player[0].isIt = true;
    }
    if(Player[1].isIt) {
      Player[1].isIt = false;
    } else if(!Player[1].isIt) {
      Player[1].isIt = true;
    }
    noTagBacks = true;
    //console.log(Player[0].isIt);
    //console.log(Player[1].isIt);
  }
  
  if((Player[0].x!=Player[1].x)||(Player[0].y!=Player[1].y)) noTagBacks = false;
  //console.log(noTagBacks);
 
} */
function send() {
  socket.emit('player', {
    x: Player[0].x,
    y: Player[0].y,
    teamColor: Player[0].teamColor
  });
}