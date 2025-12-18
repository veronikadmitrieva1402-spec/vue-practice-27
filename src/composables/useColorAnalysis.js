export function useColorAnalysis() {
  
  const getLuminance = (hex) => {
    const rgb = hexToRgb(hex)
    const [r, g, b] = Object.values(rgb).map(v => {
      v /= 255
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  
  const getContrastRatio = (color1, color2) => {
    const l1 = getLuminance(color1)
    const l2 = getLuminance(color2)
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)
  }
  
  const checkWCAGCompliance = (color1, color2) => {
    const ratio = getContrastRatio(color1, color2)
    
    const results = {
      ratio: Math.round(ratio * 100) / 100,
      AA: {
        normal: ratio >= 4.5,
        large: ratio >= 3,
        ui: ratio >= 3
      },
      AAA: {
        normal: ratio >= 7,
        large: ratio >= 4.5,
        ui: ratio >= 4.5
      }
    }
    
    if (ratio >= 7) {
      results.level = 'AAA'
      results.score = 'Отлично'
    } else if (ratio >= 4.5) {
      results.level = 'AA'
      results.score = 'Хорошо'
    } else if (ratio >= 3) {
      results.level = 'A (Large)'
      results.score = 'Минимально'
    } else {
      results.level = 'Недостаточно'
      results.score = 'Плохо'
    }
    
    return results
  }
  
  const generateAccentColors = (baseColor, count = 3) => {
    const baseHSL = hexToHSL(baseColor)
    const accents = []
    
    const accentTypes = [
      { h: (baseHSL.h + 180) % 360, s: baseHSL.s * 1.2, l: baseHSL.l }, // Комплементарный
      { h: (baseHSL.h + 30) % 360, s: baseHSL.s * 0.8, l: baseHSL.l + 20 }, // Аналогичный светлый
      { h: (baseHSL.h + 150) % 360, s: baseHSL.s * 1.1, l: baseHSL.l - 10 }, // Сплит-комплементарный
      { h: baseHSL.h, s: baseHSL.s * 0.6, l: baseHSL.l + 30 }, // Тот же оттенок, светлее
      { h: baseHSL.h, s: baseHSL.s * 1.3, l: baseHSL.l - 20 }  // Тот же оттенок, насыщеннее
    ]
    
    for (let i = 0; i < Math.min(count, accentTypes.length); i++) {
      const { h, s, l } = accentTypes[i]
      accents.push(hslToHex(h, Math.min(s, 100), Math.max(0, Math.min(l, 100))))
    }
    
    return accents
  }
  
  const analyzePaletteAccessibility = (palette) => {
    const analysis = {
      scores: [],
      recommendations: [],
      overallScore: 0
    }
    
    for (let i = 0; i < palette.length; i++) {
      for (let j = i + 1; j < palette.length; j++) {
        const result = checkWCAGCompliance(palette[i], palette[j])
        analysis.scores.push({
          colors: [palette[i], palette[j]],
          ...result
        })
      }
    }
    
    const goodContrasts = analysis.scores.filter(s => s.level === 'AA' || s.level === 'AAA').length
    analysis.overallScore = Math.round((goodContrasts / analysis.scores.length) * 100)
    
    if (analysis.overallScore < 60) {
      analysis.recommendations.push('Добавьте больше контраста между основными цветами')
    }
    if (analysis.scores.some(s => s.ratio < 3)) {
      analysis.recommendations.push('Некоторые цвета имеют недостаточный контраст для текста')
    }
    
    return analysis
  }
  
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
  }
  
  function hexToHSL(hex) {
    const rgb = hexToRgb(hex)
    const r = rgb.r / 255
    const g = rgb.g / 255
    const b = rgb.b / 255
    
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
    getLuminance,
    getContrastRatio,
    checkWCAGCompliance,
    generateAccentColors,
    analyzePaletteAccessibility
  }
}