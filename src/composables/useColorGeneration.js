// Продвинутые алгоритмы генерации палитр
export function useColorGeneration() {
  
  const PALETTE_TYPES = {
    analogous: 'Аналогичная',
    monochromatic: 'Монохромная',
    complementary: 'Комплементарная',
    triad: 'Триада',
    tetrad: 'Тетрада',
    square: 'Квадратная'
  }
  
  const MOODS = {
    calm: 'Спокойная',
    energetic: 'Энергичная',
    professional: 'Профессиональная',
    playful: 'Игривая',
    elegant: 'Элегантная'
  }
  
  const generatePaletteFromBase = (baseHex, type = 'analogous', count = 5) => {
    const baseHSL = hexToHSL(baseHex)
    let colors = [baseHex]
    
    switch (type) {
      case 'analogous':
        for (let i = 1; i < count; i++) {
          const hue = (baseHSL.h + 30 * i) % 360
          colors.push(hslToHex(hue, baseHSL.s, baseHSL.l))
        }
        break
        
      case 'monochromatic':
        for (let i = 1; i < count; i++) {
          const saturation = Math.max(20, baseHSL.s * (0.7 + 0.3 * Math.random()))
          const lightness = 30 + (i * 40 / count)
          colors.push(hslToHex(baseHSL.h, saturation, lightness))
        }
        break
        
      case 'complementary':
        const complementaryHue = (baseHSL.h + 180) % 360
        colors.push(hslToHex(complementaryHue, baseHSL.s, baseHSL.l))
        
        for (let i = 2; i < count; i++) {
          const hue = i % 2 === 0 
            ? (baseHSL.h + 30 * (i/2)) % 360
            : (complementaryHue + 30 * Math.floor(i/2)) % 360
          colors.push(hslToHex(hue, baseHSL.s * (0.8 + 0.2 * Math.random()), baseHSL.l))
        }
        break
        
      case 'triad':
        for (let i = 1; i < count; i++) {
          const hue = (baseHSL.h + 120 * i) % 360
          colors.push(hslToHex(hue, baseHSL.s, baseHSL.l))
        }
        break
    }
    
    return colors.slice(0, count)
  }
  
  const generatePaletteByMood = (mood, count = 5) => {
    let baseHue, saturationRange, lightnessRange
    
    switch (mood) {
      case 'calm':
        baseHue = 200 + Math.random() * 60 
        saturationRange = [20, 50]
        lightnessRange = [40, 70]
        break
        
      case 'energetic':
        baseHue = 0 + Math.random() * 60 
        saturationRange = [70, 100]
        lightnessRange = [50, 70]
        break
        
      case 'professional':
        baseHue = 220 + Math.random() * 40 
        saturationRange = [30, 60]
        lightnessRange = [30, 60]
        break
        
      case 'playful':
        baseHue = Math.random() * 360
        saturationRange = [80, 100]
        lightnessRange = [60, 80]
        break
        
      case 'elegant':
        baseHue = 280 + Math.random() * 80
        saturationRange = [40, 70]
        lightnessRange = [20, 50]
        break
    }
    
    const colors = []
    for (let i = 0; i < count; i++) {
      const hue = (baseHue + (i * 72)) % 360
      const saturation = saturationRange[0] + Math.random() * (saturationRange[1] - saturationRange[0])
      const lightness = lightnessRange[0] + Math.random() * (lightnessRange[1] - lightnessRange[0])
      colors.push(hslToHex(hue, saturation, lightness))
    }
    
    return colors
  }
  
  function hexToHSL(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    let r = parseInt(result[1], 16) / 255
    let g = parseInt(result[2], 16) / 255
    let b = parseInt(result[3], 16) / 255
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h, s, l = (max + min) / 2
    
    if (max === min) {
      h = s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }
  
  function hslToHex(h, s, l) {
    h /= 360
    s /= 100
    l /= 100
    
    let r, g, b
    
    if (s === 0) {
      r = g = b = l
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1/6) return p + (q - p) * 6 * t
        if (t < 1/2) return q
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
        return p
      }
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      
      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }
    
    const toHex = x => {
      const hex = Math.round(x * 255).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }
  
  return {
    PALETTE_TYPES,
    MOODS,
    generatePaletteFromBase,
    generatePaletteByMood,
    hexToHSL,
    hslToHex
  }
}