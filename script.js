// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 1066;
canvas.height = 1066;
document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
    bgReady = true;
};
bgImage.src = "images/background.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
    heroReady = true;
};
heroImage.src = "images/hero.png";

// Monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
    monsterReady = true;
};
monsterImage.src = "images/shooter.png";
//hitter image
var chaserReady = false;
var chaserImage = new Image();
chaserImage.onload = function () {
    chaserReady = true;
};
chaserImage.src = "images/hitter.png";


// Border image
var borderReady = false;
var borderImage = new Image();
borderImage.onload = function () {
    borderReady = true;
};
borderImage.src = "images/border.png";

// Bullet image
var bulletReady = false;
var bulletImage = new Image();
bulletImage.onload = function () {
    bulletReady = true;
};
bulletImage.src = "images/bullet.png";

// Game objects
var hero = {
    speed: 200, // movement in pixels per second
    x: 0,
    y: 0
};
var monsters = [];
var maxMonsters = 3;
var monstersCaught = 0;
var border = {
    x: 0,
    y: 0
};
var bullets = [];
var chaser = {
    x: 0,
    y: 0,
    speed: 100 // movement in pixels per second
};
var chaser = {
    speed: 50,
    x: 0,
    y: 0
};
// Create the audio elements
var audioShoot = new Audio("sounds/Superhotgun.mp3");
var audioDeath = new Audio("sounds/Superhotdeath.mp3");
var audioKill = new Audio("sounds/Superhotkill.mp3");
var audioHot = new Audio("sounds/Superhot.mp3")

// Function to play the shoot sound
var playShootSound = function () {
    audioShoot.currentTime = 0;
    audioShoot.play();
};

// Function to play the death sound
var playDeathSound = function () {
    audioDeath.currentTime = 0;
    audioDeath.play();
};

// Function to play the kill sound
var playKillSound = function () {
    audioKill.currentTime = 0;
    audioKill.play();
};
var playSuperhotSound = function () {
    var audioSuperhot = new Audio("sounds/Superhot.mp3");
    audioSuperhot.play();
};
// Keyboard controls
var keysDown = {};
addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
}, false);
addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];
}, false);

// Timer
var gameTime = 30;
var timerInterval;

// Reset the game
var reset = function () {
    hero.x = canvas.width / 2;
    hero.y = canvas.height / 2;

    monsters = [];
    for (var i = 0; i < maxMonsters; i++) {
        spawnMonster();
    }
    spawnChaser();

    

    border.x = 64 + Math.random() * (canvas.width - 96);
    border.y = 64 + Math.random() * (canvas.height - 96);

    monstersCaught = 0;

    // Clear the bullets array
    bullets = [];
    playDeathSound();
    clearInterval(timerInterval);
    startTimer();
};

// Spawn a new monster randomly
var spawnMonster = function () {
    var minX = 80;
    var minY = 80;
    var maxX = canvas.width - 80 - 64;
    var maxY = canvas.height - 80 - 64;

    var middleX = canvas.width / 2;
    var middleY = canvas.height / 2;
    var minDistance = 100;

    var monster;
    do {
        monster = {
            x: minX + Math.random() * (maxX - minX),
            y: minY + Math.random() * (maxY - minY),
            lastShotTime: Date.now() + 2000 // Add 2-second delay before shooting starts
        };
    } while (
        Math.abs(monster.x - middleX) < minDistance &&
        Math.abs(monster.y - middleY) < minDistance
    );

    monsters.push(monster);
};

// Spawn chaser within the specified border, avoiding the middle region
var spawnChaser = function () {
    var minX = 80;
    var minY = 80;
    var maxX = canvas.width - 80 - 64;
    var maxY = canvas.height - 80 - 64;

    var middleX = canvas.width / 2;
    var middleY = canvas.height / 2;
    var minDistance = 200;

    do {
        chaser.x = minX + Math.random() * (maxX - minX);
        chaser.y = minY + Math.random() * (maxY - minY);
    } while (
        Math.abs(chaser.x - middleX) < minDistance &&
        Math.abs(chaser.y - middleY) < minDistance
    );
};

// Spawn a new bullet
var spawnBullet = function (x, y, angle) {
    var bullet = {
        x: x,
        y: y,
        speed: 400,
        angle: angle
    };
    bullets.push(bullet);
    playShootSound();
};

// Update game objects
var update = function (modifier) {
    if (38 in keysDown && hero.y > 30) { // holding up key
        hero.y -= hero.speed * modifier;
    }
    if (40 in keysDown && hero.y < canvas.height - (64 + 35)) { // holding down key
        hero.y += hero.speed * modifier;
    }
    if (37 in keysDown && hero.x > 20) { // holding left key
        hero.x -= hero.speed * modifier;
    }
    if (39 in keysDown && hero.x < canvas.width - (64 + 20)) { // holding right key
        hero.x += hero.speed * modifier;
    }

    
    // Move the chaser towards the player
    var chaserSpeed = chaser.speed * modifier;
    var deltaX = hero.x - chaser.x;
    var deltaY = hero.y - chaser.y;
    var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (distance > 0) {
        chaser.x += chaserSpeed * (deltaX / distance);
        chaser.y += chaserSpeed * (deltaY / distance);
    }
 // Check collision with the chaser
 if (
    hero.x <= chaser.x + 64 &&
    chaser.x <= hero.x + 64 &&
    hero.y <= chaser.y + 64 &&
    chaser.y <= hero.y + 64
) {
    reset(); // Reset the game
    playDeathSound();
}

for (var i = 0; i < monsters.length; i++) {
    

    if (monstersCaught >= 5) {
        reset();
        playSuperhotSound();
    }
}
    for (var i = 0; i < monsters.length; i++) {
        if (
            hero.x <= monsters[i].x + 64 &&
            monsters[i].x <= hero.x + 64 &&
            hero.y <= monsters[i].y + 64 &&
            monsters[i].y <= hero.y + 64
        ) {
            monsters.splice(i, 1); 
            monstersCaught++; 
            playKillSound();
            spawnMonster(); 
            break;
        }

        // Shoot bullets every  seconds
        var currentTime = Date.now();
        var lastShotTime = monsters[i].lastShotTime;
        if (currentTime - lastShotTime >= 1500) {
            var playerX = hero.x + 32;
            var playerY = hero.y + 32;
            var monsterX = monsters[i].x + 32;
            var monsterY = monsters[i].y + 32;

            var angle = Math.atan2(playerY - monsterY, playerX - monsterX);
            spawnBullet(monsterX, monsterY, angle);
            monsters[i].lastShotTime = currentTime;
        }
        if (monstersCaught >= 5) {
            reset();
            playSuperhotSound();
        }
    }

    // Prevent monsters from getting within 50 pixels of the canvas borders
    for (var i = 0; i < monsters.length; i++) {
        if (monsters[i].x < 80) {
            monsters[i].x = 80;
        } else if (monsters[i].x > canvas.width - 80) {
            monsters[i].x = canvas.width - 80;
        }

        if (monsters[i].y < 80) {
            monsters[i].y = 80;
        } else if (monsters[i].y > canvas.height - 80) {
            monsters[i].y = canvas.height - 80;
        }
    }

    // Update bullet positions
    for (var i = 0; i < bullets.length; i++) {
        var bullet = bullets[i];
        bullet.x += bullet.speed * Math.cos(bullet.angle) * modifier;
        bullet.y += bullet.speed * Math.sin(bullet.angle) * modifier;

        // Check collision with player
        if (
            bullet.x <= hero.x + 16 + 16 &&
            hero.x + 16 <= bullet.x + 8 &&
            bullet.y <= hero.y + 16 + 16 &&
            hero.y + 16 <= bullet.y + 8
        ) {
            reset();
            break;
        }

        // Remove bullets that are out of bounds
        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(i, 1);
            i--;
        }
    }
};

// Draw everything on the canvas
var render = function () {
    if (bgReady) {
        ctx.drawImage(bgImage, 0, 0);
    }

    if (heroReady) {
        ctx.drawImage(heroImage, hero.x, hero.y);
    }

    if (monsterReady) {
        for (var i = 0; i < monsters.length; i++) {
            ctx.drawImage(monsterImage, monsters[i].x, monsters[i].y);
        }
    }

    if (borderReady) {
        ctx.drawImage(borderImage, border.x, border.y);
    }

    if (bulletReady) {
        for (var i = 0; i < bullets.length; i++) {
            ctx.drawImage(bulletImage, bullets[i].x, bullets[i].y);
        }
    }

    if (chaserReady) {
        ctx.drawImage(chaserImage, chaser.x, chaser.y);
    }

    ctx.fillStyle = "rgb(90, 90, 90)";
    ctx.font = "24px Helvetica";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Bad guys Killed: "   + monstersCaught, 43, 43);
    ctx.fillText("Time: " + Math.ceil(gameTime), 43, 86);
    ctx.fillText("Goal: 5 bad guys" , 43, 129);
};

// Start the game
var startTimer = function () {
    gameTime = 30;
    timerInterval = setInterval(function () {
        gameTime -= 0.005;
        if (gameTime <= 0) {
            clearInterval(timerInterval);
            reset();
        }
    }, 10);
};

var then = Date.now();
reset();
startTimer();

// The main game loop
var main = function () {
    var now = Date.now();
    var delta = now - then;

    update(delta / 1000);
    render();

    then = now;
    requestAnimationFrame(main);
};
main();