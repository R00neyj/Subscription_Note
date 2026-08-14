import { useEffect, useRef } from 'react'

/**
 * Antigravity Technical 3D Matrix Grid Canvas (Full-Cover Edition)
 * - Auto-Calculates Grid Bounds based on Container Width & Height
 * - 160% Overscan Plane to Fully Fill Every Corner of the CTA Card
 * - Balanced 3D Organic Wave Physics & Interactive Mouse Deflection
 * - Crisp High-Density Dots & Cyan/Indigo Wireframe Matrix
 */
export default function AntigravityCanvas({ className = "", intensity = 1.0 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let width = 0
    let height = 0

    // 3D Camera & Mouse State
    const fov = 400
    const camera = {
      rotX: 0.28,       // Perspective viewing angle
      rotY: 0,
      targetRotX: 0.28,
      targetRotY: 0,
      mousePos: { x: 0, y: 0, active: false }
    }

    let cols = 44
    let rows = 24
    let spacingX = 36
    let spacingY = 28
    const nodes = []

    const initGrid = () => {
      nodes.length = 0
      if (width === 0 || height === 0) return

      // Dynamically calculate grid to cover 170% width & 200% height
      spacingX = Math.max(width / 34, 28)
      spacingY = Math.max(height / 16, 24)
      cols = Math.ceil((width * 1.7) / spacingX)
      rows = Math.ceil((height * 2.0) / spacingY)

      const totalWidth = (cols - 1) * spacingX
      const totalHeight = (rows - 1) * spacingY

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const baseX = c * spacingX - totalWidth / 2
          const baseY = r * spacingY - totalHeight / 2
          nodes.push({
            r,
            c,
            baseX,
            baseY,
            x: baseX,
            y: baseY,
            z: 0,
            screenX: 0,
            screenY: 0,
            scale: 1,
            alpha: 1,
            visible: true
          })
        }
      }
    }

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
      initGrid()
    }

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left - width / 2
      const mouseY = e.clientY - rect.top - height / 2

      camera.targetRotY = (mouseX / width) * 0.28
      camera.targetRotX = 0.28 - (mouseY / height) * 0.22
      camera.mousePos = { x: mouseX, y: mouseY, active: true }
    }

    const handleMouseLeave = () => {
      camera.targetRotX = 0.28
      camera.targetRotY = 0
      camera.mousePos.active = false
    }

    const parent = canvas.parentElement
    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove)
      parent.addEventListener('mouseleave', handleMouseLeave)
    }
    window.addEventListener('resize', resize)
    resize()

    let time = 0

    const render = () => {
      time += 0.012

      // Smooth Camera Rotation with Inertia
      camera.rotX += (camera.targetRotX - camera.rotX) * 0.06
      camera.rotY += (camera.targetRotY - camera.rotY) * 0.06

      const cosX = Math.cos(camera.rotX)
      const sinX = Math.sin(camera.rotX)
      const cosY = Math.cos(camera.rotY)
      const sinY = Math.sin(camera.rotY)

      ctx.clearRect(0, 0, width, height)

      // 1. Calculate 3D Wave & Projection for Each Node
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]

        // 3D Balanced Organic Wave Undulation
        const wave1 = Math.sin(time * 1.3 + node.baseX * 0.005 + node.baseY * 0.007) * 14.0
        const wave2 = Math.cos(time * 1.0 + node.baseX * 0.008 - node.baseY * 0.004) * 8.5
        let targetZ = (wave1 + wave2) * intensity

        // Mouse 3D Gravitational Ripple
        if (camera.mousePos.active) {
          const dx = node.baseX - camera.mousePos.x
          const dy = node.baseY - camera.mousePos.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const radius = 170
          if (dist < radius) {
            const force = (1 - dist / radius)
            targetZ -= Math.sin(force * Math.PI) * 28 * intensity
          }
        }

        node.z = targetZ

        // 3D Rotation Calculation
        // Rotate Y
        const x1 = node.baseX * cosY - node.z * sinY
        const z1 = node.z * cosY + node.baseX * sinY
        // Rotate X
        const y1 = node.baseY * cosX - z1 * sinX
        const z2 = z1 * cosX + node.baseY * sinX

        // Perspective Projection
        const zCamera = z2 + fov + 240
        if (zCamera <= 10) {
          node.visible = false
          continue
        }

        const scale = fov / zCamera
        node.scale = scale
        node.screenX = x1 * scale + width / 2
        node.screenY = y1 * scale + height / 2 + 30 // Slight downward baseline shift for better coverage
        node.visible = true

        // Clean Depth Alpha
        const depthFactor = (z2 + 300) / 600
        node.alpha = Math.min(Math.max(0.18 + (1 - depthFactor) * 0.65, 0.12), 0.9)
      }

      // 2. Draw Clean 3D Grid Wireframe Lines
      ctx.lineWidth = 0.75
      
      // Horizontal Lines
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols - 1; c++) {
          const idx1 = r * cols + c
          const idx2 = r * cols + (c + 1)
          if (idx1 < nodes.length && idx2 < nodes.length) {
            const n1 = nodes[idx1]
            const n2 = nodes[idx2]
            if (n1.visible && n2.visible) {
              const lineAlpha = ((n1.alpha + n2.alpha) / 2) * 0.32
              ctx.beginPath()
              ctx.moveTo(n1.screenX, n1.screenY)
              ctx.lineTo(n2.screenX, n2.screenY)
              ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})` // Cyan-Blue
              ctx.stroke()
            }
          }
        }
      }

      // Vertical Lines
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows - 1; r++) {
          const idx1 = r * cols + c
          const idx2 = (r + 1) * cols + c
          if (idx1 < nodes.length && idx2 < nodes.length) {
            const n1 = nodes[idx1]
            const n2 = nodes[idx2]
            if (n1.visible && n2.visible) {
              const lineAlpha = ((n1.alpha + n2.alpha) / 2) * 0.25
              ctx.beginPath()
              ctx.moveTo(n1.screenX, n1.screenY)
              ctx.lineTo(n2.screenX, n2.screenY)
              ctx.strokeStyle = `rgba(99, 102, 241, ${lineAlpha})` // Indigo-Blue
              ctx.stroke()
            }
          }
        }
      }

      // 3. Draw Sharp, Crisp Point Grid Nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        if (!node.visible) continue

        const ptRadius = Math.max(1.25 * node.scale * intensity, 0.8)

        ctx.beginPath()
        ctx.arc(node.screenX, node.screenY, ptRadius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${node.alpha * 0.9})`
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (parent) {
        parent.removeEventListener('mousemove', handleMouseMove)
        parent.removeEventListener('mouseleave', handleMouseLeave)
      }
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [intensity])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  )
}
