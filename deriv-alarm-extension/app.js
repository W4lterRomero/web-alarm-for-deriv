// Variables globales
let ws;
let alarms = [];

// Elementos del DOM
const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const symbolSelect = document.getElementById('symbolSelect');
const statusDiv = document.getElementById('connectionStatus');
const currentPrice = document.getElementById('currentPrice');
const pricesDiv = document.getElementById('prices');
const targetPriceInput = document.getElementById('targetPrice');
const addAlarmBtn = document.getElementById('addAlarmBtn');
const alarmsList = document.getElementById('alarmsList');
const alarmSound = document.getElementById('alarmSound');

// Registrar el Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(registration => {
            console.log('Service Worker registrado:', registration);
        })
        .catch(error => {
            console.error('Error al registrar el Service Worker:', error);
        });
}

// Solicitar permisos de notificación
if (Notification.permission !== 'granted') {
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            console.log('Permiso de notificaciones concedido.');
        } else {
            console.warn('Permiso de notificaciones denegado.');
        }
    });
}

// Función para conectarse al WebSocket
function connect() {
    const symbol = symbolSelect.value;

    // Cerrar WebSocket existente si hay uno
    if (ws) {
        ws.close();
    }

    // Crear nueva conexión WebSocket
    ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');

    ws.onopen = () => {
        console.log('Conectado al WebSocket');
        statusDiv.textContent = 'Conectado';
        statusDiv.className = 'status connected';

        // Suscribirse al símbolo seleccionado
        ws.send(JSON.stringify({
            ticks: symbol,
            subscribe: 1
        }));
    };

    ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        console.log('Respuesta WebSocket:', response);  // Agrega este log para ver la respuesta completa
    
        if (response.error) {
            console.error('Error:', response.error.message);
            pricesDiv.innerHTML = `<div class="error">Error: ${response.error.message}</div>` + pricesDiv.innerHTML;
            return;
        }
    
        if (response.tick) {
            const price = response.tick.quote;
            const timestamp = new Date(response.tick.epoch * 1000).toLocaleTimeString();
        
            // Mostrar el precio actual en el elemento currentPrice
            currentPrice.textContent = `Precio actual: ${price}`;
        
            // Actualizar historial de precios (con limitación a 10)
            updatePriceHistory(price, timestamp);
        
            // Verificar alarmas
            checkAlarms(price);
        }
        
        if (response.tick) {
            const price = response.tick.quote;
            const timestamp = new Date(response.tick.epoch * 1000).toLocaleTimeString();
            console.log('Precio recibido:', price);  // Agrega este log para verificar el precio
    
            // Actualizar historial de precios (con limitación a 10)
            updatePriceHistory(price, timestamp);
    
            // Verificar alarmas
            checkAlarms(price);
        }
    };
    

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        statusDiv.textContent = 'Error: ' + error.message;
        statusDiv.className = 'status disconnected';
    };

    ws.onclose = () => {
        console.log('WebSocket cerrado');
        statusDiv.textContent = 'Desconectado';
        statusDiv.className = 'status disconnected';
    };
}

// Función para desconectar el WebSocket
function disconnect() {
    if (ws) {
        ws.close();
        ws = null;
    }
}

// Función para agregar una alarma
function addAlarm() {
    const price = parseFloat(targetPriceInput.value);
    const condition = document.querySelector('input[name="condition"]:checked').value;

    if (!price || isNaN(price)) {
        alert('Por favor, ingresa un precio válido.');
        return;
    }

    const alarm = { price, condition, id: Date.now() };
    alarms.push(alarm);
    renderAlarms();
}

// Función para renderizar las alarmas en la lista
function renderAlarms() {
    alarmsList.innerHTML = '';
    alarms.forEach(alarm => {
        const alarmDiv = document.createElement('div');
        alarmDiv.className = 'alarm';
        alarmDiv.innerHTML = `
            <span>${alarm.condition === 'greater' ? 'Mayor que' : 'Menor que'} ${alarm.price}</span>
            <button onclick="removeAlarm(${alarm.id})">Eliminar</button>
        `;
        alarmsList.appendChild(alarmDiv);
    });
}

// Función para eliminar una alarma
function removeAlarm(id) {
    alarms = alarms.filter(alarm => alarm.id !== id);
    renderAlarms();
}

// Función para verificar alarmas y enviar notificaciones
function checkAlarms(currentPrice) {
    alarms.forEach(alarm => {
        if (
            (alarm.condition === 'greater' && currentPrice > alarm.price) ||
            (alarm.condition === 'less' && currentPrice < alarm.price)
        ) {
            // Reproducir sonido de alarma
            alarmSound.play();

            // Enviar notificación al Service Worker
            if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'alarm',
                    title: '¡Alarma Activada!',
                    body: `El precio actual (${currentPrice}) cumple con la condición: ${alarm.condition === 'greater' ? 'Mayor que' : 'Menor que'} ${alarm.price}.`
                });
            } else {
                // Fallback: mostrar notificación directamente
                new Notification('¡Alarma Activada!', {
                    body: `El precio actual (${currentPrice}) cumple con la condición: ${alarm.condition === 'greater' ? 'Mayor que' : 'Menor que'} ${alarm.price}.`,
                    icon: 'alarm-icon.png'
                });
            }

            removeAlarm(alarm.id); // Eliminar alarma
        }
    });
}

// Función para manejar el clic en la notificación y mostrar una ventana emergente (modal)
function showModal(title, body) {
    const modal = document.createElement('div');
    modal.classList.add('modal');

    modal.innerHTML = `
        <div class="modal-content">
            <h2>${title}</h2>
            <p>${body}</p>
            <button id="closeModalBtn">Cerrar</button>
        </div>
    `;

    document.body.appendChild(modal);

    // Cerrar el modal cuando se haga clic en el botón
    document.getElementById('closeModalBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

// Escuchar el mensaje del Service Worker
if (navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener('message', function (event) {
        const message = event.data;
        if (message.type === 'alarm') {
            showModal(message.title, message.body);
        }
    });
}

// Crear una variable para almacenar los precios
let priceHistory = [];

// Función para actualizar el historial de precios
function updatePriceHistory(price, timestamp) {
    // Limitar el historial a los últimos 10 precios
    if (priceHistory.length >= 10) {
        priceHistory.shift(); // Elimina el primer elemento (el más antiguo)
    }

    // Agregar el nuevo precio al historial
    priceHistory.push({ price, timestamp });

    // Renderizar el historial de precios
    renderPriceHistory();
}

// Función para renderizar el historial de precios
function renderPriceHistory() {
    pricesDiv.innerHTML = ''; // Limpiar el historial actual
    priceHistory.forEach(entry => {
        const priceDiv = document.createElement('div');
        priceDiv.textContent = `${entry.timestamp}: ${entry.price}`;
        pricesDiv.appendChild(priceDiv);
    });
}

// Eventos de botones
connectBtn.addEventListener('click', connect);
disconnectBtn.addEventListener('click', disconnect);
addAlarmBtn.addEventListener('click', addAlarm);
