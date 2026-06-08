"use client";

import { useEffect, useRef } from "react";

// 8×8 Bayer ordered dithering matrix, row-major
const BAYER_8x8 = new Uint8Array([
   0, 32,  8, 40,  2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44,  4, 36, 14, 46,  6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
   3, 35, 11, 43,  1, 33,  9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47,  7, 39, 13, 45,  5, 37,
  63, 31, 55, 23, 61, 29, 53, 21,
].map(v => Math.round((v / 63) * 255)));

const VERT = `
  attribute vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

// Shapes supported: "wave"
const FRAG = `
  precision mediump float;
  uniform float u_time;
  uniform vec2  u_res;
  uniform vec3  u_colorBack;
  uniform vec3  u_colorFront;
  uniform float u_pxSize;
  uniform float u_speed;
  uniform sampler2D u_bayer;

  #define PI 3.14159265359

  float waveField(vec2 uv, float t) {
    float s = u_speed;
    // Primary horizontal wave bands
    float v  = sin(uv.x * PI * 4.0 - t * s + sin(uv.y * PI * 2.0) * 0.8) * 0.50;
    // Second harmonic: diagonal interference
    v += sin(uv.x * PI * 7.0 + uv.y * PI * 3.0 - t * s * 0.65) * 0.28;
    // Third: vertical undulation
    v += sin(uv.y * PI * 6.0 + t * s * 0.45) * 0.14;
    // Bias + normalize to [0,1]
    return clamp(v * 0.85 + 0.50, 0.0, 1.0);
  }

  float getBayer(vec2 blockCoord) {
    // Tile the 8x8 matrix over block coordinates
    vec2 uv = (mod(blockCoord, 8.0) + 0.5) / 8.0;
    return texture2D(u_bayer, uv).r;
  }

  void main() {
    // Snap to pixel blocks
    vec2 blockCoord = floor(gl_FragCoord.xy / u_pxSize);
    vec2 pixelCenter = (blockCoord + 0.5) * u_pxSize;
    vec2 uv = pixelCenter / u_res;
    uv.y = 1.0 - uv.y;

    float field     = waveField(uv, u_time);
    float threshold = getBayer(blockCoord);

    vec3 color = field > threshold ? u_colorFront : u_colorBack;
    gl_FragColor = vec4(color, 1.0);
  }
`;

function cssColorToRgb(color: string): [number, number, number] {
  const div = document.createElement("div");
  div.style.color = color;
  document.body.appendChild(div);
  const computed = getComputedStyle(div).color;
  document.body.removeChild(div);
  const m = computed.match(/[\d.]+/g);
  if (!m) return [0, 0, 0];
  return [parseInt(m[0]) / 255, parseInt(m[1]) / 255, parseInt(m[2]) / 255];
}

function buildProgram(gl: WebGLRenderingContext) {
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  return prog;
}

export interface DitheringShaderProps {
  shape?: "wave";
  colorBack?: string;
  colorFront?: string;
  pxSize?: number;
  speed?: number;
  className?: string;
}

export function DitheringShader({
  colorBack = "var(--background)",
  colorFront = "var(--brand-primary)",
  pxSize = 3,
  speed = 0.6,
  className,
}: DitheringShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const prog = buildProgram(gl);
    gl.useProgram(prog);

    // Full-screen quad
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Upload 8×8 Bayer texture
    const bayerTex = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, bayerTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 8, 8, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, BAYER_8x8);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    // Uniforms
    const uTime     = gl.getUniformLocation(prog, "u_time");
    const uRes      = gl.getUniformLocation(prog, "u_res");
    const uBack     = gl.getUniformLocation(prog, "u_colorBack");
    const uFront    = gl.getUniformLocation(prog, "u_colorFront");
    const uPxSize   = gl.getUniformLocation(prog, "u_pxSize");
    const uSpeed    = gl.getUniformLocation(prog, "u_speed");
    const uBayer    = gl.getUniformLocation(prog, "u_bayer");

    gl.uniform1i(uBayer, 0);
    gl.uniform1f(uPxSize, pxSize);
    gl.uniform1f(uSpeed, speed);

    const [br, bg, bb] = cssColorToRgb(colorBack);
    const [fr, fg, fb] = cssColorToRgb(colorFront);
    gl.uniform3f(uBack,  br, bg, bb);
    gl.uniform3f(uFront, fr, fg, fb);

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
      gl.deleteTexture(bayerTex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, [colorBack, colorFront, pxSize, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
