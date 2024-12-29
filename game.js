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

    // Weitere Methoden werden in den nächsten Teilen hinzugefügt
}