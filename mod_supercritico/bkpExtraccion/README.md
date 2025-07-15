# 🧪 Estadísticas de Extracciones Supercríticas

Una aplicación web moderna para analizar y visualizar datos de extracciones supercríticas obtenidos desde Google Sheets.

## ✨ Características

- 📊 **Estadísticas en tiempo real**: Total de extracciones, rendimiento promedio, mejor rendimiento
- 📈 **Gráficos interactivos**: Rendimientos por fecha y distribución de materiales
- 🔍 **Filtros avanzados**: Por fecha, material y búsqueda de texto
- 📋 **Tabla de datos**: Vista completa de todas las extracciones con paginación
- 📱 **Diseño responsive**: Funciona perfectamente en móviles, tablets y computadoras
- 🔄 **Actualización automática**: Conecta directamente con Google Sheets
- 🎨 **Interfaz moderna**: Diseño atractivo con gradientes y animaciones

## 🚀 Cómo configurar

### 1. Crear el formulario de Google

1. Ve a [Google Forms](https://forms.google.com)
2. Crea un nuevo formulario con los siguientes campos:
   - **Fecha** (Fecha y hora)
   - **Material** (Texto corto)
   - **Peso Inicial (g)** (Número)
   - **Peso Final (g)** (Número)
   - **Rendimiento (%)** (Número)
   - **Temperatura (°C)** (Número)
   - **Presión (bar)** (Número)
   - **Tiempo (min)** (Número)
   - **Observaciones** (Texto largo)

### 2. Configurar Google Sheets

1. En tu formulario de Google, ve a "Respuestas" → "Crear hoja de cálculo"
2. Se creará automáticamente una hoja de Google Sheets
3. Copia el ID de la hoja de la URL (es la parte entre `/d/` y `/edit`)

### 3. Obtener API Key de Google

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google Sheets
4. Ve a "Credenciales" → "Crear credenciales" → "Clave de API"
5. Copia tu API key

### 4. Configurar la aplicación

1. Abre el archivo `script.js`
2. Reemplaza las siguientes líneas:
   ```javascript
   const GOOGLE_SHEETS_ID = 'tu_google_sheets_id_aqui';
   const GOOGLE_SHEETS_API_KEY = 'tu_api_key_aqui';
   ```
3. Con tus valores reales:
   ```javascript
   const GOOGLE_SHEETS_ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
   const GOOGLE_SHEETS_API_KEY = 'AIzaSyBweD3V7gMrcQK9qXtdLepXzXxXxXxXxXxX';
   ```

### 5. Configurar permisos de Google Sheets

1. En tu hoja de Google Sheets, haz clic en "Compartir"
2. Cambia los permisos a "Cualquier persona con el enlace puede ver"
3. Copia el enlace

## 📁 Estructura del proyecto

```
estadisticas-extracciones/
├── index.html          # Estructura HTML principal
├── styles.css          # Estilos CSS modernos
├── script.js           # Lógica JavaScript y conexión con Google Sheets
└── README.md           # Este archivo
```

## 🛠️ Tecnologías utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Diseño moderno con gradientes, flexbox y grid
- **JavaScript ES6+**: Lógica de la aplicación
- **Chart.js**: Gráficos interactivos
- **Google Sheets API**: Conexión con datos
- **Font Awesome**: Íconos
- **Google Fonts**: Tipografía Poppins

## 📊 Funcionalidades principales

### Panel de estadísticas
- **Total de extracciones**: Número total de registros
- **Rendimiento promedio**: Promedio de todos los rendimientos
- **Período analizado**: Rango de fechas de los datos
- **Mejor rendimiento**: El rendimiento más alto registrado

### Filtros y búsqueda
- **Filtro por fecha**: Últimos 7, 30 o 90 días
- **Filtro por material**: Seleccionar material específico
- **Búsqueda de texto**: Buscar en materiales y observaciones
- **Ordenamiento**: Por fecha, rendimiento o material

### Gráficos
- **Rendimientos por fecha**: Gráfico de línea mostrando tendencias
- **Distribución de materiales**: Gráfico circular con porcentajes

### Tabla de datos
- **Paginación**: 10 registros por página
- **Ordenamiento**: Por cualquier columna
- **Búsqueda**: Filtrado en tiempo real
- **Responsive**: Se adapta a diferentes tamaños de pantalla

## 📋 Estructura de datos esperada

La aplicación espera que tu Google Sheets tenga las siguientes columnas:

| Columna | Descripción | Tipo |
|---------|-------------|------|
| A | Fecha | Fecha |
| B | Material | Texto |
| C | Peso Inicial (g) | Número |
| D | Peso Final (g) | Número |
| E | Rendimiento (%) | Número |
| F | Temperatura (°C) | Número |
| G | Presión (bar) | Número |
| H | Tiempo (min) | Número |
| I | Observaciones | Texto |

## 🎨 Personalización

Puedes personalizar la aplicación modificando:

### Colores y estilos
- Edita los gradientes en `styles.css`
- Cambia los colores de los gráficos en `script.js`

### Campos de datos
- Modifica la función `processGoogleSheetsData()` en `script.js`
- Ajusta las columnas según tu estructura de datos

### Gráficos
- Personaliza los tipos de gráficos en las funciones `createYieldChart()` y `createMaterialChart()`
- Cambia los colores y opciones de visualización

## 🔧 Solución de problemas

### Error: "Error al conectar con Google Sheets"
- Verifica que tu API key sea correcta
- Asegúrate de que la API de Google Sheets esté habilitada
- Confirma que el ID de la hoja sea correcto

### Error: "No se pueden cargar los datos"
- Verifica que la hoja tenga permisos públicos
- Confirma que la estructura de columnas sea correcta
- Revisa la consola del navegador para errores específicos

### Los gráficos no se muestran
- Asegúrate de tener conexión a internet (Chart.js se carga desde CDN)
- Verifica que no haya errores de JavaScript en la consola

### La tabla está vacía
- Confirma que tu Google Sheets tenga datos
- Verifica que las fechas estén en formato correcto
- Revisa que los números no tengan caracteres especiales

## 📱 Compatibilidad

- ✅ Chrome (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Móviles y tablets

## 🔒 Seguridad

- La API key de Google debe mantenerse segura
- Considera usar variables de entorno en producción
- La hoja de Google Sheets debe tener permisos apropiados

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si tienes ideas para mejorar la aplicación, no dudes en compartirlas.

## 📞 Soporte

Si tienes problemas o preguntas:
1. Revisa la sección de solución de problemas
2. Verifica la consola del navegador para errores
3. Confirma que todos los pasos de configuración se hayan completado

---

**¡Disfruta analizando tus datos de extracciones supercríticas!** 🧪📊 