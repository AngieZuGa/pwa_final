// EJEMPLOS DE CÓDIGO REUTILIZABLE PARA LA PWA
// Copia y pega en app.js según necesites

// ============================================
// 1. CARGAR DATOS DESDE DIFERENTES APIs
// ============================================

// Ejemplo 1: Cargar clima (Open-Meteo API - Sin autenticación)
async function loadWeather() {
    try {
        const response = await fetch(
            'https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&current_weather=true'
        );
        const data = await response.json();
        console.log('Clima:', data.current_weather);
        return data.current_weather;
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al cargar clima', 'error');
    }
}

// Ejemplo 2: Cargar información de país
async function loadCountryInfo(countryName) {
    try {
        const response = await fetch(
            `https://restcountries.com/v3.1/name/${countryName}`
        );
        const data = await response.json();
        console.log('País:', data[0]);
        return data[0];
    } catch (error) {
        console.error('Error:', error);
        showToast('País no encontrado', 'error');
    }
}

// Ejemplo 3: Cargar Pokémon (PokéAPI)
async function loadPokemon(name) {
    try {
        const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`
        );
        const data = await response.json();
        console.log('Pokémon:', data);
        return data;
    } catch (error) {
        console.error('Error:', error);
        showToast('Pokémon no encontrado', 'error');
    }
}

// Ejemplo 4: Cargar criptomonedas (CoinGecko)
async function loadCryptoPrice(cryptoId = 'bitcoin') {
    try {
        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd,eur`
        );
        const data = await response.json();
        console.log('Precio:', data);
        return data;
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al cargar cripto', 'error');
    }
}

// ============================================
// 2. MANIPULAR DATOS CON FILTROS
// ============================================

// Filtrar array de objetos
function filterData(array, key, value) {
    return array.filter(item => item[key] === value);
}

// Buscar en array
function searchData(array, query) {
    return array.filter(item =>
        Object.values(item).some(val =>
            String(val).toLowerCase().includes(query.toLowerCase())
        )
    );
}

// Ordenar array
function sortData(array, key, direction = 'asc') {
    return [...array].sort((a, b) => {
        if (direction === 'asc') {
            return a[key] > b[key] ? 1 : -1;
        }
        return a[key] < b[key] ? 1 : -1;
    });
}

// ============================================
// 3. ALMACENAMIENTO LOCAL
// ============================================

// Guardar en localStorage
function saveLocal(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        console.log('✓ Guardado en local:', key);
    } catch (error) {
        console.error('Error al guardar:', error);
    }
}

// Cargar de localStorage
function loadLocal(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error al cargar:', error);
        return defaultValue;
    }
}

// Eliminar de localStorage
function removeLocal(key) {
    try {
        localStorage.removeItem(key);
        console.log('✓ Eliminado de local:', key);
    } catch (error) {
        console.error('Error al eliminar:', error);
    }
}

// ============================================
// 4. CREAR ELEMENTOS HTML DINÁMICAMENTE
// ============================================

// Crear tarjeta genérica
function createCard(title, content, id = '') {
    const card = document.createElement('div');
    card.className = 'card';
    if (id) card.id = id;
    card.innerHTML = `
        <h3>${title}</h3>
        <p>${content}</p>
    `;
    return card;
}

// Crear grid de elementos
function createGrid(items, itemRenderer, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    items.forEach(item => {
        const element = itemRenderer(item);
        container.appendChild(element);
    });
}

// Crear tabla
function createTable(data, headers) {
    const table = document.createElement('table');
    table.className = 'table';
    
    // Headers
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Body
    const tbody = document.createElement('tbody');
    data.forEach(row => {
        const tr = document.createElement('tr');
        Object.values(row).forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    
    return table;
}

// ============================================
// 5. VALIDACIÓN DE FORMULARIOS
// ============================================

// Validar email
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Validar número
function validateNumber(value) {
    return !isNaN(value) && value !== '';
}

// Validar URL
function validateURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Validar formulario
function validateForm(formData) {
    const errors = [];
    
    if (!formData.name || formData.name.trim() === '') {
        errors.push('Nombre es requerido');
    }
    
    if (!validateEmail(formData.email)) {
        errors.push('Email inválido');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// ============================================
// 6. UTILIDADES DE TIEMPO
// ============================================

// Formatear fecha
function formatDate(date) {
    return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Tiempo relativo (hace 2 horas)
function formatTimeAgo(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `hace ${days}d`;
    if (hours > 0) return `hace ${hours}h`;
    if (minutes > 0) return `hace ${minutes}m`;
    return 'ahora';
}

// ============================================
// 7. MANEJO DE ERRORES
// ============================================

// Fetch con reintentos
async function fetchWithRetry(url, options = {}, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) return response;
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

// Error handler
function handleError(error, context = '') {
    console.error(`Error ${context}:`, error);
    const message = error.message || 'Error desconocido';
    showToast(`✗ ${message}`, 'error');
}

// ============================================
// 8. BÚSQUEDA Y AUTOCOMPLETADO
// ============================================

// Función de debounce para búsqueda
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

// Autocompletado
const searchInput = document.querySelector('#search');
if (searchInput) {
    searchInput.addEventListener('input', debounce(async (e) => {
        const query = e.target.value;
        if (query.length < 2) return;
        
        // Tu lógica de búsqueda
        console.log('Buscando:', query);
    }, 300));
}

// ============================================
// 9. NOTIFICACIONES MEJORADAS
// ============================================

// Toast con opciones
function showNotification(message, options = {}) {
    const {
        type = 'info',
        duration = 3000,
        position = 'bottom-left'
    } = options;
    
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// ============================================
// 10. UTILIDADES GENERALES
// ============================================

// Generar ID único
function generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Copiar al portapapeles
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('✓ Copiado al portapapeles', 'success');
    });
}

// Descargar JSON
function downloadJSON(data, filename = 'data.json') {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
}

// Detectar dispositivo
function getDevice() {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'android';
    if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
    return 'desktop';
}

console.log('✓ Códigos de ejemplo cargados. Úsalos en app.js');
