import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Scene, camera, and renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Add camera controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 10;
controls.maxDistance = 500;

// Set initial camera position
camera.position.set(0, 30, 150);
controls.update();

// 控制参数
const params = {
	speedFactor: 1,
	showOrbits: true,
	showLabels: true,
	sunIntensity: 3,  // 提高太阳亮度默认值
	planetBrightness: 2.5  // 大幅提高行星亮度默认值
};

// Load space background texture
const textureLoader = new THREE.TextureLoader();
// 使用本地背景星空图片
const spaceTexture = textureLoader.load('textures/stars.jpg');
scene.background = spaceTexture;

// Create ambient light for base lighting
const ambientLight = new THREE.AmbientLight(0x777777);  // 进一步增加环境光强度
scene.add(ambientLight);

// Add strong directional light for sun
const sunLight = new THREE.PointLight(0xffffff, params.sunIntensity, 1500);  // 增加光照距离

// 添加更多光源以增强行星可见度
const additionalLight = new THREE.DirectionalLight(0xffffff, 1.0);  // 增加额外光源强度
additionalLight.position.set(0, 100, 0);
scene.add(additionalLight);

// 添加第二个补充光源从不同角度照射
const secondaryLight = new THREE.DirectionalLight(0xffffee, 0.7);
secondaryLight.position.set(100, 20, 100);
scene.add(secondaryLight);

// 添加显示轨道的配置选项
const orbitWidth = 0.1;
const orbitOpacity = 0.3;

// Solar system objects with real-ish relative sizes (not to scale distances)
const solarSystemObjects = [
	{
		name: 'Sun',
		radius: 20,
		textureUrl: 'textures/planets/sun.jpg',
		position: { x: 0, y: 0, z: 0 },
		rotationSpeed: 0.001,
		orbitSpeed: 0,
		emissive: true,
		parent: null,
		orbitRadius: 0  // 太阳没有轨道
	},
	{
		name: 'Mercury',
		radius: 1.5,
		textureUrl: 'textures/planets/mercury.jpg',
		position: { x: 35, y: 0, z: 0 },
		rotationSpeed: 0.005,
		orbitSpeed: 0.008,
		emissive: false,
		parent: 'Sun',
		orbitRadius: 35
	},
	{
		name: 'Venus',
		radius: 3,
		textureUrl: 'textures/planets/venus.jpg',
		position: { x: 50, y: 0, z: 0 },
		rotationSpeed: 0.005,
		orbitSpeed: 0.006,
		emissive: false,
		parent: 'Sun',
		orbitRadius: 50
	},
	{
		name: 'Earth',
		radius: 3.5,
		textureUrl: 'textures/planets/earth.jpg',
		position: { x: 70, y: 0, z: 0 },
		rotationSpeed: 0.01,
		orbitSpeed: 0.004,
		emissive: false,
		parent: 'Sun',
		orbitRadius: 70
	},
	{
		name: 'Moon',
		radius: 1,
		textureUrl: 'textures/planets/moon.jpg',
		position: { x: 8, y: 0, z: 0 },
		rotationSpeed: 0.005,
		orbitSpeed: 0.03,
		emissive: false,
		parent: 'Earth',
		orbitRadius: 8
	},
	{
		name: 'Mars',
		radius: 2.5,
		textureUrl: 'textures/planets/mars.jpg',
		position: { x: 90, y: 0, z: 0 },
		rotationSpeed: 0.009,
		orbitSpeed: 0.003,
		emissive: false,
		parent: 'Sun',
		orbitRadius: 90
	},
	{
		name: 'Jupiter',
		radius: 10,
		textureUrl: 'textures/planets/jupiter.jpg',
		position: { x: 130, y: 0, z: 0 },
		rotationSpeed: 0.02,
		orbitSpeed: 0.002,
		emissive: false,
		parent: 'Sun',
		orbitRadius: 130
	},
	{
		name: 'Saturn',
		radius: 8,
		textureUrl: 'textures/planets/saturn.jpg',
		position: { x: 170, y: 0, z: 0 },
		rotationSpeed: 0.018,
		orbitSpeed: 0.0015,
		emissive: false,
		parent: 'Sun',
		orbitRadius: 170
	},
	{
		name: 'Saturn Ring',
		innerRadius: 9,
		outerRadius: 15,
		textureUrl: 'textures/planets/saturn-ring.png',
		position: { x: 0, y: 0, z: 0 },
		rotationSpeed: 0.018,
		orbitSpeed: 0.0015,
		emissive: false,
		parent: 'Saturn',
		orbitRadius: 0  // 土星环没有轨道
	},
	{
		name: 'Uranus',
		radius: 6,
		textureUrl: 'textures/planets/uranus.jpg',
		position: { x: 210, y: 0, z: 0 },
		rotationSpeed: 0.012,
		orbitSpeed: 0.001,
		emissive: false,
		parent: 'Sun',
		orbitRadius: 210
	},
	{
		name: 'Neptune',
		radius: 6,
		textureUrl: 'textures/planets/neptune.jpg',
		position: { x: 240, y: 0, z: 0 },
		rotationSpeed: 0.01,
		orbitSpeed: 0.0008,
		emissive: false,
		parent: 'Sun',
		orbitRadius: 240
	}
];

// Object to hold all celestial bodies with their orbiters
const celestialBodies = {};
const orbits = []; // 存储所有轨道线
const labels = []; // 存储所有标签

// 创建轨道线函数
function createOrbitLine(radius) {
	const segments = 128;
	const orbitGeometry = new THREE.BufferGeometry();
	const orbitMaterial = new THREE.LineBasicMaterial({
		color: 0xffffff,
		transparent: true,
		opacity: orbitOpacity,
		linewidth: orbitWidth
	});

	const vertices = [];
	for (let i = 0; i <= segments; i++) {
		const theta = (i / segments) * Math.PI * 2;
		const x = radius * Math.cos(theta);
		const z = radius * Math.sin(theta);
		vertices.push(x, 0, z);
	}

	orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
	const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
	orbit.rotation.x = Math.PI / 2;
	return orbit;
}

// Create all solar system objects
solarSystemObjects.forEach(obj => {
	let mesh;

	if (obj.name === 'Saturn Ring') {
		// Create a ring for Saturn
		const ringGeometry = new THREE.RingGeometry(obj.innerRadius, obj.outerRadius, 64);
		const ringTexture = textureLoader.load(obj.textureUrl);
		const ringMaterial = new THREE.MeshBasicMaterial({
			map: ringTexture,
			side: THREE.DoubleSide,
			transparent: true,
			opacity: 0.8
		});
		mesh = new THREE.Mesh(ringGeometry, ringMaterial);
		mesh.rotation.x = Math.PI / 2;
	} else {
		// Create a regular planet or sun
		const geometry = new THREE.SphereGeometry(obj.radius, 64, 64);
		const texture = textureLoader.load(obj.textureUrl);

		let material;
		if (obj.emissive) {
			// For sun, use emissive material
			material = new THREE.MeshBasicMaterial({
				map: texture,
				emissive: 0xffff00,
				emissiveIntensity: 0.5
			});
		} else {
			// For planets, use standard material with increased brightness
			material = new THREE.MeshStandardMaterial({
				map: texture,
				metalness: 0,  // 降低金属度以获得更好的亮度
				roughness: 0.2,  // 降低粗糙度以增加反光
				emissive: 0x555555,  // 大幅提高自发光
				emissiveIntensity: 0.5  // 提高发光强度
			});
		}

		mesh = new THREE.Mesh(geometry, material);
	}

	// Set initial position
	mesh.position.set(obj.position.x, obj.position.y, obj.position.z);

	// Create an orbital group that will handle the rotation around parent
	const orbitGroup = new THREE.Group();

	if (obj.parent === null) {
		// Add the sun directly to the scene
		scene.add(orbitGroup);
	} else {
		// Find parent object and add this orbiter to it
		celestialBodies[obj.parent].orbitGroup.add(orbitGroup);

		// 为轨道添加轨道线
		if (params.showOrbits && obj.orbitRadius > 0 && obj.name !== 'Saturn Ring') {
			const orbitLine = createOrbitLine(obj.orbitRadius);
			celestialBodies[obj.parent].orbitGroup.add(orbitLine);
			orbits.push({
				line: orbitLine,
				parent: obj.parent
			});
		}
	}

	orbitGroup.add(mesh);

	// Store the object with its metadata
	celestialBodies[obj.name] = {
		mesh: mesh,
		orbitGroup: orbitGroup,
		rotationSpeed: obj.rotationSpeed,
		orbitSpeed: obj.orbitSpeed,
		name: obj.name
	};

	// If it's the sun, attach the light to it
	if (obj.name === 'Sun') {
		mesh.add(sunLight);
	}
});

// 添加行星标签
function createPlanetLabel(name) {
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');
	canvas.width = 128;
	canvas.height = 32;

	context.fillStyle = 'rgba(0, 0, 0, 0.7)';
	context.fillRect(0, 0, canvas.width, canvas.height);

	context.font = '24px Arial';
	context.fillStyle = 'white';
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.fillText(name, canvas.width / 2, canvas.height / 2);

	const texture = new THREE.CanvasTexture(canvas);
	const material = new THREE.SpriteMaterial({
		map: texture,
		transparent: true
	});

	const sprite = new THREE.Sprite(material);
	sprite.scale.set(10, 2.5, 1);

	return sprite;
}

// 为每个行星添加标签
Object.keys(celestialBodies).forEach(name => {
	if (name !== 'Saturn Ring') {
		const label = createPlanetLabel(name);
		const body = celestialBodies[name];

		// 调整标签位置
		const labelYOffset = body.mesh.geometry.type === 'SphereGeometry' ?
			body.mesh.geometry.parameters.radius + 2 : 2;

		label.position.set(0, labelYOffset, 0);
		body.mesh.add(label);

		// 保存标签引用
		labels.push({
			sprite: label,
			bodyName: name
		});
	}
});

// 添加GUI控制面板
const gui = new dat.GUI({ width: 300 });

// 设置控制面板
gui.add(params, 'speedFactor', 0, 5).name('Planet Speed').step(0.1);
gui.add(params, 'sunIntensity', 0, 5).name('Sun Brightness').step(0.1).onChange(value => {
	sunLight.intensity = value;
});
gui.add(params, 'planetBrightness', 0, 5).name('Planet Brightness').step(0.1).onChange(value => {  // 扩大亮度范围到5
	// 更新所有行星的亮度
	Object.values(celestialBodies).forEach(obj => {
		if (obj.name !== 'Sun' && obj.name !== 'Saturn Ring') {
			if (obj.mesh.material.emissiveIntensity !== undefined) {
				obj.mesh.material.emissiveIntensity = value * 0.25;  // 增加亮度系数
				obj.mesh.material.needsUpdate = true;
			}
		}
	});
});

// 控制显示轨道
gui.add(params, 'showOrbits').name('Show Orbits').onChange(value => {
	orbits.forEach(orbit => {
		orbit.line.visible = value;
	});
});

// 控制显示标签
gui.add(params, 'showLabels').name('Show Labels').onChange(value => {
	labels.forEach(label => {
		label.sprite.visible = value;
	});
});

// 添加重置视角按钮
const resetCameraFolder = gui.addFolder('Camera Controls');
resetCameraFolder.add({
	resetCamera: function () {
		camera.position.set(0, 30, 150);
		camera.lookAt(0, 0, 0);
		controls.update();
	}
}, 'resetCamera').name('Reset View');

// 添加行星焦点按钮
const planetFocusFolder = gui.addFolder('Planet Focus');
Object.keys(celestialBodies).forEach(name => {
	if (name !== 'Saturn Ring') {
		planetFocusFolder.add({
			focusOn: function () {
				// 获取行星当前世界坐标
				const planet = celestialBodies[name];
				const planetWorldPosition = new THREE.Vector3();
				planet.mesh.getWorldPosition(planetWorldPosition);

				// 设置相机位置 - 在行星附近但有一定距离
				const distanceFactor = name === 'Sun' ? 3 : 5;
				const radius = planet.mesh.geometry.parameters.radius || 5;

				const distance = radius * distanceFactor;
				const offset = new THREE.Vector3(distance, distance * 0.7, distance);
				camera.position.copy(planetWorldPosition).add(offset);

				// 将相机指向行星
				controls.target.copy(planetWorldPosition);
				controls.update();
			}
		}, 'focusOn').name(name);
	}
});

// 打开/折叠文件夹
resetCameraFolder.open();
planetFocusFolder.open();

// Add stars to the background
function addStars() {
	const starGeometry = new THREE.BufferGeometry();
	const starMaterial = new THREE.PointsMaterial({
		color: 0xffffff,
		size: 0.5
	});

	const starVertices = [];
	for (let i = 0; i < 10000; i++) {
		const x = (Math.random() - 0.5) * 2000;
		const y = (Math.random() - 0.5) * 2000;
		const z = (Math.random() - 0.5) * 2000;
		starVertices.push(x, y, z);
	}

	starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
	const stars = new THREE.Points(starGeometry, starMaterial);
	scene.add(stars);
}

addStars();

// Handle window resize
window.addEventListener('resize', () => {
	const width = window.innerWidth;
	const height = window.innerHeight;

	renderer.setSize(width, height);
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
});

// Animation loop
function animate() {
	requestAnimationFrame(animate);

	// Update orbital controls
	controls.update();

	// Rotate and orbit all objects
	Object.values(celestialBodies).forEach(obj => {
		// Self rotation
		obj.mesh.rotation.y += obj.rotationSpeed * params.speedFactor;

		// Orbit around parent
		if (obj.orbitSpeed > 0) {
			obj.orbitGroup.rotation.y += obj.orbitSpeed * params.speedFactor;
		}
	});

	renderer.render(scene, camera);
}

// Start animation
animate(); 