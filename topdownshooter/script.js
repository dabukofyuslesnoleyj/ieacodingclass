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

const game = new Phaser.Game(config);

let player;
let cursors;
let bullets;
let enemies;

let playerDirection = [0, -1];
let lastFired = 0;
let currTime = 0;

const fireRate = 300;
const playerSpeed = 200;
const bulletSpeed = 400;
const enemySpeed = 100;

function preload() {
    this.load.image('player', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/spaceship.png');
    this.load.image('bullet', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/ball.png');
    this.load.image('enemy', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/alien.png');
}

function create() {

    player = this.physics.add.sprite(400, 300, 'player');
    player.setCollideWorldBounds(true);
    player.setScale(0.2);

    cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.addKeys({
        shoot: Phaser.Input.Keyboard.KeyCodes.SPACE
    });
    
    bullets = this.physics.add.group({
        defaultKey: 'bullet'
    });
    
    enemies = this.physics.add.group({
        defaultKey: 'enemy'
    });
    
    for (let i = 0; i < 10; i++) {
        const x = Phaser.Math.Between(50, 550);
        const y = Phaser.Math.Between(50, 350);
        const enemy = enemies.create(x, y, 'enemy');
        
        let enemySpeedX = Phaser.Math.Between(-enemySpeed, enemySpeed);
        let enemySpeedY = Phaser.Math.Between(-enemySpeed, enemySpeed);
        
        enemy.setVelocity(enemySpeedX, enemySpeedY);
        enemy.setCollideWorldBounds(true);
        enemy.setScale(0.2);
        enemy.setBounce(1);
    }
    
    this.physics.add.overlap(bullets, enemies, onBulletHitEnemy, null, this);
}

function update() {
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
    
    let isPlayerMoving = (playerDirection[0] != 0 || playerDirection[1] != 0);
    if (isPlayerMoving) {
         const angle = Math.atan2(playerDirection[1], playerDirection[0]);
        player.setRotation(angle);
    }
    
    currTime = Date.now();
    if (cursors.space.isDown && currTime > lastFired + fireRate && isPlayerMoving) {
        shoot();
    }
    
    bullets.children.each(bullet=>{
        if (bullet.y < 0 || bullet.y > 400 || bullet.x < 0 || bullet.x > 600) { 
            bullet.destroy();
        }
    });
}

function shoot() {
    let bullet = bullets.get(player.x, player.y);
    
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.setScale(0.1);
    
    let x = bulletSpeed * playerDirection[0];
    let y = bulletSpeed * playerDirection[1];
    
    bullet.setVelocityX(x);
    bullet.setVelocityY(y);
    
    lastFired = currTime;
}

function onBulletHitEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();
}
