// Initialize Phaser game configuration
const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 400,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Create the Phaser game instance
const game = new Phaser.Game(config);

let player;
let cursors;
let bullets;
let enemies;
let playerDirection = [0, -1];
let lastFired = 0; // Track the last time a bullet was fired
let currtime = 0;

const fireRate = 300; // Cooldown duration in milliseconds
const playerSpeed = 200;
const bulletSpeed = 400;
const enemySpeed = 100;

function preload() {
    // Load assets
    this.load.image('player', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/spaceship.png'); // Replace with your image path
    this.load.image('bullet', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/ball.png'); // Replace with your image path
    this.load.image('enemy', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/alien.png');   // Replace with your image path
}

function create() {
//     // Create player sprite
     player = this.physics.add.sprite(400, 300, 'player');
     player.setCollideWorldBounds(true);
     player.setScale(0.2);

//     // Configure controls
     cursors = this.input.keyboard.createCursorKeys();
     this.input.keyboard.addKeys({ shoot: Phaser.Input.Keyboard.KeyCodes.SPACE });

//     // Create a bullet group
     bullets = this.physics.add.group({
         defaultKey: 'bullet'
     });
    
    

    // Create enemies group
    enemies = this.physics.add.group({
        defaultKey: 'enemy',
    });

    // Spawn enemies at random positions
    for (let i = 0; i < 10; i++) {
        const x = Phaser.Math.Between(50, 550);
        const y = Phaser.Math.Between(50, 350);
        const enemy = enemies.create(x, y, 'enemy');
        enemy.setVelocity(Phaser.Math.Between(-enemySpeed, enemySpeed), Phaser.Math.Between(-enemySpeed, enemySpeed));
        enemy.setCollideWorldBounds(true);
        enemy.setScale(0.2);
        enemy.setBounce(1); // Make enemies bounce off world bounds
    }

//     // Handle collision between bullets and enemies
     this.physics.add.overlap(bullets, enemies, onBulletHitEnemy, null, this);
}

function update() {
    // Player movement
    if (cursors.left.isDown) {
        playerDirection[0] = -1;
    } else if (cursors.right.isDown) {
        playerDirection[0] = 1;
    } else {
        playerDirection[0] = 0;
    }
    let pX = playerSpeed * playerDirection[0];
    player.setVelocityX(pX);

    if (cursors.up.isDown) {
        playerDirection[1] = -1;
    } else if (cursors.down.isDown) {
        playerDirection[1] = 1;
    } else {
        playerDirection[1] = 0;
    }
    let pY = playerSpeed * playerDirection[1];
    player.setVelocityY(pY);
    let isPlayerMoving = (playerDirection[1] != 0 || playerDirection[0] != 0);
    // Set the sprite's rotation based on the calculated angle
    if (isPlayerMoving) {
        const angle = Math.atan2(playerDirection[1], playerDirection[0]);
        player.setRotation(angle);
    }
    
    

//     // Shooting bullets with cooldown
    
    currtime = Date.now();
     if (cursors.space.isDown && currtime > lastFired + fireRate && isPlayerMoving) {
         shoot();
     }

     // Deactivate bullets when they leave the screen
     bullets.children.each(bullet => {
         if (bullet.y < 0 || bullet.y > 400 || bullet.x < 0 || bullet.x > 600) {
             bullet.setActive(false);
             bullet.setVisible(false);
         }
     });
}

function shoot() {
    let bullet = bullets.get(player.x, player.y);

    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.setScale(0.1);

    if (player.body.velocity.x == 0 && player.body.velocity.y == 0) {
        bullet.setVelocityX(bulletSpeed);
        bullet.setVelocityY(0);
    } else {
        let x = bulletSpeed * playerDirection[0];
        let y = bulletSpeed * playerDirection[1];
        bullet.setVelocityX(x);
        bullet.setVelocityY(y);
    }

    lastFired = currtime; // Update the last fired time   
}

function onBulletHitEnemy(bullet, enemy) {
    // Deactivate bullet and destroy enemy
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.destroy();
    enemy.destroy(); // Removes the enemy from the game
}





