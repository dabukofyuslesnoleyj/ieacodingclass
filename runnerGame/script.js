////////////////////
// BootScene
class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  preload() {
    // load assets...
    this.load.image('background', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/platform.png');
    this.load.image('midground', 'assets/mid.png');
    this.load.image('ground', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/platform.png');
    this.load.image('player', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/ball.png');
    this.load.image('wall', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/platform.png');
    this.load.image('skyObs', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/platform.png');
    this.load.image('dust', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/plasma.png');
    this.load.image('afterImg', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/ball.png');
    this.load.image('button', '/res/9155856b-c0e8-4d2d-8c8b-ee1f8e295509/platform.png');
  }
  create() {
    this.scene.start('StartScene');
  }
}

////////////////////
// StartScene
class StartScene extends Phaser.Scene {
  constructor() { super('StartScene'); }
  create() {
    this.add.text(300, 150, 'Endless Runner', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
    const btn = this.add.image(300, 200, 'button').setInteractive();
      btn.setScale(0.5);
    const btnText = this.add.text(0, 0, 'Start', { fontSize: '24px', fill: '#000' });
      btn.setDepth(1);
btnText.setDepth(2);
    Phaser.Display.Align.In.Center(btnText, btn);
    btn.on('pointerdown', () => this.scene.start('PlayScene'));
  }
}

////////////////////
// GameOverScene
class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }
  init(data) { this.distance = data.distance; }
  create() {
    this.add.text(300, 100, 'Game Over', { fontSize:'32px', fill:'#fff' }).setOrigin(0.5);
    this.add.text(300, 150, `Distance: ${this.distance}`, { fontSize:'24px', fill:'#fff' }).setOrigin(0.5);
    const btn = this.add.image(300, 200, 'button').setInteractive();
      btn.setScale(0.5);
    const btnText = this.add.text(0, 0, 'Restart', { fontSize:'24px', fill:'#000' });
    Phaser.Display.Align.In.Center(btnText, btn);
    btn.on('pointerdown', () => this.scene.start('PlayScene'));
  }
}

////////////////////
// PlayScene
class PlayScene extends Phaser.Scene {
  constructor() { super('PlayScene'); }
  create() {
    // parallax backgrounds
    this.bg = this.add.tileSprite(300, 200, 600, 300, 'background').setScrollFactor(0);
    this.mid = this.add.tileSprite(300, 200, 600, 300, 'midground').setScrollFactor(0);
    this.ground = this.add.tileSprite(300, 380, 600, 40, 'ground').setOrigin(0.5, 0);

    // player
    this.player = this.physics.add.sprite(200, 200, 'player');
    this.player.setScale(0.3);
    this.player.setCollideWorldBounds(true);

    

    // groups
    this.obstacles = this.physics.add.group();
    this.skyObstacles = this.physics.add.group();
    this.dusts = this.add.group();
    this.afterImages = this.add.group();

    // texts
    this.distance = 0;
    this.speed = 200;
    this.collisions = 0;
    this.txtDistance = this.add.text(10, 10, 'Distance: 0', { fontSize: '18px', fill: '#fff' });
    this.txtSpeed = this.add.text(10, 30, 'Speed: 200', { fontSize: '18px', fill: '#fff' });
      this.txtLives = this.add.text(450, 10, 'Lives: 3', {
  fontSize: '18px',
  fill: '#fff'
});

    // input
    this.input.keyboard.on('keydown-SPACE', this.jump, this);

    // collisions
    this.physics.add.overlap(this.player, this.obstacles, this.handleCollision, null, this);
    this.physics.add.overlap(this.player, this.skyObstacles, this.handleSkyCollision, null, this);

    // camera effects
    this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, 400);

    // timers
    this.obstacleTimer = this.time.addEvent({
      delay: 1500, callback: this.spawnObstacle, callbackScope: this, loop: true
    });
  }

  jump() {
    if (this.player.body.onFloor()) {
      this.player.setVelocityY(-500);
    }
  }

  spawnObstacle() {
    const y = Phaser.Math.Between(0, 1) ? 280 : 200;
    const group = (y === 280) ? this.obstacles : this.skyObstacles;
    const key = (y === 280) ? 'wall' : 'skyObs' ;
    const obs = group.create(this.cameras.main.scrollX + 900, y, key);
    obs.setVelocityX(-this.speed);
    obs.setScale(0.4);
    obs.setImmovable(true);
    obs.body.allowGravity = false;
  }

  handleCollision(player, obs) {
    if (obs.texture.key === 'wall') {
      this.cameras.main.shake(200, 0.05);
      //this.sound.play('explosion');
      obs.destroy();
      this.speed *= 0.5;
      this.collisions++;
      this.txtLives.setText(`Lives: ${3 - this.collisions}`);
      if (this.collisions >= 3) {
        return this.gameOver();
      }
    }
  }

  handleSkyCollision(player, obs) {
    if (obs.texture.key === 'skyObs') {
      this.cameras.main.shake(200, 0.02);
      obs.destroy();
      this.speed *= 0.5; 
      this.collisions++;
      this.txtLives.setText(`Lives: ${3 - this.collisions}`);
      if (this.collisions >= 3) {
        return this.gameOver();
      }
    }
  }

  gameOver() {
    this.scene.start('GameOverScene', { distance: Math.floor(this.distance) });
  }

  update(time, delta) {
    // update distance and speed
    this.distance += (this.speed * delta) / 1000;
    this.speed += delta * 0.01; // gradually increasing
    this.txtDistance.setText(`Distance: ${Math.floor(this.distance)}`);
    this.txtSpeed.setText(`Speed: ${Math.floor(this.speed)}`);

    // parallax effect
    const baseSpeed = 200;
    const speedRatio = this.speed / baseSpeed;
    const scrollAmount = this.speed * delta / 1000;

    this.bg.tilePositionX += scrollAmount * 0.1 * speedRatio;
    this.mid.tilePositionX += scrollAmount * 0.3 * speedRatio;
    this.ground.tilePositionX += scrollAmount * 1.0 * speedRatio;

    // as speed builds up: dust, afterimage, stretch
    if (this.speed > 300 && time % 100 < delta) {
      const dust = this.add.sprite(this.player.x - 20, this.player.y + 20, 'dust');
       dust.setScale(0.1);
        // Dynamic values based on speed
    const drift = Math.min(this.speed * 0.2, 200);          // Max 150px drift
    const duration = Math.max(300, 500 - this.speed * 0.5); // Faster speed = shorter tween
        const scale = Math.min(0.1 + (this.speed - 300) / 1000, 1.5);
        const finalScale = Math.max(scale, 0.2);
      this.tweens.add({
        targets: dust, x: dust.x - drift, alpha: 0, duration: duration, scale: finalScale, onComplete: () => dust.destroy()
      });
    }

    if (this.speed > 400 && time % 100 < delta) {
      const after = this.add.sprite(this.player.x, this.player.y, 'afterImg');
        after.setAlpha(0.5);
        
        after.setScale(this.player.scaleX, this.player.scaleY); // match player stretch
        this.afterImages.add(after);

// Calculate drift based on speed (optional cap)
        const driftX = Math.min(this.speed * 0.1, 200);;

// Tween: move left & fade out
        this.tweens.add({
          targets: after,
          x: after.x - driftX,
          alpha: 0,
          duration: 500,
          ease: 'Linear',
          onComplete: () => after.destroy()
        });
    }

    if (this.speed > 500) {
        const speedScale = Math.min(this.speed, 900);

      this.player.setScale(0.3 + (speedScale - 500) / 1000, 0.3 - (speedScale - 500) / 2000);
      
    } else {
      this.player.setScale(0.3, 0.3);
    }

    // update obstacles velocities
    this.obstacles.children.iterate(o => {
      if (o) o.setVelocityX(-this.speed);
    });
    this.skyObstacles.children.iterate(o => {
      if (o) o.setVelocityX(-this.speed);
    });
  }
}



const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 300,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: false,
    }
  },
  scene: [BootScene, StartScene, PlayScene, GameOverScene]
};

const game = new Phaser.Game(config);


