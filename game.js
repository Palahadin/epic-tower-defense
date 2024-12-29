
// Grundlegende Spielklassen und -funktionen

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas') });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.resources = 100;
        this.towers = [];
        this.enemies = [];
        this.wave = 1;
        this.lives = 20;

        this.map = new Map(10, 10); // 10x10 Karte
        this.initScene();
    }

    initScene() {
        // Boden hinzufügen
        const groundGeometry = new THREE.PlaneGeometry(10, 10);
        const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        this.scene.add(ground);

        // Licht hinzufügen
        const light = new THREE.PointLight(0xffffff, 1, 100);
        light.position.set(0, 10, 0);
        this.scene.add(light);

        // Kamera positionieren
        this.camera.position.set(0, 10, 10);
        this.camera.lookAt(0, 0, 0);
    }

    update() {
        // Türme aktualisieren
        for (let tower of this.towers) {
            tower.update(this.enemies);
        }

        // Gegner aktualisieren
        for (let enemy of this.enemies) {
            enemy.update();
            if (enemy.reachedEnd) {
                this.lives--;
                this.removeEnemy(enemy);
            }
            if (enemy.health <= 0) {
                this.resources += enemy.reward;
                this.removeEnemy(enemy);
            }
        }

        // Neue Welle starten, wenn alle Gegner besiegt sind
        if (this.enemies.length === 0) {
            this.startNewWave();
        }

        // Spielende überprüfen
        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    addTower(type, position) {
        if (this.resources >= TOWER_COSTS[type]) {
            const tower = new Tower(type, position);
            this.towers.push(tower);
            this.scene.add(tower.mesh);
            this.resources -= TOWER_COSTS[type];
        }
    }

    removeEnemy(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
            this.scene.remove(enemy.mesh);
        }
    }

    startNewWave() {
        this.wave++;
        const enemyCount = Math.floor(5 + this.wave * 1.5);
        for (let i = 0; i < enemyCount; i++) {
            setTimeout(() => {
                const enemy = new Enemy(this.map.path, this.wave);
                this.enemies.push(enemy);
                this.scene.add(enemy.mesh);
            }, i * 1000); // Gegner im Abstand von 1 Sekunde spawnen
        }
    }

    gameOver() {
        console.log("Game Over!");
        // Hier können Sie eine Game-Over-Logik implementieren
    }
}

class Map {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = this.generateGrid();
        this.path = this.generatePath();
    }

    generateGrid() {
        // Einfaches Raster generieren
        return Array(this.height).fill().map(() => Array(this.width).fill(0));
    }

    generatePath() {
        // Einfacher Pfad von links nach rechts
        const path = [];
        const middleY = Math.floor(this.height / 2);
        for (let x = 0; x < this.width; x++) {
            path.push(new THREE.Vector3(x - this.width / 2 + 0.5, 0, middleY - this.height / 2 + 0.5));
        }
        return path;
    }
}

class Tower {
    constructor(type, position) {
        this.type = type;
        this.position = position;
        this.level = 1;
        this.attackSpeed = TOWER_STATS[type].attackSpeed;
        this.damage = TOWER_STATS[type].damage;
        this.range = TOWER_STATS[type].range;
        this.lastAttackTime = 0;

        // 3D-Modell des Turms erstellen
        const geometry = new THREE.BoxGeometry(0.5, 1, 0.5);
        const material = new THREE.MeshBasicMaterial({ color: TOWER_COLORS[type] });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(position.x, 0.5, position.z);
    }

    update(enemies) {
        const now = Date.now();
        if (now - this.lastAttackTime > this.attackSpeed) {
            const target = this.findTarget(enemies);
            if (target) {
                this.attack(target);
                this.lastAttackTime = now;
            }
        }
    }

    findTarget(enemies) {
        return enemies.find(enemy => 
            enemy.position.distanceTo(this.position) <= this.range
        );
    }

    attack(enemy) {
        enemy.takeDamage(this.damage);
    }

    upgrade() {
        if (this.level < 3) {
            this.level++;
            this.attackSpeed *= 0.8;
            this.damage *= 1.2;
            this.range *= 1.1;
            this.mesh.scale.setScalar(this.level * 0.5);
        }
    }
}

class Enemy {
    constructor(path, wave) {
        this.path = path;
        this.pathIndex = 0;
        this.position = path[0].clone();
        this.health = 50 + wave * 10;
        this.speed = 0.01 + wave * 0.002;
        this.reward = 10 + wave;
        this.reachedEnd = false;

        // 3D-Modell des Gegners erstellen
        const geometry = new THREE.SphereGeometry(0.2, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
    }

    update() {
        if (this.pathIndex < this.path.length - 1) {
            const target = this.path[this.pathIndex + 1];
            const direction = target.clone().sub(this.position).normalize();
            this.position.add(direction.multiplyScalar(this.speed));
            this.mesh.position.copy(this.position);

            if (this.position.distanceTo(target) < 0.1) {
                this.pathIndex++;
            }
        } else {
            this.reachedEnd = true;
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
        }
    }
}

// Konstanten für Turmtypen und -kosten
const TOWER_TYPES = {
    BASIC: 'basic',
    SNIPER: 'sniper',
    SPLASH: 'splash'
};

const TOWER_COSTS = {
    [TOWER_TYPES.BASIC]: 50,
    [TOWER_TYPES.SNIPER]: 100,
    [TOWER_TYPES.SPLASH]: 150
};

const TOWER_STATS = {
    [TOWER_TYPES.BASIC]: { attackSpeed: 1000, damage: 10, range: 2 },
    [TOWER_TYPES.SNIPER]: { attackSpeed: 2000, damage: 50, range: 5 },
    [TOWER_TYPES.SPLASH]: { attackSpeed: 1500, damage: 20, range: 3 }
};

const TOWER_COLORS = {
    [TOWER_TYPES.BASIC]: 0x0000ff,
    [TOWER_TYPES.SNIPER]: 0x00ff00,
    [TOWER_TYPES.SPLASH]: 0xff00ff
};

// Spielinitialisierung
const game = new Game();

function gameLoop() {
    requestAnimationFrame(gameLoop);
    game.update();
    game.render();
}

gameLoop();

// Event-Listener für Benutzerinteraktionen hinzufügen
document.addEventListener('click', (event) => {
    const rect = game.renderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    const mouse3D = new THREE.Vector3(x, y, 0.5);
    mouse3D.unproject(game.camera);
    const raycaster = new THREE.Raycaster(game.camera.position, mouse3D.sub(game.camera.position).normalize());
    const intersects = raycaster.intersectObjects(game.scene.children);

    if (intersects.length > 0) {
        const intersect = intersects[0];
        const position = intersect.point;
        game.addTower(TOWER_TYPES.BASIC, position);
    }
});

// UI-Aktualisierung
function updateUI() {
    document.getElementById('resources').textContent = `Ressourcen: ${game.resources}`;
    document.getElementById('lives').textContent = `Leben: ${game.lives}`;
    document.getElementById('wave').textContent = `Welle: ${game.wave}`;
}

// UI-Aktualisierung alle 100ms
setInterval(updateUI, 100);
