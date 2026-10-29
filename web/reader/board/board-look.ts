import {
  AdditiveBlending, BackSide, CanvasTexture, Color, DirectionalLight, FogExp2, HemisphereLight, Mesh, PlaneGeometry,
  type Scene, ShaderMaterial, SphereGeometry, Sprite, SpriteMaterial, Vector3,
} from 'three';
import { Noise } from './noise';
import type { BoardKnowing } from './board-knowing';
import type { HexGrid } from './hex-grid';

// The board's light and air, after the title: dusk over the country, a gold thread low at the horizon, the far land
// going into a haze the colour of the sky there; mist in two drifting banks over what is not known; water that shows
// the sky as you look across it and the low sun's glint; lamps and lanterns as soft glows rather than lights.
export class BoardLook {
  static readonly HAZE = '#1c2029';
  private static readonly flat = 'varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz;'
    + ' gl_Position = projectionMatrix * viewMatrix * w; }';
  private static readonly mistShader = `
uniform sampler2D uMask, uNoise; uniform vec2 uOrigin, uSize; uniform float uTime, uScale, uOpacity, uSeed, uFog;
uniform vec3 uLow, uHigh, uHaze; varying vec3 vW;
void main() {
  float kn = texture2D(uMask, (vW.xz - uOrigin) / uSize).r; vec2 p = vW.xz * uScale + uSeed;
  float f = texture2D(uNoise, p + vec2(uTime * .006, uTime * .002)).r * .62
    + texture2D(uNoise, p * 2.3 - vec2(uTime * .009, -uTime * .004)).r * .38;
  float a = (1. - smoothstep(.15, .85, kn)) * smoothstep(.36, .74, f) * uOpacity;
  float d = distance(vW, cameraPosition), fog = 1. - exp(-pow(uFog * d, 2.));
  gl_FragColor = vec4(mix(mix(uLow, uHigh, smoothstep(.42, .85, f)), uHaze, fog * .85), a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
  private static readonly waterShader = `
uniform sampler2D uNoise; uniform float uTime, uFog; uniform vec3 uDeep, uSky, uSun, uSunDir, uHaze; varying vec3 vW;
void main() {
  vec3 v = normalize(cameraPosition - vW); vec2 p = vW.xz * .35;
  float n = texture2D(uNoise, p + vec2(uTime * .004, uTime * .002)).r - texture2D(uNoise, p * 2.7 - uTime * .005).r;
  vec3 nrm = normalize(vec3(n * .22, 1., n * .14));
  float fres = pow(1. - max(dot(v, nrm), 0.), 3.5);
  vec3 c = mix(uDeep, uSky, clamp(fres * .95, 0., 1.)) + uSun * pow(max(dot(reflect(-v, nrm), uSunDir), 0.), 60.) * .55;
  float d = distance(vW, cameraPosition), fog = 1. - exp(-pow(uFog * d, 2.));
  gl_FragColor = vec4(mix(c, uHaze, fog), 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
  private static readonly skyShader = `
varying vec3 d;
void main() {
  vec3 n = normalize(d); float y = n.y, west = .5 + .5 * dot(normalize(n.xz + 1e-4), normalize(vec2(-.75, .55)));
  vec3 c = mix(vec3(.110, .125, .160), vec3(.035, .043, .066), smoothstep(.0, .5, y));
  c += vec3(.80, .50, .27) * exp(-max(y - .005, 0.) * 22.) * (.10 + .32 * west * west);
  c += vec3(.95, .74, .30) * exp(-abs(y - .012) * 260.) * .10 * (.4 + .6 * west);
  gl_FragColor = vec4(c, 1.);
  #include <colorspace_fragment>
}`;
  private readonly noise = Noise.texture();
  private readonly shaders: ShaderMaterial[] = [];
  private readonly time = { value: 0 };
  private readonly fog = { value: 0.03 };
  private readonly glowMap = BoardLook.glowTexture();
  constructor(private readonly scene: Scene, private readonly grid: HexGrid, private readonly knowing: BoardKnowing) {
    scene.background = new Color(BoardLook.HAZE); scene.fog = new FogExp2(BoardLook.HAZE, 0.03);
    scene.add(new HemisphereLight('#b3bfd3', '#3a3024', 0.85));
    const sun = new DirectionalLight('#ffd09a', 2.2), mid = new Vector3(grid.across / 2, 0, grid.down / 2);
    sun.position.copy(mid).add(new Vector3(-10, 6.5, 10)); sun.target.position.copy(mid);
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02;
    Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 50 });
    scene.add(sun, sun.target, this.sky(mid));
  }
  private sky(mid: Vector3): Mesh {
    const m = new ShaderMaterial({ side: BackSide, depthWrite: false, fog: false, fragmentShader: BoardLook.skyShader,
      vertexShader: 'varying vec3 d; void main() { d = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.);'
        + ' gl_Position = p.xyww; }' });
    const dome = new Mesh(new SphereGeometry(140, 32, 16), m);
    dome.position.copy(mid); dome.renderOrder = -1; dome.frustumCulled = false;
    return dome;
  }
  // A bank of mist at a height, of a grain, so thick, from a place in the noise.
  mist(y: number, scale: number, opacity: number, seed: number): void {
    const k = this.knowing, m = new ShaderMaterial({ vertexShader: BoardLook.flat, fragmentShader: BoardLook.mistShader,
      transparent: true, depthWrite: false, uniforms: { uMask: { value: k.texture }, uNoise: { value: this.noise },
        uOrigin: { value: k.origin }, uSize: { value: k.size }, uTime: this.time, uScale: { value: scale },
        uOpacity: { value: opacity }, uSeed: { value: seed }, uFog: this.fog, uLow: { value: new Color('#12151b') },
        uHigh: { value: new Color('#474d5b') }, uHaze: { value: new Color(BoardLook.HAZE) } } });
    const plane = new Mesh(new PlaneGeometry(k.size.x, k.size.y), m);
    plane.rotateX(-Math.PI / 2); plane.position.set(this.grid.across / 2, y, this.grid.down / 2);
    plane.renderOrder = 10;
    this.scene.add(plane); this.shaders.push(m);
  }
  water(): ShaderMaterial {
    const m = new ShaderMaterial({ vertexShader: BoardLook.flat, fragmentShader: BoardLook.waterShader,
      uniforms: { uNoise: { value: this.noise }, uTime: this.time, uFog: this.fog,
        uDeep: { value: new Color('#163450') },
        uSky: { value: new Color('#8d8780') }, uSun: { value: new Color('#ffc98a') },
        uSunDir: { value: new Vector3(-10, 6.5, 10).normalize() }, uHaze: { value: new Color(BoardLook.HAZE) } } });
    this.shaders.push(m);
    return m;
  }
  glow(at: Vector3, size: number, opacity: number): Sprite {
    const s = new Sprite(new SpriteMaterial({ map: this.glowMap, transparent: true, depthWrite: false,
      blending: AdditiveBlending,
      opacity }));
    s.position.copy(at); s.scale.setScalar(size); s.renderOrder = 6;
    return s;
  }
  // The haze as deep at any nearness: the land in view always clear, the far country always going into it.
  air(distance: number, seconds: number): void {
    const haze = 0.4 / distance;
    (this.scene.fog as FogExp2).density = haze; this.fog.value = haze; this.time.value = seconds;
  }
  private static glowTexture(): CanvasTexture {
    const c = document.createElement('canvas'), g = c.getContext('2d')!,
      r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    c.width = c.height = 64;
    r.addColorStop(0, 'rgba(255,214,140,1)'); r.addColorStop(0.25, 'rgba(255,180,90,.45)');
    r.addColorStop(1, 'rgba(255,160,70,0)');
    g.fillStyle = r; g.fillRect(0, 0, 64, 64);
    return new CanvasTexture(c);
  }
}
