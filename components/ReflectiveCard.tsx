"use client"

import React, { useEffect, useRef, useState } from "react"
import {
  AwardIcon,
  Gamepad2Icon,
  HeadphonesIcon,
  KeyboardIcon,
  Lock,
  MedalIcon,
  MicIcon,
  MonitorIcon,
  MouseIcon,
  SquareIcon,
  TrophyIcon,
} from "lucide-react"

type IconName =
  | "trophy"
  | "medal"
  | "award"
  | "mouse"
  | "keyboard"
  | "mousepad"
  | "headset"
  | "controle"
  | "microfone"
  | "monitor"

interface ReflectiveCardProps {
  blurStrength?: number
  color?: string
  metalness?: number
  roughness?: number
  overlayColor?: string
  displacementStrength?: number
  noiseScale?: number
  specularConstant?: number
  grayscale?: number
  glassDistortion?: number
  className?: string
  style?: React.CSSProperties
  rank?: number
  title?: string
  subtitle?: string
  score?: string
  tone?: "gold" | "silver" | "bronze" | "default"
  imageUrl?: string
  imageAlt?: string
  topIconName?: IconName
  bottomIconName?: IconName
}

const ReflectiveCard: React.FC<ReflectiveCardProps> = ({
  blurStrength = 10,
  color = "white",
  metalness = 0.35,
  roughness = 0.4,
  overlayColor = "rgba(255, 255, 255, 0.08)",
  displacementStrength = 20,
  noiseScale = 1,
  specularConstant = 1.2,
  grayscale = 1,
  glassDistortion = 0,
  className = "",
  style = {},
  rank,
  title = "Top Periferico",
  subtitle = "Ranking por categoria",
  score,
  tone = "default",
  imageUrl,
  imageAlt = "Imagem ilustrativa do periferico",
  topIconName = "trophy",
  bottomIconName = "trophy",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [streamActive, setStreamActive] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  const toneStyles = {
    gold: {
      overlay: "rgba(53, 38, 8, 0.58)",
      text: "#FFF4CC",
      border: "rgba(255, 215, 0, 0.6)",
    },
    silver: {
      overlay: "rgba(24, 30, 40, 0.58)",
      text: "#EEF2F7",
      border: "rgba(209, 213, 219, 0.6)",
    },
    bronze: {
      overlay: "rgba(52, 29, 18, 0.58)",
      text: "#F6E1D1",
      border: "rgba(205, 127, 50, 0.6)",
    },
    default: {
      overlay: overlayColor,
      text: color,
      border: "rgba(255,255,255,0.3)",
    },
  }[tone]

  useEffect(() => {
    setImageFailed(false)
  }, [imageUrl])

  useEffect(() => {
    if (imageUrl) {
      setStreamActive(false)
      return
    }

    let stream: MediaStream | null = null

    const startWebcam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setStreamActive(true)
        }
      } catch {
        setStreamActive(false)
      }
    }

    startWebcam()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [imageUrl])

  const baseFrequency = 0.03 / Math.max(0.1, noiseScale)
  const saturation = 1 - Math.max(0, Math.min(1, grayscale))

  const cssVariables = {
    "--blur-strength": `${blurStrength}px`,
    "--metalness": metalness,
    "--roughness": roughness,
    "--overlay-color": toneStyles.overlay,
    "--text-color": toneStyles.text,
    "--saturation": saturation,
  } as React.CSSProperties

  const hasIllustration = Boolean(imageUrl && !imageFailed)

  const iconMap = {
    trophy: TrophyIcon,
    medal: MedalIcon,
    award: AwardIcon,
    mouse: MouseIcon,
    keyboard: KeyboardIcon,
    mousepad: SquareIcon,
    headset: HeadphonesIcon,
    controle: Gamepad2Icon,
    microfone: MicIcon,
    monitor: MonitorIcon,
  } as const

  const TopIcon = iconMap[topIconName] ?? TrophyIcon
  const BottomIcon = iconMap[bottomIconName] ?? TrophyIcon

  return (
    <div
      className={`relative h-[420px] w-full overflow-hidden rounded-[20px] bg-[#1a1a1a] font-sans shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)_inset] isolate ${className}`}
      style={{ ...style, ...cssVariables }}
    >
      <svg className="pointer-events-none absolute h-0 w-0 opacity-0" aria-hidden="true">
        <defs>
          <filter id="metallic-displacement" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="turbulence" baseFrequency={baseFrequency} numOctaves="2" result="noise" />
            <feColorMatrix in="noise" type="luminanceToAlpha" result="noiseAlpha" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={displacementStrength}
              xChannelSelector="R"
              yChannelSelector="G"
              result="rippled"
            />
            <feSpecularLighting
              in="noiseAlpha"
              surfaceScale={displacementStrength}
              specularConstant={specularConstant}
              specularExponent="20"
              lightingColor="#ffffff"
              result="light"
            >
              <fePointLight x="0" y="0" z="300" />
            </feSpecularLighting>
            <feComposite in="light" in2="rippled" operator="in" result="light-effect" />
            <feBlend in="light-effect" in2="rippled" mode="screen" result="metallic-result" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="solidAlpha"
            />
            <feMorphology in="solidAlpha" operator="erode" radius="45" result="erodedAlpha" />
            <feGaussianBlur in="erodedAlpha" stdDeviation="10" result="blurredMap" />
            <feComponentTransfer in="blurredMap" result="glassMap">
              <feFuncA type="linear" slope="0.5" intercept="0" />
            </feComponentTransfer>
            <feDisplacementMap
              in="metallic-result"
              in2="glassMap"
              scale={glassDistortion}
              xChannelSelector="A"
              yChannelSelector="A"
              result="final"
            />
          </filter>
        </defs>
      </svg>

      {imageUrl && !imageFailed ? (
        <img
          src={imageUrl}
          alt={imageAlt}
          className="absolute top-0 left-0 z-0 h-full w-full object-cover opacity-92"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <>
          {!imageUrl ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute top-0 left-0 z-0 h-full w-full -scale-x-100 object-cover opacity-90 transition-[filter] duration-300"
              style={{
                filter:
                  "saturate(var(--saturation, 0)) contrast(120%) brightness(110%) blur(var(--blur-strength, 12px)) url(#metallic-displacement)",
              }}
            />
          ) : null}
          {!streamActive || imageFailed ? (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_60%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.08),transparent_60%),linear-gradient(135deg,#090909,#1e1e1e)]" />
          ) : null}
        </>
      )}

      <div
        className="pointer-events-none absolute inset-0 z-[9]"
        style={{
          background: hasIllustration
            ? "linear-gradient(to bottom, rgba(0,0,0,0.28), rgba(0,0,0,0.22), rgba(0,0,0,0.52))"
            : "linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.3), rgba(0,0,0,0.65))",
        }}
      />

      <div className="absolute inset-0 z-10 pointer-events-none bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%270%200%20200%20200%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cfilter%20id%3D%27noiseFilter%27%3E%3CfeTurbulence%20type%3D%27fractalNoise%27%20baseFrequency%3D%270.8%27%20numOctaves%3D%273%27%20stitchTiles%3D%27stitch%27%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%27100%25%27%20height%3D%27100%25%27%20filter%3D%27url(%23noiseFilter)%27%2F%3E%3C%2Fsvg%3E')] mix-blend-overlay opacity-[var(--roughness,0.4)]" />

      <div
        className="absolute inset-0 z-20 pointer-events-none bg-[linear-gradient(135deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.04)_40%,rgba(255,255,255,0)_50%,rgba(255,255,255,0.04)_60%,rgba(255,255,255,0.14)_100%)] mix-blend-overlay opacity-[var(--metalness,1)]"
        style={{ opacity: hasIllustration ? 0.22 : undefined }}
      />

      <div
        className="pointer-events-none absolute inset-0 z-20 rounded-[20px] p-[1px] bg-[linear-gradient(135deg,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.6)_100%)] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:exclude]"
        style={{ boxShadow: `inset 0 0 0 1px ${toneStyles.border}` }}
      />

      <div className="relative z-10 flex h-full flex-col justify-between bg-[var(--overlay-color,rgba(255,255,255,0.05))] p-8 text-[var(--text-color,white)]">
        <div className="flex items-center justify-between border-b border-white/20 pb-4">
          <div className="flex items-center gap-1.5 rounded border border-white/20 bg-white/10 px-2 py-1 text-[10px] font-bold tracking-[0.1em]">
            <Lock size={14} className="opacity-80" />
            <span>{rank ? `RANK #${rank}` : "SECURE ACCESS"}</span>
          </div>
          <TopIcon className="opacity-85" size={20} />
        </div>

        <div className="mb-8 flex flex-1 flex-col items-center justify-end gap-6 text-center">
          <div className="text-center">
            <h2 className="m-0 mb-2 text-2xl font-bold tracking-[0.05em] drop-shadow-md">{title}</h2>
          </div>
        </div>

        <div className="flex items-end justify-between border-t border-white/20 pt-6">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] tracking-[0.1em] opacity-60">CATEGORY SCORE</span>
            <span className="font-mono text-sm tracking-[0.05em]">{score ?? "--"}</span>
          </div>
          <div className="opacity-40">
            <BottomIcon size={32} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReflectiveCard
