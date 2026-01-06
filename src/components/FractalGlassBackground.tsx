"use client";

import { useEffect, useRef } from "react";

export interface FractalGlassProps {
  /** Scale of the gradient flow (lower = larger waves) */
  noiseScale?: number;
  /** How much vertical displacement the ridges create */
  displacementStrength?: number;
  /** Number of vertical ridges */
  lineFrequency?: number;
  /** Ridge waviness (0 = straight, 1 = wavy) */
  ridgeWaviness?: number;
  /** Flow animation speed */
  animationSpeed?: number;
  /** Film grain intensity */
  grainIntensity?: number;
  /** Contrast boost for deep darks */
  contrastBoost?: number;
  /** Gradient colors array (dark to bright) */
  gradientColors?: string[];
}

// Vertex shader
const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

// Fragment shader - CORRECTED: Ridge displacement applied BEFORE color sampling
const fragmentShaderSource = `
  precision highp float;
  
  varying vec2 v_texCoord;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_noiseScale;
  uniform float u_displacementStrength;
  uniform float u_lineFrequency;
  uniform float u_ridgeWaviness;
  uniform float u_animationSpeed;
  uniform float u_grainIntensity;
  uniform float u_contrastBoost;
  uniform vec3 u_colorDark;
  uniform vec3 u_colorMid;
  uniform vec3 u_colorBright;
  uniform vec3 u_colorAccent;
  
  //
  // GLSL Simplex Noise by Ian McEwan, Ashima Arts
  //
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
  
  // ============================================
  // STEP 1: Smooth flowing gradient field
  // This is what gets viewed THROUGH the glass
  // ============================================
  float getGradientField(vec2 uv, float time) {
    float t = time * u_animationSpeed;
    
    // Create flowing aurora-like bands using diagonal movement
    // Much larger scale, smoother than the blobby noise
    float flow = snoise(vec2(uv.x * 0.8, uv.y * 2.5) * u_noiseScale + vec2(t * 0.15, t * 0.3));
    
    // Add secondary wave for organic feel - travels diagonally
    flow += 0.6 * snoise(vec2(uv.x * 1.2, uv.y * 1.8) * u_noiseScale + vec2(-t * 0.2, t * 0.15));
    
    // Third layer for subtle variation
    flow += 0.3 * snoise(vec2(uv.x * 2.0, uv.y * 0.8) * u_noiseScale + vec2(t * 0.1, -t * 0.2));
    
    // Normalize to 0-1
    flow = flow * 0.35 + 0.5;
    
    // S-curve for smooth transitions between light and dark
    flow = smoothstep(0.0, 1.0, flow);
    
    // Apply contrast
    flow = pow(flow, u_contrastBoost);
    
    return clamp(flow, 0.0, 1.0);
  }
  
  // ============================================
  // STEP 2: Vertical ridge pattern
  // Returns displacement amount for Y coordinate
  // ============================================
  float getRidgeDisplacement(vec2 uv, float time) {
    float t = time * u_animationSpeed * 0.5;
    
    // Base x position for the ridge
    float ridgeX = uv.x * u_lineFrequency;
    
    // Add waviness - ridges undulate slightly
    float wave = snoise(vec2(uv.x * 3.0, uv.y * 8.0 + t)) * u_ridgeWaviness * 0.3;
    ridgeX += wave;
    
    // Create the ridge pattern using sine
    float ridge = sin(ridgeX * 6.28318);
    
    // Shape the ridge - peaks and valleys
    // This creates the actual displacement amount
    float displacement = ridge;
    
    // Add variation along Y - ridges aren't perfectly uniform
    float yVariation = snoise(vec2(uv.x * 5.0, uv.y * 2.0 + t * 0.3)) * 0.3;
    displacement *= (1.0 + yVariation);
    
    return displacement;
  }
  
  // ============================================
  // STEP 3: Color ramp
  // ============================================
  vec3 colorRamp(float n) {
    vec3 color;
    
    if (n < 0.33) {
      color = mix(u_colorDark, u_colorMid, n / 0.33);
    } else if (n < 0.66) {
      color = mix(u_colorMid, u_colorBright, (n - 0.33) / 0.33);
    } else {
      color = mix(u_colorBright, u_colorAccent, (n - 0.66) / 0.34);
    }
    
    return color;
  }
  
  // Film grain
  float random(vec2 st, float seed) {
    return fract(sin(dot(st + seed, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  void main() {
    vec2 uv = v_texCoord;
    float time = u_time;
    float aspect = u_resolution.x / u_resolution.y;
    
    // ============================================
    // THE KEY FIX: Displace UV BEFORE color sampling
    // ============================================
    
    // Get the ridge displacement for this position
    float ridgeOffset = getRidgeDisplacement(uv, time);
    
    // DISPLACE THE Y COORDINATE based on ridge pattern
    // This creates the vertical "stretching through glass" effect
    vec2 displacedUV = uv;
    displacedUV.y += ridgeOffset * u_displacementStrength;
    
    // Aspect-correct for gradient field sampling
    vec2 gradientUV = vec2(displacedUV.x * aspect, displacedUV.y);
    
    // Sample the gradient field at the DISPLACED position
    float gradientValue = getGradientField(gradientUV, time);
    
    // Get color from the gradient
    vec3 color = colorRamp(gradientValue);
    
    // ============================================
    // Add subtle ridge shading for depth
    // ============================================
    
    // Ridge peaks are slightly brighter, valleys slightly darker
    float ridgeShading = ridgeOffset * 0.5 + 0.5; // 0-1 range
    float shadeFactor = mix(0.85, 1.1, ridgeShading);
    color *= shadeFactor;
    
    // Add subtle specular on ridge peaks
    float specular = pow(max(ridgeShading, 0.0), 4.0) * 0.08;
    color += vec3(specular);
    
    // Film grain
    float grain = (random(uv * u_resolution, time * 10.0) - 0.5) * u_grainIntensity;
    color += vec3(grain);
    
    // Clamp output
    color = clamp(color, 0.0, 1.0);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return [
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255,
    ];
  }
  return [1, 0, 1];
}

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

export function FractalGlassBackground({
  noiseScale = 1.0,
  displacementStrength = 0.15,
  lineFrequency = 80,
  ridgeWaviness = 0.5,
  animationSpeed = 0.1,
  grainIntensity = 0.04,
  contrastBoost = 1.2,
  gradientColors = ["#0a0515", "#581c87", "#ec4899", "#06b6d4"],
}: FractalGlassProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { antialias: true });
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    if (!vertexShader || !fragmentShader) return;

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;

    gl.useProgram(program);

    // Set up geometry
    const positions = new Float32Array([
      -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
    ]);
    const texCoords = new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const uniforms = {
      time: gl.getUniformLocation(program, "u_time"),
      resolution: gl.getUniformLocation(program, "u_resolution"),
      noiseScale: gl.getUniformLocation(program, "u_noiseScale"),
      displacementStrength: gl.getUniformLocation(program, "u_displacementStrength"),
      lineFrequency: gl.getUniformLocation(program, "u_lineFrequency"),
      ridgeWaviness: gl.getUniformLocation(program, "u_ridgeWaviness"),
      animationSpeed: gl.getUniformLocation(program, "u_animationSpeed"),
      grainIntensity: gl.getUniformLocation(program, "u_grainIntensity"),
      contrastBoost: gl.getUniformLocation(program, "u_contrastBoost"),
      colorDark: gl.getUniformLocation(program, "u_colorDark"),
      colorMid: gl.getUniformLocation(program, "u_colorMid"),
      colorBright: gl.getUniformLocation(program, "u_colorBright"),
      colorAccent: gl.getUniformLocation(program, "u_colorAccent"),
    };

    // Parse colors
    const colorDark = hexToRgb(gradientColors[0] || "#0a0515");
    const colorMid = hexToRgb(gradientColors[1] || "#581c87");
    const colorBright = hexToRgb(gradientColors[2] || "#ec4899");
    const colorAccent = hexToRgb(gradientColors[3] || "#06b6d4");

    // Set static uniforms
    gl.uniform1f(uniforms.noiseScale, noiseScale);
    gl.uniform1f(uniforms.displacementStrength, displacementStrength);
    gl.uniform1f(uniforms.lineFrequency, lineFrequency);
    gl.uniform1f(uniforms.ridgeWaviness, ridgeWaviness);
    gl.uniform1f(uniforms.animationSpeed, animationSpeed);
    gl.uniform1f(uniforms.grainIntensity, grainIntensity);
    gl.uniform1f(uniforms.contrastBoost, contrastBoost);
    gl.uniform3fv(uniforms.colorDark, colorDark);
    gl.uniform3fv(uniforms.colorMid, colorMid);
    gl.uniform3fv(uniforms.colorBright, colorBright);
    gl.uniform3fv(uniforms.colorAccent, colorAccent);

    // Handle resize
    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Animation loop
    const startTime = performance.now();
    const render = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      gl.uniform1f(uniforms.time, elapsed);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationRef.current);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [
    noiseScale,
    displacementStrength,
    lineFrequency,
    ridgeWaviness,
    animationSpeed,
    grainIntensity,
    contrastBoost,
    gradientColors,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
      style={{ background: "#0a0515" }}
    />
  );
}

export default FractalGlassBackground;