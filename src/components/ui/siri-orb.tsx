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

  // Smooth metaball field function
  float metaball(vec2 p, vec2 center, float radius) {
    float d = length(p - center);
    return radius * radius / (d * d + 0.001);
  }

  // Simplex-like noise for organic movement
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

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

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 p = (uv - 0.5) * 2.0;

    // Circular mask -- sphere shape
    float dist = length(p);
    float sphereMask = smoothstep(1.0, 0.92, dist);

    if (sphereMask < 0.001) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
      return;
    }

    float t = u_time * u_speed;

    // 5 metaball blobs orbiting with organic paths
    vec2 b1 = vec2(
      sin(t * 0.7 + 0.0) * 0.35 + cos(t * 0.3) * 0.15,
      cos(t * 0.5 + 1.0) * 0.3 + sin(t * 0.4) * 0.1
    );
    vec2 b2 = vec2(
      cos(t * 0.6 + 2.0) * 0.3 + sin(t * 0.35) * 0.2,
      sin(t * 0.8 + 0.5) * 0.35 + cos(t * 0.25) * 0.1
    );
    vec2 b3 = vec2(
      sin(t * 0.5 + 4.0) * 0.4 + cos(t * 0.45) * 0.1,
      cos(t * 0.7 + 3.0) * 0.25 + sin(t * 0.55) * 0.15
    );
    vec2 b4 = vec2(
      cos(t * 0.9 + 1.5) * 0.25 + sin(t * 0.2) * 0.15,
      sin(t * 0.4 + 2.5) * 0.4 + cos(t * 0.6) * 0.1
    );
    vec2 b5 = vec2(
      sin(t * 0.35 + 5.0) * 0.3,
      cos(t * 0.55 + 4.0) * 0.3
    );

    // Metaball field -- accumulate influence
    float field = 0.0;
    field += metaball(p, b1, 0.32);
    field += metaball(p, b2, 0.28);
    field += metaball(p, b3, 0.25);
    field += metaball(p, b4, 0.22);
    field += metaball(p, b5, 0.20);

    // Threshold the field to get fluid-like shapes
    float fluid = smoothstep(1.2, 2.8, field);

    // Color mixing based on blob proximity
    float w1 = metaball(p, b1, 0.32) + metaball(p, b4, 0.22);
    float w2 = metaball(p, b2, 0.28) + metaball(p, b5, 0.20);
    float w3 = metaball(p, b3, 0.25);
    float totalW = w1 + w2 + w3 + 0.001;

    vec3 fluidColor = (u_c1 * w1 + u_c2 * w2 + u_c3 * w3) / totalW;

    // Add subtle noise texture for liquid realism
    float n = noise(p * 4.0 + t * 0.5) * 0.15;
    fluidColor += n * 0.1;

    // Fluid with glow falloff at edges
    float fluidGlow = smoothstep(0.8, 3.5, field) * 0.4;

    // Dark background of the sphere interior
    vec3 bgColor = vec3(0.02, 0.06, 0.1);

    // Combine: background + fluid glow + sharp fluid
    vec3 color = bgColor;
    color = mix(color, fluidColor * 0.3, fluidGlow);
    color = mix(color, fluidColor * 1.1, fluid);

    // Glass specular highlight
    float spec = pow(max(0.0, 1.0 - length(p - vec2(-0.3, -0.3)) * 1.5), 3.0) * 0.2;
    color += vec3(spec);

    // Rim lighting on the sphere edge
    float rim = pow(smoothstep(0.5, 1.0, dist), 2.0) * 0.15;
    color += fluidColor * rim * fluid;

    // Edge darkening for depth
    float vignette = 1.0 - pow(dist, 3.0) * 0.5;
    color *= vignette;

    // Apply sphere mask with smooth edge
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
