"use client"

import { cn } from "@/lib/utils"
import { useRef, useEffect, useCallback } from "react"

interface SiriOrbProps {
  size?: string
  className?: string
  colors?: {
    c1?: string
    c2?: string
    c3?: string
  }
  animationDuration?: number
}

// Parse hex color to [r, g, b] normalized 0-1
function hexToGL(hex: string): [number, number, number] {
  const h = hex.replace("#", "")
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ]
}

const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

const FRAGMENT_SHADER = `
  precision highp float;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_speed;
  uniform vec3 u_c1;
  uniform vec3 u_c2;
  uniform vec3 u_c3;

  // Hash for noise
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // Smooth value noise
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // Layered noise for wave detail
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.1;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 p = (uv - 0.5) * 2.0;

    // Sphere geometry
    float dist = length(p);
    float sphereMask = smoothstep(1.0, 0.93, dist);

    if (sphereMask < 0.001) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
      return;
    }

    float t = u_time * u_speed;

    // Sphere interior radius at this x position (circle equation)
    float sphereR = sqrt(max(0.0, 1.0 - p.x * p.x));

    // Water fill level -- base at ~50%, with slow tilt/slosh
    float tiltAngle = sin(t * 0.4) * 0.15 + sin(t * 0.25) * 0.1;
    float baseLevel = -0.05 + sin(t * 0.3) * 0.08;
    float waterLevel = baseLevel + p.x * tiltAngle;

    // Wave surface -- layered waves at different scales
    float wave = 0.0;
    wave += sin(p.x * 6.0 + t * 2.0) * 0.04;
    wave += sin(p.x * 10.0 - t * 2.8 + 1.0) * 0.025;
    wave += sin(p.x * 15.0 + t * 1.5 + 2.5) * 0.015;
    wave += fbm(vec2(p.x * 3.0 + t * 0.8, t * 0.5)) * 0.06 - 0.03;

    float surfaceY = waterLevel + wave;

    // Is this pixel below the water surface?
    float inWater = smoothstep(surfaceY + 0.02, surfaceY - 0.02, p.y);

    // Also clip to sphere interior
    float inSphere = step(abs(p.y), sphereR);
    inWater *= inSphere;

    // ---- Water color and depth ----

    // Depth below surface (for color gradient)
    float depth = max(0.0, surfaceY - p.y);

    // Color gradient: lighter near surface, deeper = richer
    vec3 shallowColor = u_c1 * 0.9 + vec3(0.1);
    vec3 midColor = mix(u_c1, u_c2, 0.5);
    vec3 deepColor = u_c2 * 0.6;

    float depthNorm = clamp(depth / 1.2, 0.0, 1.0);
    vec3 waterColor = mix(shallowColor, midColor, smoothstep(0.0, 0.3, depthNorm));
    waterColor = mix(waterColor, deepColor, smoothstep(0.3, 1.0, depthNorm));

    // Caustic-like light patterns in the water
    float caustic = fbm(vec2(p.x * 5.0 + t * 0.6, p.y * 5.0 + t * 0.4)) * 0.5 + 0.5;
    caustic = pow(caustic, 2.0) * 0.3;
    waterColor += u_c3 * caustic * (1.0 - depthNorm * 0.7);

    // Subtle internal flow/current patterns
    float flow = noise(vec2(p.x * 3.0 + t * 0.5, p.y * 3.0 - t * 0.3));
    waterColor = mix(waterColor, u_c3 * 0.8, flow * 0.15 * (1.0 - depthNorm));

    // Water opacity: more opaque deeper, slightly transparent at surface
    float waterAlpha = mix(0.7, 0.95, smoothstep(0.0, 0.4, depthNorm));

    // Surface highlight -- bright line right at the water surface
    float surfaceDist = abs(p.y - surfaceY);
    float surfaceHighlight = exp(-surfaceDist * 40.0) * 0.6;
    vec3 highlightColor = mix(u_c1, vec3(1.0), 0.4);

    // Meniscus -- water curves up at sphere walls
    float wallDist = abs(dist - 0.92);
    float meniscus = exp(-wallDist * 15.0) * 0.15 * inWater;

    // ---- Glass sphere ----

    // Dark interior (air above water)
    vec3 airColor = vec3(0.015, 0.04, 0.07);

    // Faint reflection of water on the glass above
    float reflectionY = 2.0 * surfaceY - p.y;
    float reflectionStrength = smoothstep(0.5, 0.0, p.y - surfaceY) * 0.08;

    // Glass specular highlights
    float spec1 = pow(max(0.0, 1.0 - length(p - vec2(-0.35, 0.35)) * 2.0), 4.0) * 0.25;
    float spec2 = pow(max(0.0, 1.0 - length(p - vec2(0.2, 0.5)) * 3.0), 5.0) * 0.1;

    // Glass rim / edge highlight
    float rimGlow = pow(smoothstep(0.6, 0.95, dist), 3.0) * 0.12;

    // ---- Compose ----

    vec3 color = airColor;

    // Water reflection in the air region
    vec3 reflColor = mix(u_c1, u_c2, 0.5) * 0.3;
    color = mix(color, reflColor, reflectionStrength * (1.0 - inWater));

    // Water body
    color = mix(color, waterColor, inWater * waterAlpha);

    // Surface highlight
    color += highlightColor * surfaceHighlight * step(0.01, inWater + 0.5);

    // Meniscus glow at walls
    color += u_c1 * meniscus;

    // Glass specular
    color += vec3(1.0) * spec1;
    color += vec3(0.8, 1.0, 0.9) * spec2;

    // Glass rim
    color += mix(u_c1, u_c2, 0.5) * rimGlow;

    // Subtle glass refraction tint
    color += airColor * 0.1 * (1.0 - inWater);

    // Edge darkening
    float vignette = 1.0 - pow(dist, 4.0) * 0.4;
    color *= vignette;

    float alpha = sphereMask;
    gl_FragColor = vec4(color * alpha, alpha);
  }
`

const SiriOrb: React.FC<SiriOrbProps> = ({
  size = "192px",
  className,
  colors,
  animationDuration = 20,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const startTimeRef = useRef<number>(0)

  const defaultColors = {
    c1: "#39FF14",
    c2: "#0DB1B2",
    c3: "#5FFF42",
  }

  const finalColors = { ...defaultColors, ...colors }
  const sizeValue = parseInt(size.replace("px", ""), 10)
  const speed = 20 / animationDuration

  const initGL = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return false

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = sizeValue * dpr
    canvas.height = sizeValue * dpr

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
    })
    if (!gl) return false

    glRef.current = gl

    // Compile shaders
    const vs = gl.createShader(gl.VERTEX_SHADER)!
    gl.shaderSource(vs, VERTEX_SHADER)
    gl.compileShader(vs)

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!
    gl.shaderSource(fs, FRAGMENT_SHADER)
    gl.compileShader(fs)

    const program = gl.createProgram()!
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Shader link failed:", gl.getProgramInfoLog(program))
      return false
    }

    programRef.current = program
    gl.useProgram(program)

    // Full-screen quad
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    )

    const posLoc = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    // Set static uniforms
    const c1 = hexToGL(finalColors.c1)
    const c2 = hexToGL(finalColors.c2)
    const c3 = hexToGL(finalColors.c3)

    gl.uniform2f(
      gl.getUniformLocation(program, "u_resolution"),
      canvas.width,
      canvas.height
    )
    gl.uniform3f(gl.getUniformLocation(program, "u_c1"), c1[0], c1[1], c1[2])
    gl.uniform3f(gl.getUniformLocation(program, "u_c2"), c2[0], c2[1], c2[2])
    gl.uniform3f(gl.getUniformLocation(program, "u_c3"), c3[0], c3[1], c3[2])
    gl.uniform1f(gl.getUniformLocation(program, "u_speed"), speed)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.viewport(0, 0, canvas.width, canvas.height)

    return true
  }, [sizeValue, finalColors.c1, finalColors.c2, finalColors.c3, speed])

  useEffect(() => {
    if (!initGL()) return

    const gl = glRef.current!
    const program = programRef.current!
    const timeLoc = gl.getUniformLocation(program, "u_time")
    startTimeRef.current = performance.now()

    const render = () => {
      const elapsed = (performance.now() - startTimeRef.current) / 1000
      gl.uniform1f(timeLoc, elapsed)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      rafRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  }, [initGL])

  return (
    <div
      className={cn("rounded-full overflow-hidden", className)}
      style={{
        width: size,
        height: size,
        boxShadow:
          "0 0 15px rgba(57, 255, 20, 0.15), 0 0 30px rgba(13, 177, 178, 0.08)",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: size,
          height: size,
          display: "block",
        }}
      />
    </div>
  )
}

export { SiriOrb }
export default SiriOrb
