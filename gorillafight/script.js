class GorillaGame extends Phaser.Scene {
    constructor() {
        super({ key: 'GorillaGame' });
    }

    preload() {
        this.load.image('gorilla', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/gorilla.png');
        this.load.image('gorillaSlam', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/gorillaSlam.png');
        this.load.image('enemy', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/man.png');
        this.load.image('shockwave', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/slam.png');
        this.load.image('background', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/grass.png');

    }

    create() {
        this.add.image(300, 200, 'background').setOrigin(0.5, 0.5);
        
        this.gorilla = this.physics.add.sprite(300, 200, 'gorilla');
        this.gorilla.setScale(0.2);
        this.gorilla.setCollideWorldBounds(true);
        
        this.lives = 3;
        this.energy = 100;
        this.maxEnergy = 100;
        this.energyRegenRate = 1;

        // Regenerate energy every 0.5 seconds
        this.time.addEvent({
            delay: 50, // 500ms = half a second
            loop: true,
            callback: () => {
                if (this.energy < this.maxEnergy) {
                    this.energy += this.energyRegenRate;
                }
            }
        });

        
        this.spawnEnemies(5);
        
        // Create a shockwave effect (hidden by default)
        this.shockwave = this.add.image(this.gorilla.x, this.gorilla.y, 'shockwave').setScale(0).setAlpha(0);

        this.physics.add.overlap(this.gorilla, this.enemies, this.hitGorilla, null, this);

        this.input.keyboard.on('keydown-SPACE', this.performGroundSlam, this);
        
                // Add keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();

    }

    update() {
        
        this.handleGorillaMovement();
        this.handleEnemyMovement();
    }
    
    handleGorillaMovement() {
        this.gorilla.setVelocity(0);
        if (this.cursors.left.isDown) this.gorilla.setVelocityX(-160);
        else if (this.cursors.right.isDown) this.gorilla.setVelocityX(160);
        
        if (this.cursors.up.isDown) this.gorilla.setVelocityY(-160);
        else if (this.cursors.down.isDown) this.gorilla.setVelocityY(160);
    }

    handleEnemyMovement() {
       this.enemies.children.iterate(enemy => {
            if (!enemy.stunned) {
                let direction = new Phaser.Math.Vector2(this.gorilla.x - enemy.x, this.gorilla.y - enemy.y).normalize();
                enemy.setVelocity(direction.x * 50, direction.y * 100);
            }
        });
    }
    
    spawnEnemies(enemyCount) {
        this.enemies = this.physics.add.group();

        for (let i = 0; i < enemyCount; i++) {
            let enemy = this.physics.add.sprite(Phaser.Math.Between(100, 700), Phaser.Math.Between(100, 500), 'enemy');
            enemy.setCollideWorldBounds(false);
            enemy.setBounce(1);
            enemy.setScale(0.15);
            enemy.stunned = false; // Track stun state
            this.enemies.add(enemy);
        }

        this.physics.add.collider(this.enemies, this.enemies);
    }

    hitGorilla(gorilla, enemy) {
        //enemy.destroy();
        this.lives -= 1;
        if (this.lives <= 0 && !enemy.stunned) {
            this.scene.restart();
        }
    }

    performGroundSlam() {
        if (this.energy >= 30) {
            this.energy -= 30;
            
            this.gorilla.setTexture("gorillaSlam");
            
            // Screen shake effect
            this.cameras.main.shake(200, 0.01);

            // Show shockwave effect
            this.shockwave.setPosition(this.gorilla.x, this.gorilla.y);
            this.shockwave.setScale(0.5).setAlpha(1);
            this.tweens.add({
                targets: this.shockwave,
                scale: { from: 0.1, to: 1 },
                alpha: { from: 1, to: 0 },
                duration: 300,
                onComplete: () => this.shockwave.setScale(0).setAlpha(0)
            });

            this.enemies.children.iterate(enemy => {
                if (Phaser.Math.Distance.Between(this.gorilla.x, this.gorilla.y, enemy.x, enemy.y) < 100) {
                    if (enemy.stunned) {
                        enemy.destroy();
                       // If already stunned, it dies
                    } else {
                        // Apply knockback
                        let direction = new Phaser.Math.Vector2(enemy.x - this.gorilla.x, enemy.y - this.gorilla.y).normalize();
                        enemy.setVelocity(direction.x * 200, direction.y * 200);

                        // Apply stun
                        enemy.stunned = true;
                        enemy.setTint(0x666666); // Grayscale effect
                        enemy.body.checkCollision.none = true;
                        this.time.delayedCall(2000, () => {
                            if (!enemy.scene) return;
                            enemy.stunned = false;
                            enemy.clearTint();
                            enemy.body.checkCollision.none = false;
                        });
                        this.time.delayedCall(300, () => {
                            enemy.setVelocity(0, 0);
                        });
                    }

                }
            });
            this.time.delayedCall(300, () => {
                this.gorilla.setTexture("gorilla");
            });
            
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 400,
    scene: GorillaGame,
    physics: { default: 'arcade' }
};

const game = new Phaser.Game(config);





