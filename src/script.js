import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

/**
 * Base
 */
// Debug
// const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Lights
 */
// const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
// scene.add(ambientLight);

// const pointLight = new THREE.PointLight(0xffffff, 50);
// pointLight.position.x = 2;
// pointLight.position.y = 3;
// pointLight.position.z = 4;
// scene.add(pointLight);

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const particlesTexture = textureLoader.load("./textures/particles/3.png");

/**
 * Particles
 */
// On créé une buffer geometry vide pour les particules
// On définit le nombre de particules
const particlesGeometry = new THREE.BufferGeometry();
const count = 5000;

// On crée un tableau de positions pour les particules, avec le x, y et z de chacune
// On remplit le tableau avec des valeurs aléatoires pour chaque particule
// On créé un tableau de couleurs
const position = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);

for (let i = 0; i < count * 3; i++) {
	position[i] = (Math.random() - 0.5) * 10;
	colors[i] = Math.random();
}

// On attribue à chaque particule une position dans la géométrie
// On précise que chaque position est un vecteur de 3 valeurs (x, y, z)
particlesGeometry.setAttribute(
	"position",
	new THREE.BufferAttribute(position, 3)
);
// On ajoute un attribut de couleur à la géométrie
// On précise que chaque couleur est un vecteur de 3 valeurs (r, g, b)
particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

// On crée un matériau pour les particules
// On définit la taille de chaque particule et si elle doit être affectée par la distance
const particlesMaterial = new THREE.PointsMaterial({
	size: 0.1,
	sizeAttenuation: true,
	// color: "#a8fff8",
	vertexColors: true, // Utilise les couleurs définies dans la géométrie
	alphaMap: particlesTexture,
	transparent: true,
	// alphaTest: 0.6,
	// depthTest: false,
	depthWrite: false,
	blending: THREE.AdditiveBlending,
});

// Points
// On crée un objet Points qui combine la géométrie et le matériau
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener("resize", () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	100
);
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 2;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
	const elapsedTime = clock.getElapsedTime();

	// Update controls
	controls.update();

	// Update particles
	particles.rotation.y = elapsedTime * 0.05;

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
