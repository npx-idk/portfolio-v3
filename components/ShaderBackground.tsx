"use client";

import { useEffect, useRef } from "react";

const VERT = `
  attribute vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG_FLOWING_NOISE = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_res;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1,0)), f.x),
      mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
      f.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.1 + vec2(100.0); a *= 0.5; }
    return v;
  }
  void main() {
    vec2 uv = gl_FragCoord.xy / u_res;
    float t = u_time * 0.18;
    vec2 q = vec2(fbm(uv + vec2(0.0, t)), fbm(uv + vec2(5.2, t + 1.3)));
    vec2 r = vec2(fbm(uv + 4.0*q + vec2(1.7, t*0.5)), fbm(uv + 4.0*q + vec2(9.2, t*0.5+2.8)));
    float f = fbm(uv + 4.0 * r);
    vec3 col = mix(vec3(0.87, 0.89, 0.98), vec3(0.18, 0.25, 0.87), clamp(f*f*4.0, 0.0, 1.0));
    col = mix(col, vec3(0.36, 0.43, 0.93), clamp(length(q), 0.0, 1.0));
    col = mix(col, vec3(0.94, 0.95, 0.99), clamp(r.x, 0.0, 1.0));
    gl_FragColor = vec4(col, 1.0);
  }
`;

const FRAG_WAVES = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_res;

  void main() {
    vec2 uv = gl_FragCoord.xy / u_res;
    float asp = u_res.x / u_res.y;
    vec2 p = vec2(uv.x * asp, uv.y);
    float t = u_time * 0.5;

    float w = sin(p.x * 6.0 + t) * cos(p.y * 4.0 + t * 0.7) * 0.5 + 0.5;
    w += sin(p.x * 11.0 - t * 1.3) * sin(p.y * 8.0 + t) * 0.22;
    w += sin((p.x + p.y) * 7.0 + t * 0.9) * 0.14;

    float dist = length(uv - 0.5);
    w += sin(dist * 22.0 - t * 3.0) * exp(-dist * 3.5) * 0.25;
    w = clamp(w, 0.0, 1.0);

    vec3 bg   = vec3(0.94, 0.95, 0.99);
    vec3 mid  = vec3(0.47, 0.54, 0.96);
    vec3 deep = vec3(0.18, 0.25, 0.87);
    vec3 color = mix(bg, mix(mid, deep, w * w), w);
    gl_FragColor = vec4(color, 1.0);
  }
`;

const FRAG_BLOBS = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_res;

  float blob(vec2 p, vec2 c, float r) {
    vec2 d = p - c; return r * r / (dot(d,d) + 0.008);
  }
  void main() {
    vec2 uv = gl_FragCoord.xy / u_res;
    float asp = u_res.x / u_res.y;
    vec2 p = vec2(uv.x * asp, uv.y);
    float t = u_time * 0.32;
    float a = asp;

    vec2 b1 = vec2((0.22 + sin(t*0.7)*0.22)*a, 0.28 + cos(t*0.5)*0.22);
    vec2 b2 = vec2((0.78 + cos(t*0.6)*0.18)*a, 0.72 + sin(t*0.8)*0.2);
    vec2 b3 = vec2((0.50 + sin(t*0.85+1.0)*0.28)*a, 0.5 + cos(t*0.42)*0.28);
    vec2 b4 = vec2((0.30 + cos(t*0.55+2.0)*0.22)*a, 0.82 + sin(t*0.65)*0.12);

    float field = blob(p,b1,0.13)+blob(p,b2,0.11)+blob(p,b3,0.10)+blob(p,b4,0.09);

    float outer = smoothstep(0.4, 1.8, field);
    float inner = smoothstep(1.2, 3.5, field);

    vec3 bg    = vec3(0.94, 0.95, 0.99);
    vec3 light = vec3(0.54, 0.60, 0.97);
    vec3 deep  = vec3(0.18, 0.25, 0.87);
    vec3 color = mix(bg, mix(light, deep, inner), outer);
    gl_FragColor = vec4(color, 1.0);
  }
`;

const SHADERS = {
  noise: FRAG_FLOWING_NOISE,
  waves: FRAG_WAVES,
  blobs: FRAG_BLOBS,
} as const;

export type ShaderVariant = keyof typeof SHADERS;

function buildProgram(gl: WebGLRenderingContext, frag: string) {
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  return prog;
}

interface Props {
  variant: ShaderVariant;
  className?: string;
}

export default function ShaderBackground({ variant, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const prog = buildProgram(gl, SHADERS[variant]);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes  = gl.getUniformLocation(prog, "u_res");

    const t0 = performance.now();

    const render = () => {
      const w = canvas.clientWidth  | 0;
      const h = canvas.clientHeight | 0;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform1f(uTime, (performance.now() - t0) / 1000);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(rafRef.current);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
