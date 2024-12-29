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

        this.initScene();
    }

    initScene() {
        // Hier Szene initialisieren (Boden, Licht, etc.)
    }

    update() {
        // Hier Spiellogik aktualisieren
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}

class Tower {
    constructor(position) {
        this.position = position;
        // Weitere Tower-Eigenschaften hier
    }

    update() {
        // Tower-Logik hier
    }
}

class Enemy {
    constructor(path) {
        this.path = path;
        this.position = path[0];
        // Weitere Gegner-Eigenschaften hier
    }

    update() {
        // Gegner-Bewegung und -Logik hier
    }
}

// Spielinitialisierung
const game = new Game();

function gameLoop() {
    requestAnimationFrame(gameLoop);
    game.update();
    game.render();
}

gameLoop();