// Phaser 3 Game Configuration
const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 400,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 }, // Adding gravity for jumping
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
let stars;
let platforms;
let score = 0;
let scoreText;
let cursors;

function preload() {
    // Preload assets
    this.load.image('sky', 'https://static.vecteezy.com/system/resources/previews/009/877/673/non_2x/pixel-art-sky-background-with-clouds-cloudy-blue-sky-for-8bit-game-on-white-background-vector.jpg');
    this.load.image('ground', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/platform.png');
    this.load.image('star', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/star.png');
    this.load.image('ball', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/ball.png');
}

function create() {
    // Add background
    this.add.image(400, 300, 'sky');

    // Create platforms group
    platforms = this.physics.add.staticGroup();

    // Create ground platform
    platforms.create(0, 368, 'ground').setScale(4, 0.2).refreshBody();

    // Create additional platforms
    platforms.create(200, 288, 'ground').setScale(0.3, 0.2).refreshBody();
    platforms.create(0, 258, 'ground').setScale(0.3, 0.2).refreshBody();
    platforms.create(400, 228, 'ground').setScale(0.3, 0.2).refreshBody();

    // Create player
    player = this.physics.add.sprite(400, 250, 'ball');

    // Player properties
    player.setBounce(0.2);
    player.setScale(0.3);
    player.setCollideWorldBounds(true);
    player.setGravityY(300);

    // Collide player with platforms
    this.physics.add.collider(player, platforms);

    // Create the star sprite
    stars = this.physics.add.group({
        key: 'star',
        repeat: 3,
        setXY: { x: 12, y: 0, stepX: 120 },
        setScale: { x: 0.3, y: 0.3},
        setGravity: {x: 0, y: 0}
    });
    
    //add collision for the star sprites
    this.physics.add.collider(stars, platforms);
    
    // Set up the score text
    scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '32px',
        fill: '#fff'
    });

    // Add overlap detection (when player touches star)
    this.physics.add.overlap(player, stars, collectStar, null, this);
    
    // Create cursors for player movement
    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    // Reset player velocity each frame
    player.setVelocityX(0);

    // Move player left or right
    if (cursors.left.isDown) {
        player.setVelocityX(-160); // Move left
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(160); // Move right
    }

    // Player jump
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330); // Jump
    }
}

// Collect the star and update the score
function collectStar(player, star) {
    // Hide the star
    star.setVisible(false);

    // Reset the star's position to a random location
    star.setPosition(Phaser.Math.Between(0, 550), Phaser.Math.Between(0, 100));

    // Show the star again
    star.setVisible(true);

    // Update the score
    score += 10;
    scoreText.setText('Score: ' + score);
}




