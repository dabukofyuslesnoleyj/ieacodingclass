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
let score = 0;
let scoreText;
let health = 3;
let healthText;
let lastHit = 0;

let playerDirection = [0, -1];
let lastFired = 0;
let currTime = 0;
let isStarted = false;

let lootBoxes;
let currentBullet = "Normal";
let specialAmmo = 0;
let bulletText;

const fireRate = 300;
const playerSpeed = 200;
const bulletSpeed = 400;
const enemySpeed = 100;

function preload() {
    this.load.image('player', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/spaceShooter.png');
    this.load.image('bullet', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/plasma.png');
    this.load.image('enemy', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/newAlien.png');
    this.load.image('enemyBullet', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/newEnemyBullet.png');
    this.load.image('lootBox', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/bonusItem.png');
}

function create() {

    player = this.physics.add.sprite(400, 300, 'player');
    player.setCollideWorldBounds(true);
    player.setScale(0.15);

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

    spawnEnemies(1);

    this.physics.add.overlap(bullets, enemies, onBulletHitEnemy, null, this);
    this.physics.add.overlap(player, enemies, onPlayerHitEnemy, null, this);

    scoreText = this.add.text(15, 15, 'Score: 0', {
        fontSize: '32px',
        fill: '#fff'
    });

    healthText = this.add.text(350, 15, 'Health: ' + health, {
        fontSize: '32px',
        fill: '#fff'
    });

    bulletText = this.add.text(15, 350, 'Bullet: ' + currentBullet, {
        fontSize: '16px',
        fill: '#fff'
    });

    enemyBullets = this.physics.add.group({
        defaultKey: 'enemyBullet'
    });

    lootBoxes = this.physics.add.group({
        defaultKey: 'lootBox'
    });

    this.physics.add.overlap(player, lootBoxes, onPlayerHitLootBox, null, this);

    this.physics.add.overlap(enemyBullets, player, onPlayerHitEnemy, null, this);

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
        shootWithOptions();
    }

    bullets.children.each(bullet => {
        if (bullet.y < 0 || bullet.y > 400 || bullet.x < 0 || bullet.x > 600) {
            bullet.destroy();
        }
    });

    enemyBullets.children.each(bullet => {
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

}

function shootWithOptions() {
    switch (currentBullet) {
        case "Spread":
            if (specialAmmo > 0) {
                shootSpread();
                specialAmmo -= 1;
            } else {
                shoot();
                currentBullet = "Normal";
                bulletText.setText('Bullet: ' + currentBullet);
            }
            break;
        case "Big":
            if (specialAmmo > 0) {
                shootBig();
                specialAmmo -= 1;
            } else {
                shoot();
                currentBullet = "Normal";
                bulletText.setText('Bullet: ' + currentBullet);
            }
            break;
        default:
            shoot();
    }
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

function shootSpread() {
    let bullet = bullets.get(player.x, player.y);
    let bulletDown = bullets.get(player.x, player.y);

    bullet.setScale(0.1, 0.1);
    bulletDown.setScale(0.1, 0.1);

    let x = bulletSpeed * playerDirection[0];
    let y = bulletSpeed * playerDirection[1];

    bullet.setVelocityX(x);
    bullet.setVelocityY(y);

    bulletDown.setVelocityX(-x);
    bulletDown.setVelocityY(-y);

    lastFired = currTime;
}

function shootBig() {
    let bullet = bullets.get(player.x, player.y);

    bullet.setScale(0.5, 0.5);

    let x = bulletSpeed * playerDirection[0];
    let y = bulletSpeed * playerDirection[1];

    bullet.setVelocityX(x);
    bullet.setVelocityY(y);
    //this.time.delayedCall(1, this.destroyObject, null, bullet);

    lastFired = currTime;
}

function onBulletHitEnemy(bullet, enemy) {

    let chanceLoot = Phaser.Math.Between(1, 3);
    if (chanceLoot > 1) {
        spawnLootBox(enemy);
    }

    bullet.destroy();
    enemy.destroy();

    score += 10;
    scoreText.setText('Score: ' + score);
}

function onPlayerHitEnemy(player, enemy) {
    if (isStarted && health > 0 && currTime > lastHit + 500) {
        health -= 1;
        healthText.setText('Health: ' + health);
        lastHit = currTime;
    }

    if (isStarted && health < 1) {
        player.setVisible(false);
        player.setActive(false);
    }
}

function enemyShoot(enemy) {
    let enemyBullet = enemyBullets.get(enemy.x, enemy.y);
    enemyBullet.setScale(0.1, 0.1);

    let x = enemy.body.velocity.x * 1.5;
    let y = enemy.body.velocity.y * 1.5;

    enemyBullet.setVelocityX(x);
    enemyBullet.setVelocityY(y);
}

function spawnLootBox(enemy) {
    const x = Phaser.Math.Between(50, 550);
    const y = Phaser.Math.Between(50, 350);
    const lootBox = lootBoxes.create(enemy.x, enemy.y, 'lootBox');

    let lootBoxSpeedX = Phaser.Math.Between(-enemySpeed, enemySpeed);
    let lootBoxSpeedY = Phaser.Math.Between(-enemySpeed, enemySpeed);

    lootBox.setVelocity(lootBoxSpeedX, lootBoxSpeedY);
    lootBox.setCollideWorldBounds(true);
    lootBox.setScale(0.25);
    lootBox.setBounce(1);
}

function onPlayerHitLootBox(player, lootBox) {
    lootBox.destroy();
    let chancePrize = Phaser.Math.Between(1, 4);
    switch (chancePrize) {
        case 1:
            currentBullet = "Spread";
            bulletText.setText('Bullet: ' + currentBullet);
            specialAmmo = 5;
            break;
        case 2:
            currentBullet = "Big";
            bulletText.setText('Bullet: ' + currentBullet);
            specialAmmo = 5;
            break;
        case 3:
            health += 1;
            healthText.setText('Health: ' + health);
            break;
        case 4:
            score += 50;
            scoreText.setText('Score: ' + score);
            break;
    }
}

function spawnEnemies(enemyCount) {
    for (let i = 0; i < enemyCount; i++) {
        const x = Phaser.Math.Between(50, 550);
        const y = Phaser.Math.Between(50, 350);
        const enemy = enemies.create(x, y, 'enemy');

        let enemySpeedX = Phaser.Math.Between(-enemySpeed, enemySpeed);
        let enemySpeedY = Phaser.Math.Between(-enemySpeed, enemySpeed);

        enemy.setVelocity(enemySpeedX, enemySpeedY);
        enemy.setCollideWorldBounds(true);
        enemy.setScale(0.15);
        enemy.setBounce(1);
    }
}
