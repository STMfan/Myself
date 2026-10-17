import { useEffect, useRef } from 'react';
import {
  AdditiveBlending,
  AmbientLight,
  BackSide,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  TextureLoader,
  WebGLRenderer,
} from 'three';

const MAP_WIDE = '/assets/art/moon-map.webp';
const MAP_SMALL = '/assets/art/moon-map-1k.webp';

export function MoonCanvas({
  locale,
  onReady,
}: {
  locale: 'zh' | 'en';
  onReady: (ready: boolean) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const calm =
      document.documentElement.dataset.motion === 'calm' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const compact =
      window.matchMedia('(hover: none)').matches || window.innerWidth < 768;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: compact ? 'default' : 'high-performance',
      });
    } catch {
      onReady(false);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(34, 1, 0.1, 50);
    camera.position.set(0, 0, 3.7);

    const group = new Group();
    group.rotation.z = 0.12;
    scene.add(group);

    const geometry = new SphereGeometry(1, compact ? 96 : 128, compact ? 72 : 96);
    const loader = new TextureLoader();
    const mapUrl = window.innerWidth < 820 ? MAP_SMALL : MAP_WIDE;
    const map = loader.load(
      mapUrl,
      () => onReady(true),
      undefined,
      () => onReady(false),
    );
    map.colorSpace = SRGBColorSpace;
    map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    const material = new MeshStandardMaterial({
      map,
      bumpMap: null,
      bumpScale: 0.12,
      roughness: 0.98,
      metalness: 0,
      color: new Color('#ffffff'),
    });
    const moon = new Mesh(geometry, material);
    moon.rotation.y = Math.PI * 0.58;
    group.add(moon);

    const rimUniforms = {
      uColor: { value: new Color('#f2a24b') },
      uStrength: { value: 0.42 },
    };
    const rim = new Mesh(
      new SphereGeometry(1.012, 64, 48),
      new ShaderMaterial({
        uniforms: rimUniforms,
        transparent: true,
        side: BackSide,
        blending: AdditiveBlending,
        depthWrite: false,
        vertexShader:
          'varying vec3 vNormal; varying vec3 vView; void main(){ vNormal = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vView = mv.xyz; gl_Position = projectionMatrix * mv; }',
        fragmentShader:
          'uniform vec3 uColor; uniform float uStrength; varying vec3 vNormal; varying vec3 vView; void main(){ float rim = pow(1.0 - max(dot(vNormal, normalize(-vView)), 0.0), 3.2); gl_FragColor = vec4(uColor, rim * uStrength); }',
      }),
    );
    group.add(rim);

    const key = new DirectionalLight(0xffffff, 2.9);
    key.position.set(-2.6, 1.7, 2.4);
    scene.add(key);

    const fill = new DirectionalLight(0x9cb8ff, 0.3);
    fill.position.set(2.6, -1.4, 1.4);
    scene.add(fill);

    const ambient = new AmbientLight(0x24314a, 0.16);
    scene.add(ambient);

    const applyTheme = () => {
      const light = document.documentElement.dataset.theme === 'light';
      ambient.intensity = light ? 0.5 : 0.16;
      key.intensity = light ? 1.95 : 2.9;
      fill.intensity = light ? 0.4 : 0.3;
      rimUniforms.uColor.value.set(light ? '#9fb4d4' : '#d8e2f2');
      rimUniforms.uStrength.value = light ? 0.02 : 0.05;
    };
    applyTheme();
    const themeObserver = new MutationObserver(applyTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const size = Math.max(120, Math.min(rect.width, rect.height || rect.width));
      renderer.setSize(size, size, false);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    let visible = true;
    const intersection = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
      },
      { threshold: 0.05 },
    );
    intersection.observe(host);

    let autoY = 0;
    let targetX = 0.06;
    let targetY = 0;
    let dragX = 0;
    let dragY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let raf = 0;
    let previous = performance.now();
    let lastRender = 0;
    const minFrame = 1000 / 30;

    const clamp = (value: number, min: number, max: number) =>
      Math.min(max, Math.max(min, value));

    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      host.setPointerCapture(event.pointerId);
      host.style.cursor = 'grabbing';
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      dragY += dx * 0.005;
      dragX = clamp(dragX + dy * 0.004, -0.7, 0.7);
      velocityY = dx * 0.0004;
      velocityX = dy * 0.0002;
    };

    const onPointerUp = (event: PointerEvent) => {
      dragging = false;
      host.style.cursor = 'grab';
      if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const step = 0.18;
      if (event.key === 'ArrowLeft') dragY -= step;
      else if (event.key === 'ArrowRight') dragY += step;
      else if (event.key === 'ArrowUp') dragX = clamp(dragX - step * 0.5, -0.7, 0.7);
      else if (event.key === 'ArrowDown') dragX = clamp(dragX + step * 0.5, -0.7, 0.7);
      else return;
      event.preventDefault();
    };

    host.addEventListener('pointerdown', onPointerDown);
    host.addEventListener('pointermove', onPointerMove);
    host.addEventListener('pointerup', onPointerUp);
    host.addEventListener('pointercancel', onPointerUp);
    host.addEventListener('keydown', onKeyDown);

    const frame = (time: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      if (time - lastRender < minFrame) return;
      const delta = Math.min(0.1, (time - lastRender) / 1000 || 0.016);
      lastRender = time;
      previous = time;

      if (!calm) autoY += delta * (compact ? 0.04 : 0.055);
      if (!dragging) {
        dragY += velocityY;
        dragX = clamp(dragX + velocityX, -0.7, 0.7);
        velocityY *= 0.94;
        velocityX *= 0.9;
      }
      targetY += (dragY - targetY) * 0.12;
      targetX += (dragX - targetX) * 0.12;
      group.rotation.y = targetY + autoY;
      group.rotation.x = targetX * 0.6;
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      intersection.disconnect();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      host.removeEventListener('pointerdown', onPointerDown);
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerup', onPointerUp);
      host.removeEventListener('pointercancel', onPointerUp);
      host.removeEventListener('keydown', onKeyDown);
      if (renderer.domElement.parentElement === host) host.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      map.dispose();
      rim.geometry.dispose();
      (rim.material as ShaderMaterial).dispose();
      renderer.dispose();
    };
  }, [onReady]);

  return (
    <div
      className="moon__canvas"
      ref={hostRef}
      role="img"
      tabIndex={0}
      aria-label={
        locale === 'zh'
          ? '三维月球，拖动或使用方向键旋转'
          : 'A 3D moon. Drag it, or use the arrow keys to rotate.'
      }
    />
  );
}
