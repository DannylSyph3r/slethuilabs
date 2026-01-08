"use client";

import { useState, useRef, useCallback } from "react";
import * as Slider from "@radix-ui/react-slider";
import { Settings, X, SlidersHorizontal, Download } from "lucide-react";

export interface GlassSettings {
  noiseScale: number;
  displacementStrength: number;
  lineFrequency: number;
  ridgeWaviness: number;
  animationSpeed: number;
  grainIntensity: number;
  contrastBoost: number;
  waveComplexity: number;
  flowIntensity: number;
  colorDark: string;
  colorMid: string;
  colorBright: string;
  colorAccent: string;
}

interface ColorPreset {
  name: string;
  colorDark: string;
  colorMid: string;
  colorBright: string;
  colorAccent: string;
}

const colorPresets: ColorPreset[] = [
  {
    name: "Neon",
    colorDark: "#0a0515",
    colorMid: "#581c87",
    colorBright: "#ec4899",
    colorAccent: "#06b6d4",
  },
  {
    name: "Flame",
    colorDark: "#0c0a09",
    colorMid: "#7c2d12",
    colorBright: "#f97316",
    colorAccent: "#fbbf24",
  },
  {
    name: "Ocean",
    colorDark: "#020617",
    colorMid: "#1e3a8a",
    colorBright: "#3b82f6",
    colorAccent: "#67e8f9",
  },
  {
    name: "Gold",
    colorDark: "#0f0c06",
    colorMid: "#78350f",
    colorBright: "#f59e0b",
    colorAccent: "#fef3c7",
  },
  {
    name: "Aurora",
    colorDark: "#022c22",
    colorMid: "#065f46",
    colorBright: "#10b981",
    colorAccent: "#a78bfa",
  },
  {
    name: "Violet",
    colorDark: "#1a0a1a",
    colorMid: "#86198f",
    colorBright: "#d946ef",
    colorAccent: "#f0abfc",
  },
  {
    name: "Sunset",
    colorDark: "#1a0a0f",
    colorMid: "#9d174d",
    colorBright: "#fb7185",
    colorAccent: "#fcd34d",
  },
  {
    name: "Forest",
    colorDark: "#0a1a0f",
    colorMid: "#166534",
    colorBright: "#22c55e",
    colorAccent: "#86efac",
  },
  {
    name: "Midnight",
    colorDark: "#030712",
    colorMid: "#1e1b4b",
    colorBright: "#6366f1",
    colorAccent: "#c4b5fd",
  },
  {
    name: "Glacier",
    colorDark: "#0c1929",
    colorMid: "#155e75",
    colorBright: "#22d3ee",
    colorAccent: "#ecfeff",
  },
  {
    name: "Rose",
    colorDark: "#1a0a10",
    colorMid: "#881337",
    colorBright: "#f43f5e",
    colorAccent: "#fda4af",
  },
  {
    name: "Ember",
    colorDark: "#1c0a05",
    colorMid: "#9a3412",
    colorBright: "#ea580c",
    colorAccent: "#fed7aa",
  },
];

interface SettingsPanelProps {
  settings: GlassSettings;
  onSettingsChange: (settings: Partial<GlassSettings>) => void;
}

function MinimalSlider({
  value,
  min,
  max,
  step,
  onChange,
  accent = "white",
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  accent?: string;
}) {
  return (
    <Slider.Root
      className="relative flex items-center select-none touch-none h-6 group"
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={([v]) => onChange(v)}
    >
      <Slider.Track className="relative h-[3px] grow rounded-full bg-white/[0.08]">
        <Slider.Range
          className="absolute h-full rounded-full"
          style={{
            background:
              accent === "white"
                ? "linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.6))"
                : `linear-gradient(90deg, ${accent}66, ${accent})`,
          }}
        />
      </Slider.Track>
      <Slider.Thumb
        className="block w-3 h-3 rounded-full bg-white shadow-lg shadow-black/30
                   ring-2 ring-white/20 hover:ring-white/40 focus:ring-white/40
                   focus:outline-none transition-transform hover:scale-110 focus:scale-110"
      />
    </Slider.Root>
  );
}

function ControlRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatValue,
  accent,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatValue?: (v: number) => string;
  accent?: string;
}) {
  const displayValue = formatValue ? formatValue(value) : value.toFixed(2);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[11px] text-white/50 font-medium tracking-wide">
          {label}
        </span>
        <span className="text-[10px] text-white/30 font-mono tabular-nums">
          {displayValue}
        </span>
      </div>
      <MinimalSlider
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        accent={accent}
      />
    </div>
  );
}

export function SettingsPanel({
  settings,
  onSettingsChange,
}: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "flow" | "glass" | "color"
  >("flow");
  const panelRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 200);
  }, []);

  const handlePresetClick = (preset: ColorPreset) => {
    onSettingsChange({
      colorDark: preset.colorDark,
      colorMid: preset.colorMid,
      colorBright: preset.colorBright,
      colorAccent: preset.colorAccent,
    });
  };

  const handleExportWallpaper = useCallback(() => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fractal Glass Wallpaper</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; }
    canvas { display: block; width: 100%; height: 100%; }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <script>
    const CONFIG = {
      noiseScale: ${settings.noiseScale},
      displacementStrength: ${settings.displacementStrength},
      lineFrequency: ${settings.lineFrequency},
      ridgeWaviness: ${settings.ridgeWaviness},
      animationSpeed: ${settings.animationSpeed},
      grainIntensity: ${settings.grainIntensity},
      contrastBoost: ${settings.contrastBoost},
      waveComplexity: ${settings.waveComplexity},
      flowIntensity: ${settings.flowIntensity},
      colorDark: "${settings.colorDark}",
      colorMid: "${settings.colorMid}",
      colorBright: "${settings.colorBright}",
      colorAccent: "${settings.colorAccent}",
    };

    function hexToRgb(hex) {
      const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
      return result ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
      ] : [1, 0, 1];
    }

    const vertexShaderSource = \`
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    \`;

    const fragmentShaderSource = \`
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
      uniform float u_waveComplexity;
      uniform float u_flowIntensity;
      uniform vec3 u_colorDark;
      uniform vec3 u_colorMid;
      uniform vec3 u_colorBright;
      uniform vec3 u_colorAccent;

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i = floor(v + dot(v, C.yy));
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

      float fbm(vec2 p, float t) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        for (int i = 0; i < 3; i++) {
          value += amplitude * snoise(p * frequency + t);
          amplitude *= 0.5;
          frequency *= 2.0;
        }
        return value;
      }

      float getGradientField(vec2 uv, float time) {
        float t = time * u_animationSpeed;
        vec2 p = uv * u_noiseScale;
        vec2 center = vec2(0.5, 0.5);
        vec2 toCenter = uv - center;
        float dist = length(toCenter);
        float angle = atan(toCenter.y, toCenter.x);
        float swirlSpeed = sin(t * 0.15) * 0.5 + 0.5;
        float swirlAngle = angle + dist * 2.0 * swirlSpeed * sin(t * 0.2);
        vec2 swirlOffset = vec2(cos(swirlAngle), sin(swirlAngle)) * dist * 0.3 * u_flowIntensity;
        float warpAngle = t * 0.1;
        vec2 warpDir1 = vec2(cos(warpAngle), sin(warpAngle));
        vec2 warpDir2 = vec2(cos(warpAngle + 2.094), sin(warpAngle + 2.094));
        vec2 warp = vec2(fbm(p * 0.8 + warpDir1 * t * 0.2, t * 0.2), fbm(p * 0.8 + warpDir2 * t * 0.15, t * 0.15));
        p += warp * u_flowIntensity * 0.35;
        p += swirlOffset * 0.2;
        float speedPulse1 = sin(t * 0.08) * 0.4 + 1.0;
        float speedPulse2 = sin(t * 0.12 + 1.5) * 0.3 + 1.0;
        float waves = 0.0;
        float angle1 = 0.7 + sin(t * 0.05) * 0.3;
        vec2 dir1 = vec2(cos(angle1), sin(angle1));
        float wave1 = sin(dot(p, dir1) * 3.0 * u_waveComplexity + t * 1.2 * speedPulse1 + fbm(p * 2.0, t) * 2.0);
        waves += wave1 * 0.35;
        float angle2 = 2.4 - sin(t * 0.07) * 0.4;
        vec2 dir2 = vec2(cos(angle2), sin(angle2));
        float wave2 = sin(dot(p, dir2) * 2.5 * u_waveComplexity - t * 1.0 * speedPulse2 + fbm(p * 1.5 + 10.0, t) * 1.5);
        waves += wave2 * 0.3;
        float verticalShift = sin(t * 0.09) * 0.5;
        float wave3 = sin((p.y + p.x * 0.3 * verticalShift) * 2.8 * u_waveComplexity + t * 0.8);
        waves += wave3 * 0.2;
        vec2 waveCenter = vec2(0.5 + sin(t * 0.1) * 0.3, 0.5 + cos(t * 0.08) * 0.3);
        float radialDist = length(p / u_noiseScale - waveCenter);
        float wave4 = sin(radialDist * 4.0 * u_waveComplexity - t * 0.5);
        waves += wave4 * 0.15;
        float field = waves * 0.45 + 0.5;
        float variation = fbm(p * 3.0 + vec2(t * 0.15, -t * 0.12), t * 0.3) * 0.1;
        field += variation;
        float pulse = sin(t * 0.18) * 0.04 + sin(t * 0.07) * 0.03;
        field += pulse;
        float localVar = snoise(uv * 2.0 + vec2(sin(t * 0.1), cos(t * 0.12)) * 0.5);
        field += localVar * 0.06;
        field = field * 0.7 + 0.3;
        field = clamp(field, 0.0, 1.0);
        field = smoothstep(0.0, 1.0, field);
        field = pow(field, u_contrastBoost);
        return field;
      }

      float getRidgeDisplacement(vec2 uv, float time) {
        float t = time * u_animationSpeed * 0.5;
        float ridgeX = uv.x * u_lineFrequency;
        float wave = snoise(vec2(uv.x * 3.0, uv.y * 8.0 + t)) * u_ridgeWaviness * 0.3;
        ridgeX += wave;
        float ridge = sin(ridgeX * 6.28318);
        float displacement = ridge;
        float yVariation = snoise(vec2(uv.x * 5.0, uv.y * 2.0 + t * 0.3)) * 0.3;
        displacement *= (1.0 + yVariation);
        return displacement;
      }

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

      float random(vec2 st, float seed) {
        return fract(sin(dot(st + seed, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        vec2 uv = v_texCoord;
        float time = u_time;
        float aspect = u_resolution.x / u_resolution.y;
        float ridgeOffset = getRidgeDisplacement(uv, time);
        vec2 displacedUV = uv;
        displacedUV.y += ridgeOffset * u_displacementStrength;
        vec2 gradientUV = vec2(displacedUV.x * aspect, displacedUV.y);
        float gradientValue = getGradientField(gradientUV, time);
        vec3 color = colorRamp(gradientValue);
        float ridgeShading = ridgeOffset * 0.5 + 0.5;
        float shadeFactor = mix(0.85, 1.1, ridgeShading);
        color *= shadeFactor;
        float specular = pow(max(ridgeShading, 0.0), 4.0) * 0.08;
        color += vec3(specular);
        float grain = (random(uv * u_resolution, time * 10.0) - 0.5) * u_grainIntensity;
        color += vec3(grain);
        color = clamp(color, 0.0, 1.0);
        gl_FragColor = vec4(color, 1.0);
      }
    \`;

    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    function createProgram(gl, vs, fs) {
      const program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program error:', gl.getProgramInfoLog(program));
        return null;
      }
      return program;
    }

    const canvas = document.getElementById('canvas');
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vs, fs);
    gl.useProgram(program);

    const positions = new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]);
    const texCoords = new Float32Array([0,0, 1,0, 0,1, 0,1, 1,0, 1,1]);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const texBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
    const texLoc = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(texLoc);
    gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      time: gl.getUniformLocation(program, 'u_time'),
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      noiseScale: gl.getUniformLocation(program, 'u_noiseScale'),
      displacementStrength: gl.getUniformLocation(program, 'u_displacementStrength'),
      lineFrequency: gl.getUniformLocation(program, 'u_lineFrequency'),
      ridgeWaviness: gl.getUniformLocation(program, 'u_ridgeWaviness'),
      animationSpeed: gl.getUniformLocation(program, 'u_animationSpeed'),
      grainIntensity: gl.getUniformLocation(program, 'u_grainIntensity'),
      contrastBoost: gl.getUniformLocation(program, 'u_contrastBoost'),
      waveComplexity: gl.getUniformLocation(program, 'u_waveComplexity'),
      flowIntensity: gl.getUniformLocation(program, 'u_flowIntensity'),
      colorDark: gl.getUniformLocation(program, 'u_colorDark'),
      colorMid: gl.getUniformLocation(program, 'u_colorMid'),
      colorBright: gl.getUniformLocation(program, 'u_colorBright'),
      colorAccent: gl.getUniformLocation(program, 'u_colorAccent'),
    };

    gl.uniform1f(uniforms.noiseScale, CONFIG.noiseScale);
    gl.uniform1f(uniforms.displacementStrength, CONFIG.displacementStrength);
    gl.uniform1f(uniforms.lineFrequency, CONFIG.lineFrequency);
    gl.uniform1f(uniforms.ridgeWaviness, CONFIG.ridgeWaviness);
    gl.uniform1f(uniforms.animationSpeed, CONFIG.animationSpeed);
    gl.uniform1f(uniforms.grainIntensity, CONFIG.grainIntensity);
    gl.uniform1f(uniforms.contrastBoost, CONFIG.contrastBoost);
    gl.uniform1f(uniforms.waveComplexity, CONFIG.waveComplexity);
    gl.uniform1f(uniforms.flowIntensity, CONFIG.flowIntensity);
    gl.uniform3fv(uniforms.colorDark, hexToRgb(CONFIG.colorDark));
    gl.uniform3fv(uniforms.colorMid, hexToRgb(CONFIG.colorMid));
    gl.uniform3fv(uniforms.colorBright, hexToRgb(CONFIG.colorBright));
    gl.uniform3fv(uniforms.colorAccent, hexToRgb(CONFIG.colorAccent));

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener('resize', resize);

    const startTime = performance.now();
    function render() {
      const elapsed = (performance.now() - startTime) / 1000;
      gl.uniform1f(uniforms.time, elapsed);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(render);
    }
    render();
  <\/script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fractal-glass-wallpaper.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [settings]);

  return (
    <>
      {isOpen && (
        <div
          className={`fixed inset-0 z-40 transition-opacity duration-200 ${
            isClosing ? "opacity-0" : "opacity-100"
          }`}
          onClick={handleClose}
        />
      )}

      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 ease-out shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_30px_rgba(255,255,255,0.1)]"
          >
            <Settings className="h-5 w-5 text-white/80 mx-auto group-hover:text-white transition-all duration-300 group-hover:rotate-45" />
          </button>
        )}

        {isOpen && (
          <div
            ref={panelRef}
            className={`w-72 rounded-2xl overflow-hidden bg-black/40 backdrop-blur-2xl border border-white/[0.06] shadow-[0_24px_80px_rgba(0,0,0,0.5)] transition-all duration-200 origin-bottom-right ${
              isClosing
                ? "opacity-0 scale-95 translate-y-2"
                : "opacity-100 scale-100 translate-y-0 animate-in fade-in slide-in-from-bottom-4 duration-300"
            }`}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-3.5 w-3.5 text-white/40" />
                <span className="text-xs font-medium text-white/70 tracking-wide">
                  Settings
                </span>
              </div>
              <button
                onClick={handleClose}
                className="h-6 w-6 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-colors duration-200"
              >
                <X className="h-3.5 w-3.5 text-white/40" />
              </button>
            </div>

            <div className="flex gap-1 p-2 border-b border-white/[0.04]">
              {(["flow", "glass", "color"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveSection(tab)}
                  className={`flex-1 px-3 py-1.5 text-[10px] font-medium uppercase tracking-widest rounded-lg transition-all duration-200 ${
                    activeSection === tab
                      ? "bg-white/[0.08] text-white/80"
                      : "text-white/30 hover:text-white/50 hover:bg-white/[0.03]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              {activeSection === "flow" && (
                <div className="space-y-5">
                  <ControlRow
                    label="Wave Complexity"
                    value={settings.waveComplexity}
                    min={0.3}
                    max={2.0}
                    step={0.1}
                    onChange={(v) => onSettingsChange({ waveComplexity: v })}
                  />
                  <ControlRow
                    label="Flow Warp"
                    value={settings.flowIntensity}
                    min={0}
                    max={2.0}
                    step={0.1}
                    onChange={(v) => onSettingsChange({ flowIntensity: v })}
                  />
                  <ControlRow
                    label="Pattern Scale"
                    value={settings.noiseScale}
                    min={0.3}
                    max={2.0}
                    step={0.1}
                    onChange={(v) => onSettingsChange({ noiseScale: v })}
                  />
                  <ControlRow
                    label="Flow Speed"
                    value={settings.animationSpeed}
                    min={0.02}
                    max={0.3}
                    step={0.02}
                    onChange={(v) => onSettingsChange({ animationSpeed: v })}
                  />
                  <ControlRow
                    label="Dark Valleys"
                    value={settings.contrastBoost}
                    min={0.5}
                    max={1.5}
                    step={0.05}
                    onChange={(v) => onSettingsChange({ contrastBoost: v })}
                  />
                </div>
              )}

              {activeSection === "glass" && (
                <div className="space-y-5">
                  <ControlRow
                    label="Ridge Depth"
                    value={settings.displacementStrength}
                    min={0.02}
                    max={0.4}
                    step={0.01}
                    onChange={(v) =>
                      onSettingsChange({ displacementStrength: v })
                    }
                  />
                  <ControlRow
                    label="Ridge Count"
                    value={settings.lineFrequency}
                    min={20}
                    max={200}
                    step={5}
                    onChange={(v) => onSettingsChange({ lineFrequency: v })}
                    formatValue={(v) => v.toFixed(0)}
                  />
                  <ControlRow
                    label="Ridge Waviness"
                    value={settings.ridgeWaviness}
                    min={0}
                    max={1.5}
                    step={0.05}
                    onChange={(v) => onSettingsChange({ ridgeWaviness: v })}
                  />
                  <ControlRow
                    label="Film Grain"
                    value={settings.grainIntensity}
                    min={0}
                    max={0.12}
                    step={0.005}
                    onChange={(v) => onSettingsChange({ grainIntensity: v })}
                    formatValue={(v) => v.toFixed(3)}
                  />
                </div>
              )}

              {activeSection === "color" && (
                <div className="space-y-5">
                  <div
                    className="h-8 rounded-xl overflow-hidden ring-1 ring-white/[0.06]"
                    style={{
                      background: `linear-gradient(90deg, ${settings.colorDark}, ${settings.colorMid}, ${settings.colorBright}, ${settings.colorAccent})`,
                    }}
                  />

                  <div className="grid grid-cols-4 gap-3">
                    {[
                      {
                        key: "colorDark",
                        label: "Dark",
                        value: settings.colorDark,
                      },
                      {
                        key: "colorMid",
                        label: "Mid",
                        value: settings.colorMid,
                      },
                      {
                        key: "colorBright",
                        label: "Bright",
                        value: settings.colorBright,
                      },
                      {
                        key: "colorAccent",
                        label: "Accent",
                        value: settings.colorAccent,
                      },
                    ].map(({ key, label, value }) => (
                      <div key={key} className="space-y-1.5">
                        <span className="text-[9px] text-white/30 uppercase tracking-wider block text-center">
                          {label}
                        </span>
                        <label className="relative block aspect-square rounded-xl cursor-pointer ring-1 ring-white/[0.08] hover:ring-white/[0.15] transition-all duration-200 hover:scale-105 overflow-hidden">
                          <div
                            className="absolute inset-0"
                            style={{ background: value }}
                          />
                          <input
                            type="color"
                            value={value}
                            onChange={(e) =>
                              onSettingsChange({ [key]: e.target.value })
                            }
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <span className="text-[9px] text-white/30 uppercase tracking-wider block mb-3">
                      Presets
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {colorPresets.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => handlePresetClick(preset)}
                          className="group flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/[0.04] transition-all duration-200"
                        >
                          <div
                            className="w-8 h-8 rounded-full ring-1 ring-white/[0.1] group-hover:ring-white/[0.25] group-hover:scale-110 transition-all duration-200 shadow-lg"
                            style={{
                              background: `conic-gradient(from 0deg, ${preset.colorDark}, ${preset.colorMid}, ${preset.colorBright}, ${preset.colorAccent}, ${preset.colorDark})`,
                            }}
                          />
                          <span className="text-[8px] font-medium text-white/50 group-hover:text-white/80 transition-colors truncate w-full text-center">
                            {preset.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-white/[0.04]">
              <button
                onClick={handleExportWallpaper}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.15] transition-all duration-200 group"
              >
                <Download className="h-4 w-4 text-white/50 group-hover:text-white/80 transition-colors" />
                <span className="text-xs font-medium text-white/50 group-hover:text-white/80 transition-colors">
                  Export as Wallpaper
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
