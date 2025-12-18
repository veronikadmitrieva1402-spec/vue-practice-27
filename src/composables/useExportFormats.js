export function useExportFormats() {
  
  const exportToCSSVariables = (palette, prefix = 'color') => {
    let css = ':root {\n'
    palette.forEach((color, index) => {
      const varName = `--${prefix}-${index + 1}`
      css += `  ${varName}: ${color};\n`
    })
    css += '}\n\n'
    css += '/* Использование: */\n'
    css += '.element {\n'
    css += `  color: var(--${prefix}-1);\n`
    css += `  background-color: var(--${prefix}-2);\n`
    css += '}'
    return css
  }
  
  const exportToSCSSVariables = (palette, prefix = 'color') => {
    let scss = ''
    palette.forEach((color, index) => {
      scss += `$${prefix}-${index + 1}: ${color};\n`
    })
    scss += '\n'
    scss += '// Использование:\n'
    scss += '.element {\n'
    scss += `  color: $${prefix}-1;\n`
    scss += `  background-color: $${prefix}-2;\n`
    scss += '}'
    return scss
  }
  
  const exportToTailwindConfig = (palette, prefix = 'palette') => {
    let config = `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n        ${prefix}: {\n`
    
    palette.forEach((color, index) => {
      config += `          ${index + 1}: '${color}',\n`
    })
    
    config += '        }\n      }\n    }\n  }\n}'
    return config
  }
  
  const exportToJSON = (palette, name = 'palette') => {
    const data = {
      name,
      colors: palette,
      createdAt: new Date().toISOString(),
      formats: {
        hex: palette,
        rgb: palette.map(hexToRgb),
        hsl: palette.map(hexToHSL)
      }
    }
    return JSON.stringify(data, null, 2)
  }
  
  const generateCSSCode = (palette) => {
    const css = `.color-palette {\n  /* Основные цвета */\n`
    
    palette.forEach((color, index) => {
      css += `  --primary-${index + 1}: ${color};\n`
    })
    
    css += '\n  /* Примеры использования */\n'
    css += `  .btn-primary {\n    background-color: var(--primary-1);\n    color: white;\n  }\n\n`
    css += `  .text-accent {\n    color: var(--primary-2);\n  }\n\n`
    css += `  .bg-subtle {\n    background-color: var(--primary-3);\n  }\n`
    css += '}'
    
    return css
  }
  
  const createShareableLink = (palette) => {
    const colorsString = palette.join('-').replace(/#/g, '')
    const baseUrl = window.location.origin
    return `${baseUrl}/palette/${colorsString}`
  }
  
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? 
      `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` :
      'rgb(0, 0, 0)'
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
    
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
  }
  
  return {
    exportToCSSVariables,
    exportToSCSSVariables,
    exportToTailwindConfig,
    exportToJSON,
    generateCSSCode,
    createShareableLink
  }
}