import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new GUI({
	width: 400,
});
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Galaxy
 */
// Parameters object
const parameters = {};
parameters.particlesCount = 250000; // Nombre de particules
parameters.size = 0.01; // Taille des particules
parameters.radius = 6; // Rayon de la galaxie
parameters.branchesCount = 3; // Nombre de bras de la galaxie
parameters.spin = 1.245; // "Quantité de spirale"
parameters.randomness = 0.25; // Diamêtre des bras
parameters.clusterCoefficient = 2; // Coefficient de regroupement au centre des bras
parameters.innerColor = "#f4541f"; // Couleur du centre de la galaxie
parameters.outerColor = "#1d4b96"; // Couleur de l'extérieur de la galaxie

let geometry = null;
let material = null;
let particles = null;

function generateGalaxy() {
	if (particles) {
		geometry.dispose();
		material.dispose();
		scene.remove(particles);
	}

	geometry = new THREE.BufferGeometry();

	const positions = new Float32Array(parameters.particlesCount * 3);
	const colors = new Float32Array(parameters.particlesCount * 3);

	const innerColor = new THREE.Color(parameters.innerColor);
	const outerColor = new THREE.Color(parameters.outerColor);

	for (let i = 0; i < parameters.particlesCount; i++) {
		// Position
		const i3 = i * 3;

		const radius = Math.random() * parameters.radius;
		const spinAngle = radius * parameters.spin;
		const branchAngle =
			((i % parameters.branchesCount) / parameters.branchesCount) * Math.PI * 2;

		const randomX =
			Math.pow(Math.random(), parameters.clusterCoefficient) *
			(Math.random() < 0.5 ? 1 : -1) *
			parameters.randomness *
			radius;
		const randomY =
			Math.pow(Math.random(), parameters.clusterCoefficient) *
			(Math.random() < 0.5 ? 1 : -1) *
			parameters.randomness *
			radius;
		const randomZ =
			Math.pow(Math.random(), parameters.clusterCoefficient) *
			(Math.random() < 0.5 ? 1 : -1) *
			parameters.randomness *
			radius;

		positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
		positions[i3 + 1] = randomY;
		positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

		//Color
		const mixedColor = innerColor.clone();
		mixedColor.lerp(outerColor, radius / parameters.radius);

		colors[i3 + 0] = mixedColor.r;
		colors[i3 + 1] = mixedColor.g;
		colors[i3 + 2] = mixedColor.b;
	}

	geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
	geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

	material = new THREE.PointsMaterial({
		size: parameters.size,
		sizeAttenuation: true,
		depthWrite: true,
		blending: THREE.AdditiveBlending,
		vertexColors: true,
	});

	particles = new THREE.Points(geometry, material);
	scene.add(particles);
}
generateGalaxy();

gui
	.add(parameters, "particlesCount")
	.min(2000)
	.max(1000000)
	.step(100)
	.onFinishChange(generateGalaxy);
gui
	.add(parameters, "size")
	.min(0.001)
	.max(0.2)
	.step(0.001)
	.onFinishChange(generateGalaxy);
gui
	.add(parameters, "radius")
	.min(0.01)
	.max(20)
	.step(0.01)
	.onFinishChange(generateGalaxy);
gui
	.add(parameters, "branchesCount")
	.min(2)
	.max(12)
	.step(1)
	.onFinishChange(generateGalaxy);
gui.add(parameters, "spin").min(-5).max(5).step(0.001).onChange(generateGalaxy);
gui
	.add(parameters, "randomness")
	.min(0)
	.max(2)
	.step(0.001)
	.onFinishChange(generateGalaxy);
gui
	.add(parameters, "clusterCoefficient")
	.min(1)
	.max(10)
	.step(0.001)
	.onFinishChange(generateGalaxy);
gui.addColor(parameters, "innerColor").onFinishChange(generateGalaxy);
gui.addColor(parameters, "outerColor").onFinishChange(generateGalaxy);

// Black hole
parameters.showBlackHole = false;
parameters.blackHoleSize = 0.02;

let blackHoleGeometry = new THREE.SphereGeometry(
	parameters.blackHoleSize,
	32,
	32
);
const blackHoleMaterial = new THREE.MeshBasicMaterial({
	color: "#000000",
});
let blackHole = new THREE.Mesh(blackHoleGeometry, blackHoleMaterial);
blackHole.position.set(0, 0, 0);
scene.add(blackHole);

// Toggle black hole visibility
gui
	.add(parameters, "showBlackHole")
	.name("Show Black Hole")
	.onChange((value) => {
		blackHole.visible = value;
	});

// Contrôle de la taille du trou noir
gui
	.add(parameters, "blackHoleSize")
	.min(0.01)
	.max(0.4)
	.step(0.01)
	.name("Black Hole Size")
	.onChange((value) => {
		// Remplacer la géométrie du trou noir
		blackHole.geometry.dispose();
		blackHole.geometry = new THREE.SphereGeometry(value, 32, 32);
	});

// Set initial visibility
blackHole.visible = parameters.showBlackHole;

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
camera.position.x = 2.5;
camera.position.y = 2.5;
camera.position.z = 2.5;
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

	particles.rotation.y = elapsedTime * 0.1;
	// particles.rotation.x = Math.sin(elapsedTime) * 0.02;

	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
