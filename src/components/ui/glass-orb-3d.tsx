"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment } from "@react-three/drei"
import * as THREE from "three"

// ── Full-screen quad with the ribbon shader (rendered behind the glass) ──
function RibbonBackground() {
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_speed: { value: 2.0 },
      u_c1: { value: new THREE.Color("#B8956A") },
      u_c2: { value: new THREE.Color("#7A9E7E") },
      u_c3: { value: new THREE.Color("#D4B87A") },
    }),
    []
  )

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.u_time.value = state.clock.elapsedTime
    }
  })

  // Exact same ribbon shader as the live SiriOrb -- rendered on a plane behind the glass
  const fragmentShader = `
    precision highp float;

    uniform float u_time;
    uniform float u_speed;
    uniform vec3 u_c1;
    uniform vec3 u_c2;
    uniform vec3 u_c3;
    varying vec2 vUv;

    float ribbon(vec2 p, float freq, float amp, float phase, float thickness) {
      float wave = sin(p.x * freq + phase) * amp;
      wave += sin(p.x * freq * 0.6 + phase * 1.3) * amp * 0.4;
      float d = abs(p.y - wave);
      return smoothstep(thickness, thickness * 0.1, d);
    }

    void main() {
      vec2 p = (vUv - 0.5) * 2.0;
      float dist = length(p);

      // Clip to circle
      if (dist > 0.98) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        return;
      }

      float t = u_time * u_speed;

      // Fake 3D sphere normal for lighting
      float z = sqrt(max(0.0, 1.0 - dist * dist));

      // Dark base
      vec3 envColor = mix(
        vec3(0.03, 0.06, 0.1),
        vec3(0.08, 0.12, 0.18),
        smoothstep(-1.0, 1.0, p.y)
      );

      float fresnel = pow(1.0 - z, 3.0);
      vec3 glassColor = envColor + fresnel * 0.1;

      // Inner mask
      float innerMask = smoothstep(0.95, 0.7, dist);

      // ---- Ribbon 1 ----
      float r1y = sin(t * 0.5) * 0.1;
      vec2 rp1 = vec2(p.x, p.y - r1y);
      float r1 = ribbon(rp1, 4.0 + sin(t * 0.2) * 0.5, 0.25 + sin(t * 0.3) * 0.08, t * 1.2, 0.12) * innerMask;

      // ---- Ribbon 2 ----
      float r2y = cos(t * 0.4) * 0.12;
      vec2 rp2 = vec2(p.x, p.y - r2y + 0.05);
      float r2 = ribbon(rp2, 3.5 - sin(t * 0.25) * 0.4, 0.22 + cos(t * 0.35) * 0.06, -t * 0.9 + 1.5, 0.10) * innerMask;

      // ---- Ribbon 3 ----
      float r3y = sin(t * 0.6 + 2.0) * 0.08;
      vec2 rp3 = vec2(p.x, p.y - r3y - 0.08);
      float r3 = ribbon(rp3, 5.5, 0.18 + sin(t * 0.4) * 0.05, t * 1.5 + 3.0, 0.06) * innerMask;

      // Ribbon colors
      vec3 ribbon1Color = mix(u_c1, u_c3, smoothstep(-0.8, 0.8, p.x + sin(t * 0.3)));
      vec3 ribbon2Color = mix(u_c2, u_c1, smoothstep(-0.6, 0.6, p.x - cos(t * 0.4)));
      vec3 ribbon3Color = mix(u_c3, u_c2, smoothstep(-0.5, 0.5, p.x));

      // Glow
      float glow1 = ribbon(rp1, 4.0 + sin(t * 0.2) * 0.5, 0.25 + sin(t * 0.3) * 0.08, t * 1.2, 0.35) * 0.25 * innerMask;
      float glow2 = ribbon(rp2, 3.5 - sin(t * 0.25) * 0.4, 0.22 + cos(t * 0.35) * 0.06, -t * 0.9 + 1.5, 0.30) * 0.2 * innerMask;
      float glow3 = ribbon(rp3, 5.5, 0.18 + sin(t * 0.4) * 0.05, t * 1.5 + 3.0, 0.20) * 0.15 * innerMask;

      // Compose
      vec3 color = glassColor;
      color += ribbon1Color * glow1 * 0.4;
      color += ribbon2Color * glow2 * 0.35;
      color += ribbon3Color * glow3 * 0.3;
      color = mix(color, ribbon1Color * 1.1, r1 * 0.85);
      color = mix(color, ribbon2Color * 1.0, r2 * 0.75);
      color = mix(color, ribbon3Color * 0.9, r3 * 0.65);

      float overlap = min(1.0, r1 * r2 + r1 * r3 + r2 * r3);
      color += vec3(1.0) * overlap * 0.15;

      // ---- Glass surface effects ----

      // Main specular highlight (top-left)
      float spec1 = pow(max(0.0, 1.0 - length(p - vec2(-0.3, 0.35)) * 1.8), 5.0) * 0.35;
      // Secondary smaller highlight
      float spec2 = pow(max(0.0, 1.0 - length(p - vec2(0.25, 0.55)) * 3.0), 6.0) * 0.15;

      // Rim highlight
      float rim = pow(smoothstep(0.5, 0.95, dist), 2.5) * 0.2;
      vec3 rimColor = mix(u_c1, vec3(1.0), 0.6);

      color += vec3(1.0) * spec1;
      color += vec3(0.9, 1.0, 0.95) * spec2;
      color += rimColor * rim * fresnel;

      // Subtle iridescence at edge
      vec3 iridescentColor = vec3(
        0.5 + 0.5 * sin(dist * 8.0 + t * 0.5),
        0.5 + 0.5 * sin(dist * 8.0 + t * 0.5 + 2.094),
        0.5 + 0.5 * sin(dist * 8.0 + t * 0.5 + 4.189)
      );
      color += iridescentColor * fresnel * 0.08;

      // Edge vignette
      float vignette = 1.0 - pow(dist, 5.0) * 0.3;
      color *= vignette;

      float sphereMask = smoothstep(0.98, 0.92, dist);
      gl_FragColor = vec4(color * sphereMask, sphereMask);
    }
  `

  return (
    <mesh position={[0, 0, -0.3]} renderOrder={0}>
      <planeGeometry args={[3.5, 3.5]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

// ── Glass sphere overlay (real 3D glass on top) ─────────────────────
function GlassShell() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
    }
  })

  return (
    <mesh ref={meshRef} scale={0.93} renderOrder={1}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshPhysicalMaterial
        color="#ffffff"
        transparent
        opacity={0.04}
        roughness={0.0}
        metalness={0.0}
        clearcoat={1.0}
        clearcoatRoughness={0.0}
        envMapIntensity={0.5}
        side={THREE.FrontSide}
        depthWrite={false}
      />
    </mesh>
  )
}

// ── Specular highlights (crisp glass reflections) ───────────────────
function SpecularHighlight() {
  return (
    <mesh scale={0.931} renderOrder={2}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        uniforms={{}}
        vertexShader={`
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vec3 viewDir = normalize(-vPosition);
            float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 4.0);

            // Main specular -- very tight, bright
            vec3 lightDir = normalize(vec3(-0.4, 0.7, 1.0));
            vec3 halfDir = normalize(lightDir + viewDir);
            float spec = pow(max(dot(vNormal, halfDir), 0.0), 200.0) * 0.9;

            // Secondary
            vec3 lightDir2 = normalize(vec3(0.5, 0.5, 0.8));
            vec3 halfDir2 = normalize(lightDir2 + viewDir);
            float spec2 = pow(max(dot(vNormal, halfDir2), 0.0), 150.0) * 0.3;

            // Thin rim -- glass edge, not cloud
            float rim = fresnel * 0.08;

            // Subtle iridescence at edge
            vec3 iriColor = vec3(
              0.5 + 0.5 * sin(fresnel * 6.0),
              0.5 + 0.5 * sin(fresnel * 6.0 + 2.094),
              0.5 + 0.5 * sin(fresnel * 6.0 + 4.189)
            );

            vec3 color = vec3(1.0) * (spec + spec2) + vec3(0.4, 0.9, 0.6) * rim + iriColor * fresnel * 0.06;
            float alpha = spec + spec2 + rim;

            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </mesh>
  )
}

// ── Scene ───────────────────────────────────────────────────────────
function OrbScene() {
  return (
    <>
      <Environment preset="night" />
      <ambientLight intensity={0.3} />
      <directionalLight position={[-1, 2, 3]} intensity={0.8} color="#ffffff" />

      <RibbonBackground />
      <GlassShell />
      <SpecularHighlight />
    </>
  )
}

// ── Export ───────────────────────────────────────────────────────────
interface GlassOrb3DProps {
  size?: string
  className?: string
}

export function GlassOrb3D({ size = "192px", className }: GlassOrb3DProps) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        boxShadow:
          "0 0 15px rgba(196, 162, 101, 0.15), 0 0 30px rgba(122, 158, 126, 0.08)",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 2.0], fov: 50 }}
        gl={{
          alpha: true,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        style={{ background: "transparent" }}
        dpr={[1, 2]}
      >
        <OrbScene />
      </Canvas>
    </div>
  )
}

export default GlassOrb3D
