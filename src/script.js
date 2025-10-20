import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import galaxyVertexShader from "./shaders/galaxy/vertex.glsl";
import galaxyFragmentShader from "./shaders/galaxy/fragment.glsl";

/**
 * Base
 */
// Debug
const gui = new GUI({
	width: 300,
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
parameters.size = 24; // Taille des particules
parameters.radius = 6; // Rayon de la galaxie
parameters.branchesCount = 3; // Nombre de bras de la galaxie
parameters.spin = 1; // "Quantité de spirale"
parameters.spinSpeed = 0.25; // "Vitesse de spirale"
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
	const scales = new Float32Array(parameters.particlesCount * 1);
	const randomness = new Float32Array(parameters.particlesCount * 3);

	const innerColor = new THREE.Color(parameters.innerColor);
	const outerColor = new THREE.Color(parameters.outerColor);

	for (let i = 0; i < parameters.particlesCount; i++) {
		// Position
		const i3 = i * 3;

		const radius = Math.random() * parameters.radius;
		const spinAngle = radius * parameters.spin;
		const branchAngle =
			((i % parameters.branchesCount) / parameters.branchesCount) * Math.PI * 2;

		positions[i3] = Math.cos(branchAngle + spinAngle) * radius;
		positions[i3 + 1] = 0;
		positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius;

		// Randomness
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

		randomness[i3] = randomX;
		randomness[i3 + 1] = randomY;
		randomness[i3 + 2] = randomZ;

		//Color
		const mixedColor = innerColor.clone();
		mixedColor.lerp(outerColor, radius / parameters.radius);

		colors[i3 + 0] = mixedColor.r;
		colors[i3 + 1] = mixedColor.g;
		colors[i3 + 2] = mixedColor.b;

		// Scale
		scales[i] = Math.random();
	}

	geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
	geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
	geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
	geometry.setAttribute(
		"aRandomness",
		new THREE.BufferAttribute(randomness, 3)
	);

	material = new THREE.ShaderMaterial({
		depthWrite: false,
		blending: THREE.AdditiveBlending,
		vertexColors: true,
		vertexShader: galaxyVertexShader,
		fragmentShader: galaxyFragmentShader,

		uniforms: {
			uSize: { value: parameters.size * renderer.getPixelRatio() },
			uTime: { value: 0 },
		},
	});

	particles = new THREE.Points(geometry, material);
	scene.add(particles);
}

gui
	.add(parameters, "particlesCount")
	.min(2000)
	.max(1000000)
	.step(100)
	.onFinishChange(generateGalaxy);
gui
	.add(parameters, "size")
	.min(1)
	.max(50)
	.step(0.01)
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
	.add(parameters, "spinSpeed")
	.min(0)
	.max(5)
	.step(0.01)
	.onChange(generateGalaxy);
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
camera.position.x = 2.25;
camera.position.y = 2.25;
camera.position.z = 2.25;
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

generateGalaxy();

/**
 * Animate
 */
let clock = new THREE.Clock();

// Reset
function resetGalaxy() {
	// Regenerate geometry/material/particles
	generateGalaxy();

	// Reset animation time: recreate the clock so elapsedTime starts at 0
	clock = new THREE.Clock();

	// Ensure shader time uniform is zeroed
	if (material && material.uniforms && material.uniforms.uTime) {
		material.uniforms.uTime.value = 0;
	}

	// Reset particle rotation so the galaxy appears in its initial orientation
	if (particles) {
		particles.rotation.set(0, 0, 0);
	}
}

gui.add({ reset: resetGalaxy }, "reset").name("Reset Galaxy");

const tick = () => {
	const elapsedTime = clock.getElapsedTime();

	// Update material
	material.uniforms.uTime.value = elapsedTime * parameters.spinSpeed;

	// particles.rotation.y = elapsedTime * 0.1;
	// particles.rotation.x = Math.sin(elapsedTime) * 0.02;

	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
