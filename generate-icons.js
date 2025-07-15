const fs = require('fs');
const path = require('path');

// Crear la carpeta icons si no existe
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir);
}

// Crear un HTML simple que genere los iconos
const iconGeneratorHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Generador de Iconos</title>
</head>
<body>
    <h1>Generando iconos de Biocann...</h1>
    <div id="status">Cargando...</div>
    <script>
        const iconSizes = [
            { size: 72, name: 'icon-72x72.png' },
            { size: 96, name: 'icon-96x96.png' },
            { size: 128, name: 'icon-128x128.png' },
            { size: 144, name: 'icon-144x144.png' },
            { size: 152, name: 'icon-152x152.png' },
            { size: 192, name: 'icon-192x192.png' },
            { size: 384, name: 'icon-384x384.png' },
            { size: 512, name: 'icon-512x512.png' }
        ];

        const img = new Image();
        img.onload = function() {
            document.getElementById('status').innerHTML = 'Generando iconos...';
            
            iconSizes.forEach(iconInfo => {
                const canvas = document.createElement('canvas');
                canvas.width = iconInfo.size;
                canvas.height = iconInfo.size;
                const ctx = canvas.getContext('2d');

                // Fondo circular verde
                ctx.fillStyle = '#4CAF50';
                ctx.beginPath();
                ctx.arc(iconInfo.size/2, iconInfo.size/2, iconInfo.size/2, 0, 2 * Math.PI);
                ctx.fill();

                // Centrar imagen
                const scale = Math.min(iconInfo.size * 0.8 / img.width, iconInfo.size * 0.8 / img.height);
                const scaledWidth = img.width * scale;
                const scaledHeight = img.height * scale;
                const x = (iconInfo.size - scaledWidth) / 2;
                const y = (iconInfo.size - scaledHeight) / 2;

                ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

                // Descargar
                const link = document.createElement('a');
                link.download = iconInfo.name;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });

            document.getElementById('status').innerHTML = '¡Iconos generados! Revisa tu carpeta de descargas.';
        };
        img.src = 'biocann-logo.jpg';
    </script>
</body>
</html>
`;

// Escribir el archivo HTML
fs.writeFileSync('temp-icon-generator.html', iconGeneratorHTML);

console.log('✅ Archivo generador creado: temp-icon-generator.html');
console.log('📋 Instrucciones:');
console.log('1. Abre temp-icon-generator.html en tu navegador');
console.log('2. Los iconos se descargarán automáticamente');
console.log('3. Mueve los archivos descargados a la carpeta icons/');
console.log('4. Sube los cambios a GitHub');
console.log('');
console.log('🎯 Los iconos tendrán:');
console.log('- Fondo circular verde (#4CAF50)');
console.log('- Logo de Biocann centrado');
console.log('- Todos los tamaños necesarios para PWA'); 