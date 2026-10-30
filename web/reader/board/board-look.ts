import {
  AdditiveBlending, BackSide, Box3, CanvasTexture, Color, DirectionalLight, FogExp2, HemisphereLight, Mesh,
  PlaneGeometry, type Scene, ShaderMaterial, SphereGeometry, Sprite, SpriteMaterial, SRGBColorSpace, Vector2, Vector3,
} from 'three';
import { Noise } from './noise';
import type { BoardKnowing } from './board-knowing';
import type { HexGrid } from './hex-grid';

// The board's light and air, after the title: dusk over the country, a gold thread low at the horizon, the far land
// going into a haze the colour of the sky there; mist over what is not known, a soft veil low over all of it and
// drifts above; water that shows the sky as you look across it and the low sun's glint; lamps and lanterns as soft
// glows rather than lights.
export class BoardLook {
  static readonly HAZE = '#1c2029';
  // The haze as it is shown: laid over the mist and the water once their colours are made ready to be shown, as the
  // land's own haze is laid, so that far water and far land go into the same haze.
  private static readonly shownHaze = new Color(BoardLook.HAZE).convertLinearToSRGB();
  // Toward the low sun, in the south-west.
  private static readonly toSun = new Vector3(-10, 6.5, 10).normalize();
  private static readonly flat = 'varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz;'
    + ' gl_Position = projectionMatrix * viewMatrix * w; }';
  private static readonly mistShader = `
uniform sampler2D uMask, uNoise; uniform vec2 uOrigin, uSize, uMid, uRoom; uniform float uTime, uScale, uOpacity, uSeed;
uniform float uFog, uVeil; uniform vec3 uLow, uHigh, uHaze; varying vec3 vW;
void main() {
  float kn = texture2D(uMask, clamp((vW.xz - uOrigin) / uSize, 0., 1.)).r; vec2 p = vW.xz * uScale + uSeed;
  float f = texture2D(uNoise, p + vec2(uTime * .006, uTime * .002)).r * .62
    + texture2D(uNoise, p * 2.3 - vec2(uTime * .009, -uTime * .004)).r * .38;
  vec2 rim = 1. - smoothstep(.8, 1., abs(vW.xz - uMid) / uRoom);
  float a = (1. - smoothstep(.15, .85, kn)) * mix(uVeil, 1., smoothstep(.3, .78, f)) * uOpacity * rim.x * rim.y;
  float d = distance(vW, cameraPosition), fog = 1. - exp(-pow(uFog * d, 2.));
  gl_FragColor = vec4(mix(uLow, uHigh, smoothstep(.42, .85, f)), a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  gl_FragColor.rgb = mix(gl_FragColor.rgb, uHaze, fog * .85);
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
  gl_FragColor = vec4(c, 1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  gl_FragColor.rgb = mix(gl_FragColor.rgb, uHaze, fog);
}`;
  // The sky's colours are written as they are to be seen (at the horizon and below it, the haze itself), and made
  // linear before they are shown; the glow of the sunset is a band about the horizon, fading above it and below.
  private static readonly skyShader = `
varying vec3 d;
void main() {
  vec3 n = normalize(d); float y = n.y, west = .5 + .5 * dot(normalize(n.xz + 1e-4), normalize(vec2(-.75, .55)));
  vec3 c = mix(vec3(.110, .125, .160), vec3(.035, .043, .066), smoothstep(.0, .5, y));
  c += vec3(.80, .50, .27) * exp(-abs(y - .005) * 22.) * (.10 + .32 * west * west);
  c += vec3(.95, .74, .30) * exp(-abs(y - .012) * 260.) * .10 * (.4 + .6 * west);
  gl_FragColor = vec4(mix(pow((c + .055) / 1.055, vec3(2.4)), c / 12.92, step(c, vec3(.04045))), 1.);
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
    sun.position.copy(mid).addScaledVector(BoardLook.toSun, Math.hypot(grid.across, grid.down) / 2 + 6);
    sun.target.position.copy(mid);
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.normalBias = 0.02; this.shadow(sun);
    scene.add(sun, sun.target, this.sky(mid));
  }
  // The sun's shadow cast over the whole land and no more, however large the land: as the sun sees it, the room the
  // land takes from below its lowest tiles (even as they rise) to above its tallest towers, half a hex about; its bias
  // kept as deep into the land however deep that room is.
  private shadow(sun: DirectionalLight): void {
    const cam = sun.shadow.camera, room = new Box3(), p = new Vector3();
    cam.position.copy(sun.position); cam.lookAt(sun.target.position); cam.updateMatrixWorld();
    for (const x of [-0.5, this.grid.across + 0.5]) {
      for (const z of [-0.5, this.grid.down + 0.5]) {
        for (const y of [-0.8, 1.6]) { room.expandByPoint(p.set(x, y, z).applyMatrix4(cam.matrixWorldInverse)); }
      }
    }
    Object.assign(cam, { left: room.min.x, right: room.max.x, top: room.max.y, bottom: room.min.y,
      near: Math.max(0.1, -room.max.z - 0.5), far: -room.min.z + 0.5 });
    cam.updateProjectionMatrix(); sun.shadow.bias = -0.03 / (cam.far - cam.near);
  }
  private sky(mid: Vector3): Mesh {
    const m = new ShaderMaterial({ side: BackSide, depthWrite: false, fog: false, fragmentShader: BoardLook.skyShader,
      vertexShader: 'varying vec3 d; void main() { d = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.);'
        + ' gl_Position = p.xyww; }' });
    const dome = new Mesh(new SphereGeometry(140, 32, 16), m);
    dome.position.copy(mid); dome.renderOrder = -1; dome.frustumCulled = false;
    return dome;
  }
  // A bank of mist at a height, of a grain, from a place in the noise; so thick at its thickest, and so much of that
  // laid evenly over all that is not known (the rest in drifts). It lies over the land past the country's edge as
  // well, thinning out only at its own far edge.
  mist([y, scale, seed]: [number, number, number], [opacity, veil]: [number, number]): void {
    const k = this.knowing, room = new Vector2(this.grid.across / 2 + 16, this.grid.down / 2 + 16),
      mid = new Vector2(this.grid.across / 2, this.grid.down / 2);
    const m = new ShaderMaterial({ vertexShader: BoardLook.flat, fragmentShader: BoardLook.mistShader,
      transparent: true, depthWrite: false, uniforms: { uMask: { value: k.texture }, uNoise: { value: this.noise },
        uOrigin: { value: k.origin }, uSize: { value: k.size }, uMid: { value: mid }, uRoom: { value: room },
        uTime: this.time, uScale: { value: scale }, uOpacity: { value: opacity }, uVeil: { value: veil },
        uSeed: { value: seed }, uFog: this.fog, uLow: { value: new Color('#20252f') },
        uHigh: { value: new Color('#5d6473') }, uHaze: { value: BoardLook.shownHaze } } });
    const plane = new Mesh(new PlaneGeometry(room.x * 2, room.y * 2), m);
    plane.rotateX(-Math.PI / 2); plane.position.set(mid.x, y, mid.y);
    plane.renderOrder = 10;
    this.scene.add(plane); this.shaders.push(m);
  }
  water(): ShaderMaterial {
    const m = new ShaderMaterial({ vertexShader: BoardLook.flat, fragmentShader: BoardLook.waterShader,
      uniforms: { uNoise: { value: this.noise }, uTime: this.time, uFog: this.fog,
        uDeep: { value: new Color('#12293d') },
        uSky: { value: new Color('#6c6e72') }, uSun: { value: new Color('#ffc98a') },
        uSunDir: { value: BoardLook.toSun }, uHaze: { value: BoardLook.shownHaze } } });
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
    // Its colours lamplight as painted, amber, not taken for linear and shown paler.
    const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace;
    return t;
  }
}
