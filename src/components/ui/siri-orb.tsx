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

  // Flowing ribbon wave -- returns distance to a sine ribbon
  float ribbon(vec2 p, float freq, float amp, float phase, float thickness) {
    float wave = sin(p.x * freq + phase) * amp;
    wave += sin(p.x * freq * 0.6 + phase * 1.3) * amp * 0.4;
    float d = abs(p.y - wave);
    return smoothstep(thickness, thickness * 0.1, d);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 p = (uv - 0.5) * 2.0;

    float dist = length(p);
    float sphereMask = smoothstep(1.0, 0.94, dist);

    if (sphereMask < 0.001) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
      return;
    }

    float t = u_time * u_speed;

    // ---- Glass sphere base ----
    // Fake 3D normal from 2D circle for lighting
    float z = sqrt(max(0.0, 1.0 - dist * dist));
    vec3 normal = vec3(p, z);

    // Environment-like reflection (faked with position-based gradient)
    vec3 envColor = mix(
      vec3(0.03, 0.06, 0.1),
      vec3(0.08, 0.12, 0.18),
      smoothstep(-1.0, 1.0, p.y)
    );

    // Fresnel -- glass is more reflective at edges
    float fresnel = pow(1.0 - z, 3.0);

    // Glass base color -- mostly transparent with subtle tint
    vec3 glassColor = envColor + fresnel * 0.15;

    // ---- Flowing ribbon waves inside the sphere ----

    // Ribbon 1: main wave, flows right
    float r1y = sin(t * 0.5) * 0.1; // vertical drift
    vec2 rp1 = vec2(p.x, p.y - r1y);
    float r1 = ribbon(rp1, 4.0 + sin(t * 0.2) * 0.5, 0.25 + sin(t * 0.3) * 0.08, t * 1.2, 0.12);

    // Ribbon 2: counter-wave, flows left
    float r2y = cos(t * 0.4) * 0.12;
    vec2 rp2 = vec2(p.x, p.y - r2y + 0.05);
    float r2 = ribbon(rp2, 3.5 - sin(t * 0.25) * 0.4, 0.22 + cos(t * 0.35) * 0.06, -t * 0.9 + 1.5, 0.10);

    // Ribbon 3: thinner accent wave
    float r3y = sin(t * 0.6 + 2.0) * 0.08;
    vec2 rp3 = vec2(p.x, p.y - r3y - 0.08);
    float r3 = ribbon(rp3, 5.5, 0.18 + sin(t * 0.4) * 0.05, t * 1.5 + 3.0, 0.06);

    // Clip ribbons to sphere interior (with soft edge)
    float innerMask = smoothstep(0.95, 0.75, dist);
    r1 *= innerMask;
    r2 *= innerMask;
    r3 *= innerMask;

    // Color each ribbon
    vec3 ribbon1Color = mix(u_c1, u_c3, smoothstep(-0.8, 0.8, p.x + sin(t * 0.3)));
    vec3 ribbon2Color = mix(u_c2, u_c1, smoothstep(-0.6, 0.6, p.x - cos(t * 0.4)));
    vec3 ribbon3Color = mix(u_c3, u_c2, smoothstep(-0.5, 0.5, p.x));

    // Ribbon glow -- soft light around each ribbon
    float glow1 = ribbon(rp1, 4.0 + sin(t * 0.2) * 0.5, 0.25 + sin(t * 0.3) * 0.08, t * 1.2, 0.35) * 0.25 * innerMask;
    float glow2 = ribbon(rp2, 3.5 - sin(t * 0.25) * 0.4, 0.22 + cos(t * 0.35) * 0.06, -t * 0.9 + 1.5, 0.30) * 0.2 * innerMask;
    float glow3 = ribbon(rp3, 5.5, 0.18 + sin(t * 0.4) * 0.05, t * 1.5 + 3.0, 0.20) * 0.15 * innerMask;

    // ---- Compose ----

    vec3 color = glassColor;

    // Add ribbon glows first (behind the ribbons)
    color += ribbon1Color * glow1 * 0.4;
    color += ribbon2Color * glow2 * 0.35;
    color += ribbon3Color * glow3 * 0.3;

    // Add solid ribbons on top
    color = mix(color, ribbon1Color * 1.1, r1 * 0.85);
    color = mix(color, ribbon2Color * 1.0, r2 * 0.75);
    color = mix(color, ribbon3Color * 0.9, r3 * 0.65);

    // Where ribbons overlap, brighten
    float overlap = min(1.0, r1 * r2 + r1 * r3 + r2 * r3);
    color += vec3(1.0) * overlap * 0.15;

    // ---- Glass surface effects (on top of everything) ----

    // Main specular highlight (top-left, like a light source)
    float spec1 = pow(max(0.0, 1.0 - length(p - vec2(-0.3, 0.35)) * 1.8), 5.0) * 0.35;
    // Secondary smaller highlight
    float spec2 = pow(max(0.0, 1.0 - length(p - vec2(0.25, 0.55)) * 3.0), 6.0) * 0.15;

    // Rim highlight -- bright edge of the glass
    float rim = pow(smoothstep(0.5, 0.95, dist), 2.5) * 0.2;
    vec3 rimColor = mix(u_c1, vec3(1.0), 0.6);

    color += vec3(1.0) * spec1;
    color += vec3(0.9, 1.0, 0.95) * spec2;
    color += rimColor * rim * fresnel;

    // Subtle iridescence at the glass edge
    vec3 iridescentColor = vec3(
      0.5 + 0.5 * sin(dist * 8.0 + t * 0.5),
      0.5 + 0.5 * sin(dist * 8.0 + t * 0.5 + 2.094),
      0.5 + 0.5 * sin(dist * 8.0 + t * 0.5 + 4.189)
    );
    color += iridescentColor * fresnel * 0.08;

    // Edge vignette
    float vignette = 1.0 - pow(dist, 5.0) * 0.3;
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
