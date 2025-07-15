// Configuración de Google Sheets
const GOOGLE_SHEETS_ID = '1dp2jCVkWJLIvxFuO8R0KnaWd89_Rq9tMvBR6WmTFqtE'; // ID de tu hoja de Google Sheets
const GOOGLE_SHEETS_API_KEY = 'AIzaSyDni6OH7yzqvthBCVeaIFaPhtGIEjlALvU'; // API key de Google Sheets

// Variables globales
let extractionData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 10;

// Elementos del DOM
const totalExtractions = document.getElementById('totalExtractions');
const avgYield = document.getElementById('avgYield');
const dateRange = document.getElementById('dateRange');
const bestYield = document.getElementById('bestYield');
const datePicker = document.getElementById('datePicker');
const searchInput = document.getElementById('searchInput');
const sortBy = document.getElementById('sortBy');
const tableBody = document.getElementById('tableBody');
const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const errorMessage = document.getElementById('errorMessage');

// Event listeners
if (searchInput) searchInput.addEventListener('input', filterData);
if (sortBy) sortBy.addEventListener('change', sortData);
prevPage.addEventListener('click', () => changePage(-1));
nextPage.addEventListener('click', () => changePage(1));

// Obtener datos filtrados según los nuevos filtros (robusto)
function getFilteredData() {
    // Si no hay filtros activos, devolver todos los registros
    const varietyFilter = document.getElementById('varietyFilter');
    const varietyValue = varietyFilter ? varietyFilter.value : 'all';
    const datePicker = document.getElementById('datePicker');
    const dateValue = datePicker ? datePicker.value : '';
    const orderByDate = document.getElementById('orderByDate');
    const orderBy = orderByDate ? orderByDate.value : 'desc';

    // Si no hay filtro de variedad ni de fecha, devolver todo
    if ((varietyValue === 'all' || !varietyFilter) && !dateValue) {
        let all = [...extractionData];
        all.sort((a, b) => {
            if (!a.fecha || !b.fecha) return 0;
            const [da, ma] = a.fecha.split('/');
            const [db, mb] = b.fecha.split('/');
            const fa = new Date(new Date().getFullYear(), parseInt(ma) - 1, parseInt(da));
            const fb = new Date(new Date().getFullYear(), parseInt(mb) - 1, parseInt(db));
            return orderBy === 'asc' ? fa - fb : fb - fa;
        });
        return all;
    }

    // Si hay filtros, aplicar como antes
    let filtered = [...extractionData];
    if (varietyValue !== 'all') {
        filtered = filtered.filter(item => (item.variedad || '').trim().toLowerCase() === varietyValue);
    }
    if (dateValue) {
        filtered = filtered.filter(item => {
            if (!item.fecha) return false;
            const [d, m] = item.fecha.split('/');
            const itemDate = `${new Date().getFullYear()}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            return itemDate === dateValue;
        });
    }
    filtered.sort((a, b) => {
        if (!a.fecha || !b.fecha) return 0;
        const [da, ma] = a.fecha.split('/');
        const [db, mb] = b.fecha.split('/');
        const fa = new Date(new Date().getFullYear(), parseInt(ma) - 1, parseInt(da));
        const fb = new Date(new Date().getFullYear(), parseInt(mb) - 1, parseInt(db));
        return orderBy === 'asc' ? fa - fb : fb - fa;
    });
    return filtered;
}

window.addEventListener('DOMContentLoaded', () => {
    // Llenar el select de variedad automáticamente
    function updateVarietyFilter() {
        const varietyFilter = document.getElementById('varietyFilter');
        const variedades = [...new Set(extractionData.map(item => (item.variedad || '').trim().toLowerCase()).filter(v => v))];
        varietyFilter.innerHTML = '<option value="all">Todas las variedades</option>';
        variedades.forEach(v => {
            const option = document.createElement('option');
            option.value = v;
            option.textContent = v.charAt(0).toUpperCase() + v.slice(1);
            varietyFilter.appendChild(option);
        });
    }

    // Actualizar todo al cambiar filtros
    ['varietyFilter', 'datePicker', 'orderByDate'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', () => {
                filterData();
                displayTable();
                displayDailyYieldTable();
                displayDailyYieldChart();
            });
        }
    });

    // Lógica de carga de datos
    function loadData() {
        showLoading();
        try {
            loadFromGoogleSheets().then(realData => {
                extractionData = realData;
                updateVarietyFilter();
                filterData();
                displayTable();
                displayDailyYieldTable();
                displayDailyYieldChart();
                updateStatistics();
                hideLoading();
            }).catch(err => {
                console.error('Error al cargar datos:', err);
                const mockData = generateMockData();
                extractionData = mockData;
                updateVarietyFilter();
                filterData();
                displayTable();
                displayDailyYieldTable();
                displayDailyYieldChart();
                updateStatistics();
                hideLoading();
                showError('No se pudieron cargar los datos de Google Sheets. Mostrando datos de ejemplo.');
            });
        } catch (err) {
            console.error('Error inesperado:', err);
            hideLoading();
            showError('Error inesperado al cargar los datos.');
        }
    }

    // Llamar a loadData al iniciar
    loadData();
});

// Función para conectar con Google Sheets (ajustada para rango B:I)
async function loadFromGoogleSheets() {
    // Cambia el nombre de la hoja si es necesario (por ejemplo, 'Sheet1' o 'Respuestas de formulario 1')
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/Sheet1!B:I?key=${GOOGLE_SHEETS_API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Error al conectar con Google Sheets');
    }
    
    const data = await response.json();
    return processGoogleSheetsData(data.values);
}

// Función para procesar datos de Google Sheets (ajustada a los campos del usuario)
function processGoogleSheetsData(rawData) {
    console.log('Datos crudos desde Google Sheets:', rawData); // DEBUG
    // Saltar la primera fila (encabezados)
    const dataRows = rawData.slice(1);
    
    return dataRows.map(row => ({
        fecha: row[0] || '',
        hora: row[1] || '',
        loteOrigen: row[2] || '',
        pesoIngreso: parseFloat(row[3]) || 0,
        nroCiclo: row[4] || '',
        nroExtraccion: row[5] || '',
        peso: parseFloat(row[6]) || 0,
        variedad: row[7] || ''
    }));
}

// Función para generar datos de ejemplo
function generateMockData() {
    const materials = ['Cannabis', 'Lavanda', 'Romero', 'Menta', 'Eucalipto', 'Jazmín'];
    const data = [];
    
    for (let i = 0; i < 50; i++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 365));
        
        const initialWeight = (Math.random() * 100 + 10).toFixed(2);
        const yieldPercent = (Math.random() * 15 + 2).toFixed(2);
        const finalWeight = (initialWeight * yieldPercent / 100).toFixed(2);
        
        data.push({
            date: date,
            material: materials[Math.floor(Math.random() * materials.length)],
            initialWeight: parseFloat(initialWeight),
            finalWeight: parseFloat(finalWeight),
            yield: parseFloat(yieldPercent),
            temperature: Math.floor(Math.random() * 30 + 40),
            pressure: Math.floor(Math.random() * 100 + 200),
            time: Math.floor(Math.random() * 120 + 60),
            observations: Math.random() > 0.7 ? 'Extracción exitosa' : ''
        });
    }
    
    return data.sort((a, b) => b.date - a.date);
}

// Función para actualizar estadísticas (ajustada solo para total y período analizado)
function updateStatistics() {
    const total = extractionData.length;
    totalExtractions.textContent = total;

    // Calcular el período analizado usando el campo 'fecha' (formato dd/mm)
    const fechas = extractionData.map(item => item.fecha).filter(f => f);
    let minFecha = '';
    let maxFecha = '';
    if (fechas.length > 0) {
        // Convertir a fechas JS para ordenar (asumimos año actual)
        const fechasJS = fechas.map(f => {
            const [d, m] = f.split('/');
            return new Date(new Date().getFullYear(), parseInt(m) - 1, parseInt(d));
        });
        const min = new Date(Math.min(...fechasJS));
        const max = new Date(Math.max(...fechasJS));
        minFecha = `${min.getDate().toString().padStart(2, '0')}/${(min.getMonth()+1).toString().padStart(2, '0')}`;
        maxFecha = `${max.getDate().toString().padStart(2, '0')}/${(max.getMonth()+1).toString().padStart(2, '0')}`;
    }
    dateRange.textContent = `${minFecha} - ${maxFecha}`;

    // Calcular mejor rendimiento diario y promedio
    const resumen = {};
    extractionData.forEach(item => {
        if (!item.fecha) return;
        if (!resumen[item.fecha]) {
            resumen[item.fecha] = { maxCiclo: 0, pesoIngreso: 0, extraido: 0 };
        }
        const ciclo = parseInt(item.nroCiclo);
        if (!isNaN(ciclo) && ciclo > resumen[item.fecha].maxCiclo) {
            resumen[item.fecha].maxCiclo = ciclo;
        }
        const ingreso = parseFloat(item.pesoIngreso);
        if (!isNaN(ingreso)) resumen[item.fecha].pesoIngreso = ingreso;
        const extraido = parseFloat(item.peso);
        if (!isNaN(extraido)) resumen[item.fecha].extraido += extraido;
    });
    let mejor = 0;
    let mejorFecha = '';
    let suma = 0;
    let cuenta = 0;
    Object.keys(resumen).forEach(fecha => {
        const ingresoTotal = resumen[fecha].pesoIngreso * resumen[fecha].maxCiclo;
        const extraido = resumen[fecha].extraido;
        if (ingresoTotal > 0) {
            const r = (extraido / ingresoTotal * 100);
            if (r > mejor) {
                mejor = r;
                mejorFecha = fecha;
            }
            suma += r;
            cuenta++;
        }
    });
    bestYield.textContent = mejor > 0 ? mejor.toFixed(2) + '% (' + mejorFecha + ')' : '';
    avgYield.textContent = cuenta > 0 ? (suma / cuenta).toFixed(2) + '%' : '';
}

// Función para filtrar datos
function filterData() {
    let filtered = [...extractionData];
    
    // Filtro por fecha
    const datePicker = document.getElementById('datePicker');
    const dateFilterValue = datePicker ? datePicker.value : 'all';
    if (dateFilterValue !== 'all') {
        const now = new Date();
        let cutoffDate;
        switch (dateFilterValue) {
            case 'last7':
                cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'last30':
                cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'last90':
                cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
        }
        if (cutoffDate) {
            filtered = filtered.filter(item => item.date >= cutoffDate);
        }
    }

    // Filtro por búsqueda
    const searchInput = document.getElementById('searchInput');
    const searchValue = searchInput ? searchInput.value.toLowerCase() : '';
    if (searchValue) {
        filtered = filtered.filter(item => 
            item.material.toLowerCase().includes(searchValue) ||
            item.observations.toLowerCase().includes(searchValue)
        );
    }

    // Filtro por variedad
    const varietyFilter = document.getElementById('varietyFilter');
    const varietyValue = varietyFilter ? varietyFilter.value : 'all';
    if (varietyValue !== 'all') {
        filtered = filtered.filter(item => (item.variedad || '').trim().toLowerCase() === varietyValue);
    }

    filteredData = filtered;
    currentPage = 1;
    displayTable();
    updatePagination();
}

// Función para ordenar datos
function sortData() {
    const sortValue = sortBy.value;
    
    filteredData.sort((a, b) => {
        switch (sortValue) {
            case 'date':
                return b.date - a.date;
            case 'yield':
                return b.yield - a.yield;
            case 'material':
                return a.material.localeCompare(b.material);
            default:
                return 0;
        }
    });
    
    displayTable();
}

// Función para mostrar tabla
function displayTable() {
    const filtered = getFilteredData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = filtered.slice(startIndex, endIndex);
    tableBody.innerHTML = '';
    pageData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.fecha || ''}</td>
            <td>${item.hora || ''}</td>
            <td>${item.loteOrigen || ''}</td>
            <td>${item.pesoIngreso !== undefined && item.pesoIngreso !== '' ? item.pesoIngreso : ''}</td>
            <td>${item.nroCiclo || ''}</td>
            <td>${item.nroExtraccion || ''}</td>
            <td>${item.peso !== undefined && item.peso !== '' ? item.peso : ''}</td>
            <td>${item.variedad || ''}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Función para actualizar paginación
function updatePagination() {
    const filtered = getFilteredData();
    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    prevPage.disabled = currentPage === 1;
    nextPage.disabled = currentPage === totalPages;
    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
}

// Función para cambiar página
function changePage(direction) {
    const filtered = getFilteredData();
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        displayTable();
        updatePagination();
    }
}

// Función para crear gráficos
function createCharts() {
    createYieldChart();
    createMaterialChart();
}

// Gráfico de rendimientos por fecha
function createYieldChart() {
    const ctx = document.getElementById('yieldChart').getContext('2d');
    
    // Agrupar datos por mes
    const monthlyData = {};
    extractionData.forEach(item => {
        const monthKey = `${item.date.getFullYear()}-${item.date.getMonth() + 1}`;
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = [];
        }
        monthlyData[monthKey].push(item.yield);
    });
    
    const labels = Object.keys(monthlyData).sort();
    const data = labels.map(key => {
        const yields = monthlyData[key];
        return (yields.reduce((sum, y) => sum + y, 0) / yields.length).toFixed(2);
    });
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.map(label => {
                const [year, month] = label.split('-');
                return `${month}/${year}`;
            }),
            datasets: [{
                label: 'Rendimiento Promedio (%)',
                data: data,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Rendimiento (%)'
                    }
                }
            }
        }
    });
}

// Gráfico de distribución de materiales
function createMaterialChart() {
    const ctx = document.getElementById('materialChart').getContext('2d');
    
    // Contar extracciones por material
    const materialCounts = {};
    extractionData.forEach(item => {
        materialCounts[item.material] = (materialCounts[item.material] || 0) + 1;
    });
    
    const colors = [
        '#667eea', '#f093fb', '#4facfe', '#43e97b', 
        '#fa709a', '#fee140', '#a8edea', '#fed6e3'
    ];
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(materialCounts),
            datasets: [{
                data: Object.values(materialCounts),
                backgroundColor: colors.slice(0, Object.keys(materialCounts).length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Funciones de utilidad
function formatDate(date) {
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function showLoading() {
    loading.style.display = 'block';
    error.style.display = 'none';
}

function hideLoading() {
    loading.style.display = 'none';
}

function showError(message) {
    loading.style.display = 'none';
    error.style.display = 'block';
    errorMessage.textContent = message;
}

// Mostrar resumen de rendimiento diario (ajustado para usar el nro de ciclo más alto del día)
function displayDailyYieldTable() {
    const filtered = getFilteredData();
    // Agrupar por fecha
    const resumen = {};
    filtered.forEach(item => {
        if (!item.fecha) return;
        if (!resumen[item.fecha]) {
            resumen[item.fecha] = {
                maxCiclo: 0,
                pesoIngreso: 0,
                extraido: 0
            };
        }
        const ciclo = parseInt(item.nroCiclo);
        if (!isNaN(ciclo) && ciclo > resumen[item.fecha].maxCiclo) {
            resumen[item.fecha].maxCiclo = ciclo;
        }
        const ingreso = parseFloat(item.pesoIngreso);
        if (!isNaN(ingreso)) {
            resumen[item.fecha].pesoIngreso = ingreso;
        }
        const extraido = parseFloat(item.peso);
        if (!isNaN(extraido)) resumen[item.fecha].extraido += extraido;
    });
    const fechas = Object.keys(resumen).sort((a, b) => {
        const [da, ma] = a.split('/');
        const [db, mb] = b.split('/');
        return new Date(2023, parseInt(ma)-1, parseInt(da)) - new Date(2023, parseInt(mb)-1, parseInt(db));
    });
    const dailyYieldBody = document.getElementById('dailyYieldBody');
    dailyYieldBody.innerHTML = '';
    fechas.forEach(fecha => {
        const ingresoTotal = resumen[fecha].pesoIngreso * resumen[fecha].maxCiclo;
        const extraido = resumen[fecha].extraido;
        const rendimiento = ingresoTotal > 0 ? (extraido / ingresoTotal * 100).toFixed(2) : '';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${fecha}</td>
            <td>${ingresoTotal}</td>
            <td>${extraido}</td>
            <td>${rendimiento}</td>
        `;
        dailyYieldBody.appendChild(row);
    });
}

// Mostrar gráfico de torta: distribución de peso extraído por variedad
function displayDailyYieldChart() {
    const filtered = getFilteredData();
    // Agrupar por variedad normalizada
    const resumen = {};
    filtered.forEach(item => {
        if (!item.variedad) return;
        const variedad = item.variedad.trim().toLowerCase();
        if (!resumen[variedad]) resumen[variedad] = 0;
        const extraido = parseFloat(item.peso);
        if (!isNaN(extraido)) resumen[variedad] += extraido;
    });
    const labels = Object.keys(resumen).map(v => v.charAt(0).toUpperCase() + v.slice(1));
    const data = Object.values(resumen);
    // Paleta de colores
    const colors = [
        '#222', '#666', '#bdbdbd', '#e57373', '#64b5f6', '#81c784', '#ffd54f', '#ba68c8', '#ff8a65', '#4dd0e1', '#f06292', '#a1887f'
    ];
    if (window.dailyYieldChartInstance) {
        window.dailyYieldChartInstance.destroy();
    }
    const ctx = document.getElementById('yieldChart').getContext('2d');
    window.dailyYieldChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Peso extraído por variedad',
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            cutout: '60%',
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: { color: '#222' }
                }
            }
        }
    });
} 