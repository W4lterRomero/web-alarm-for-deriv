// Evento 'install': se ejecuta cuando el Service Worker se instala
self.addEventListener('install', (event) => {
    console.log('Service Worker instalado.');
    // Precache assets si es necesario, en caso de un PWA
});

// Evento 'activate': se ejecuta cuando el Service Worker se activa
self.addEventListener('activate', (event) => {
    console.log('Service Worker activado.');
    // Limpiar el cache viejo si es necesario
});

// Evento 'push': maneja las notificaciones push
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || '¡Alerta de Trading!';
    const body = data.body || 'El precio ha alcanzado el nivel que esperabas.';
    const icon = data.icon || 'alarm-icon.png';

    // Crear las opciones de la notificación
    const options = {
        body: body,
        icon: icon,
        badge: 'icon-badge.png',  // Icono que aparece en la barra de notificación
        vibrate: [100, 50, 100],  // Vibración para dispositivos compatibles
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };

    // Mostrar la notificación
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Evento 'notificationclick': cuando el usuario hace clic en la notificación
self.addEventListener('notificationclick', (event) => {
    console.log('Notificación clickeada:', event.notification);

    event.notification.close(); // Cerrar la notificación

    // Abrir una pestaña o enfocar la página si está abierta
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            if (clientList.length > 0) {
                const client = clientList[0];
                return client.focus();
            }
            return clients.openWindow('/');  // Cambiar la URL según tu sitio
        })
    );
});
