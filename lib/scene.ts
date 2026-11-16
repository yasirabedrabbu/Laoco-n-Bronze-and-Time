import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { BG_VERTEX, BG_FRAGMENT } from "./shaders";

const SPARK_COUNT = 450;

/** Frame-rate independent smoothing factor (replaces fixed per-frame lerp). */
export const damp = (rate: number, dt: number) => 1 - Math.exp(-rate * dt);

export interface FrameState {
  scroll: number; // smoothed 0..1
  dt: number; // seconds
}

export interface SceneOptions {
  canvas: HTMLCanvasElement;
  modelUrl: string;
  reducedMotion: boolean;
  onProgress?: (p: number) => void;
  onLoaded?: () => void;
  onError?: (e: unknown) => void;
  onFrame?: (s: FrameState) => void;
}

export interface SceneHandle {
  setPointer: (nx: number, ny: number) => void;
  dispose: () => void;
}

interface SparkData {
  sx: number;
  sy: number;
  sz: number;
  swaySpeed: number;
  swayRadius: number;
  phase: number;
}

function disposeObject(root: THREE.Object3D) {
  root.traverse((obj) => {
    const isMesh = (obj as THREE.Mesh).isMesh;
    const isPoints = (obj as THREE.Points).isPoints;
    if (!isMesh && !isPoints) return;
    const m = obj as THREE.Mesh;
    m.geometry?.dispose();
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    mats.forEach((mat) => {
      if (!mat) return;
      Object.values(mat as unknown as Record<string, unknown>).forEach((v) => {
        if (v instanceof THREE.Texture) v.dispose();
      });
      mat.dispose();
    });
  });
}

function createSparkTexture() {
  const c = document.createElement("canvas");
  c.width = 16;
  c.height = 16;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.85)");
  g.addColorStop(0.6, "rgba(255,255,255,0.3)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 16, 16);
  return new THREE.CanvasTexture(c);
}

export function createScene(opts: SceneOptions): SceneHandle {
  const { canvas, modelUrl, reducedMotion } = opts;

  let width = window.innerWidth;
  let height = window.innerHeight;
  let pixelRatio = Math.min(window.devicePixelRatio, 2);
  let disposed = false;

  // ── Renderer ──────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(width, height, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 2.2;

  // ── Scene + camera ────────────────────────────────────────────────────
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#000000");
  scene.fog = new THREE.FogExp2("#000000", 0.01);

  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.set(0, 0.2, 3.0);
  scene.add(camera);

  // ── Background shader (child of camera) ───────────────────────────────
  const uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(width * pixelRatio, height * pixelRatio) },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uScroll: { value: 0 },
  };
  const bgMaterial = new THREE.ShaderMaterial({
    vertexShader: BG_VERTEX,
    fragmentShader: BG_FRAGMENT,
    uniforms,
    depthWrite: false,
    depthTest: false,
  });
  const bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), bgMaterial);
  bgMesh.position.set(0, 0, -8);
  bgMesh.renderOrder = -10;
  camera.add(bgMesh);

  // ── Lights ────────────────────────────────────────────────────────────
  scene.add(new THREE.AmbientLight("#ffffff", 0.1));

  const keyLight = new THREE.SpotLight("#ffffff", 18.0);
  keyLight.position.set(4, 6, 3);
  keyLight.angle = Math.PI / 4;
  keyLight.penumbra = 0.9;
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.camera.near = 1.0;
  keyLight.shadow.camera.far = 15;
  keyLight.shadow.bias = -0.001;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight("#e3f2ff", 10.0);
  rimLight.position.set(-5, 3, -4);
  scene.add(rimLight);

  const fillLight = new THREE.DirectionalLight("#fff3e6", 0.8);
  fillLight.position.set(-2, -4, 2);
  scene.add(fillLight);

  // ── Sparks ────────────────────────────────────────────────────────────
  const sparkGeometry = new THREE.BufferGeometry();
  const sparkPositions = new Float32Array(SPARK_COUNT * 3);
  const sparkColors = new Float32Array(SPARK_COUNT * 3);
  const sparkData: SparkData[] = [];

  for (let i = 0; i < SPARK_COUNT; i++) {
    sparkPositions[i * 3] = (Math.random() - 0.5) * 6.5;
    sparkPositions[i * 3 + 1] = (Math.random() - 0.5) * 5.0 - 0.5;
    sparkPositions[i * 3 + 2] = (Math.random() - 0.5) * 6.5;

    if (Math.random() < 0.6) {
      sparkColors[i * 3] = 1.0;
      sparkColors[i * 3 + 1] = 0.4 + Math.random() * 0.15;
      sparkColors[i * 3 + 2] = 0.05 + Math.random() * 0.1;
    } else {
      sparkColors[i * 3] = 0.55 + Math.random() * 0.15;
      sparkColors[i * 3 + 1] = 0.82 + Math.random() * 0.12;
      sparkColors[i * 3 + 2] = 1.0;
    }

    sparkData.push({
      sx: (Math.random() - 0.5) * 0.4,
      sy: 0.15 + Math.random() * 0.3,
      sz: (Math.random() - 0.5) * 0.4,
      swaySpeed: 0.5 + Math.random() * 1.5,
      swayRadius: 0.05 + Math.random() * 0.15,
      phase: Math.random() * Math.PI * 2,
    });
  }
  sparkGeometry.setAttribute("position", new THREE.BufferAttribute(sparkPositions, 3));
  sparkGeometry.setAttribute("color", new THREE.BufferAttribute(sparkColors, 3));

  const sparkPoints = new THREE.Points(
    sparkGeometry,
    new THREE.PointsMaterial({
      size: 0.025,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: createSparkTexture(),
    })
  );
  scene.add(sparkPoints);

  // ── Model ─────────────────────────────────────────────────────────────
  let modelPivot: THREE.Group | null = null;
  let mixer: THREE.AnimationMixer | null = null;
  const maxAniso = Math.min(16, renderer.capabilities.getMaxAnisotropy());

  new GLTFLoader().load(
    modelUrl,
    (gltf) => {
      if (disposed) return;
      const model = gltf.scene;
      const pivot = new THREE.Group();
      pivot.add(model);
      scene.add(pivot);

      model.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => {
          const std = m as THREE.MeshStandardMaterial;
          std.roughness = 0.42;
          std.metalness = 0.92;
          std.flatShading = false;
          if (std.map) std.map.anisotropy = maxAniso;
          std.needsUpdate = true;
        });
      });

      if (gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => mixer!.clipAction(clip).play());
      }

      // auto-scale to max dimension 3.5, then recenter
      const size = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      model.scale.setScalar(3.5 / (maxDim > 0.0001 ? maxDim : 1));
      model.updateMatrixWorld(true);
      const center = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
      model.position.sub(center);

      pivot.position.y = -0.4;
      modelPivot = pivot;
      opts.onLoaded?.();
    },
    (e) => {
      if (e.lengthComputable && e.total > 0) opts.onProgress?.(e.loaded / e.total);
    },
    (err) => {
      if (!disposed) opts.onError?.(err);
    }
  );

  // ── State ─────────────────────────────────────────────────────────────
  let maxScroll = 1;
  const measure = () => {
    maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  };
  measure();

  const readScroll = () => Math.min(1, Math.max(0, window.scrollY / maxScroll));
  let currentScroll = readScroll();

  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;

  const camTarget = new THREE.Vector3();
  const lookAtTarget = new THREE.Vector3();

  let raf = 0;
  let last = performance.now();
  let elapsed = 0;

  // ── Loop ──────────────────────────────────────────────────────────────
  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    elapsed += dt;

    mixer?.update(dt);

    const targetScroll = readScroll();
    const scrollDelta = targetScroll - currentScroll;
    currentScroll += scrollDelta * (reducedMotion ? 1 : damp(1.5, dt));

    mouseX += (targetMouseX - mouseX) * damp(3.1, dt);
    mouseY += (targetMouseY - mouseY) * damp(3.1, dt);

    if (modelPivot) {
      modelPivot.rotation.y = mouseX * 0.25;
      modelPivot.rotation.x = mouseY * 0.15;
    }

    // sparks
    const scrollVelocity = Math.abs(scrollDelta);
    const speedMul = (1 + scrollVelocity * 9) * (reducedMotion ? 0.3 : 1);
    const turbulence = scrollVelocity * 0.8;
    for (let i = 0; i < SPARK_COUNT; i++) {
      const idx = i * 3;
      const d = sparkData[i];
      sparkPositions[idx] += d.sx * dt * speedMul;
      sparkPositions[idx + 1] += d.sy * dt * speedMul;
      sparkPositions[idx + 2] += d.sz * dt * speedMul;

      const sway = d.swayRadius * (1 + turbulence * 4);
      sparkPositions[idx] += Math.sin(elapsed * d.swaySpeed + d.phase) * sway * dt;
      sparkPositions[idx + 2] += Math.cos(elapsed * d.swaySpeed + d.phase) * sway * dt;

      if (
        sparkPositions[idx + 1] > 3 ||
        Math.abs(sparkPositions[idx]) > 3.5 ||
        Math.abs(sparkPositions[idx + 2]) > 3.5
      ) {
        sparkPositions[idx + 1] = -2.5;
        sparkPositions[idx] = (Math.random() - 0.5) * 3;
        sparkPositions[idx + 2] = (Math.random() - 0.5) * 3;
      }
    }
    sparkGeometry.attributes.position.needsUpdate = true;

    // camera orbit
    const phi = currentScroll * Math.PI * 2;
    const s = Math.sin(currentScroll * Math.PI);
    const radius = 4.2 - s * 0.6;
    camTarget.set(radius * Math.sin(phi), 0.35 + s * 0.8, radius * Math.cos(phi));

    const tp = Math.min(1, currentScroll / 0.28);
    const ease = (Math.cos(tp * Math.PI) + 1) * 0.5;
    lookAtTarget.set(-0.9 * ease, -0.15, 0);

    camera.position.lerp(camTarget, damp(5, dt));
    camera.lookAt(lookAtTarget);

    uniforms.uTime.value = elapsed;
    uniforms.uMouse.value.set(mouseX, -mouseY);
    uniforms.uScroll.value = currentScroll;

    opts.onFrame?.({ scroll: currentScroll, dt });
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(tick);

  // ── Resize ────────────────────────────────────────────────────────────
  const onResize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    pixelRatio = Math.min(window.devicePixelRatio, 2);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    uniforms.uResolution.value.set(width * pixelRatio, height * pixelRatio);
    measure();
  };
  window.addEventListener("resize", onResize);

  // ── Public API ────────────────────────────────────────────────────────
  return {
    setPointer(nx, ny) {
      if (reducedMotion) return;
      targetMouseX = nx;
      targetMouseY = ny;
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      disposeObject(scene);
      bgMesh.geometry.dispose();
      bgMaterial.dispose();
      renderer.dispose();
    },
  };
}