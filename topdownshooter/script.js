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
let enemyBullets;

let playerDirection = [0, -1];
let lastFired = 0;
let currTime = 0;
let isStarted = false;
let score = 0;
let scoreText;
let health = 3;
let healthText;
let lastHit = 0;

const fireRate = 300;
const playerSpeed = 200;
const bulletSpeed = 400;
const enemySpeed = 100;

function preload() {
    this.load.image('player', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/spaceship.png');
    this.load.image('bullet', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/ball.png');
    this.load.image('enemy', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/alien.png');
    this.load.image('enemyBullet', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/platform.png');
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

    enemyBullets = this.physics.add.group({
        defaultKey: 'enemyBullet'
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

    this.physics.add.overlap(player, enemies, onPlayerHitEnemy, null, this);

    this.physics.add.overlap(enemyBullets, player, onPlayerHitEnemy, null, this);

    scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '32px',
        fill: '#fff'
    });
    
    healthText = this.add.text(350, 16, 'Health: ' + health +'', {
        fontSize: '32px',
        fill: '#fff'
    });
}

function update() {
    if (cursors.left.isDown) {
        playerDirection[0] = -1;
        isStarted = true;
    } else if (cursors.right.isDown) {
        playerDirection[0] = 1;
        isStarted = true;
    } else {
        playerDirection[0] = 0;
    }

    let pX = playerSpeed * playerDirection[0];
    player.setVelocityX(pX);

    if (cursors.up.isDown) {
        playerDirection[1] = -1;
        isStarted = true;
    } else if (cursors.down.isDown) {
        playerDirection[1] = 1;
        isStarted = true;
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

    bullets.children.each(bullet => {
        if (bullet.y < 0 || bullet.y > 400 || bullet.x < 0 || bullet.x > 600) {
            bullet.destroy();
        }
    });

    enemies.children.each(enemy => {
        let chanceShoot = Phaser.Math.Between(1, 1000);
        if (chanceShoot > 999) {
            enemyShoot(enemy);
        }
    });

    enemyBullets.children.each(bullet => {
        if (bullet.y < 0 || bullet.y > 400 || bullet.x < 0 || bullet.x > 600) {
            bullet.destroy();
        }
    });
}

function enemyShoot(enemy) {
    let bullet = enemyBullets.get(enemy.x, enemy.y);
    bullet.setScale(0.05, 0.15);

    let x = enemy.body.velocity.x * 1.5;
    let y = enemy.body.velocity.y * 1.5;

    bullet.setVelocityX(x);
    bullet.setVelocityY(y);
}

function shoot() {
    let bullet = bullets.get(player.x, player.y);

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
    score += 10;
    scoreText.setText('Score: ' + score);
}

function onPlayerHitEnemy(p, enemy) {
    if (isStarted && health > 0 && currTime > lastHit + 1000) {
        health--;
        healthText.setText('Health: ' + health);
        lastHit = currTime;
    }
    
    if (isStarted && health < 1) {
        p.setVisible(false);
        p.setActive(false);
    }
}
