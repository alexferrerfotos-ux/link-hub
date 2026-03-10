/**
 * Tracking System
 * Sistema completo de rastreamento de eventos
 */

const Tracking = (() => {
    // Configurações
    const CONFIG = {
        API_ENDPOINT: 'https://script.google.com/macros/d/{APPS_SCRIPT_ID}/usercallback',
        DEBOUNCE_TIME: 1000, // 1 segundo
        DEBUG: false
    };

    // Estado
    let lastEventTime = 0;
    let isOnline = navigator.onLine;

    // Fila de eventos para quando offline
    let eventQueue = JSON.parse(localStorage.getItem('event_queue')) || [];

    // ==================== HELPERS ====================

    const log = (msg, data) => {
        if (CONFIG.DEBUG) {
            console.log(`[Tracking] ${msg}`, data || '');
        }
    };

    const validateData = (data) => {
        // Validação básica
        if (!data || typeof data !== 'object') return false;
        if (!data.event_type) return false;
        return true;
    };

    const isSpam = () => {
        const now = Date.now();
        if (now - lastEventTime < CONFIG.DEBOUNCE_TIME) {
            return true;
        }
        lastEventTime = now;
        return false;
    };

    const getDeviceInfo = () => {
        const ua = navigator.userAgent;
        let browserName = 'Unknown';
        let osName = 'Unknown';
        let deviceType = 'desktop';

        // Detecção de Browser
        if (ua.indexOf('Firefox') > -1) browserName = 'Firefox';
        else if (ua.indexOf('Chrome') > -1) browserName = 'Chrome';
        else if (ua.indexOf('Safari') > -1) browserName = 'Safari';
        else if (ua.indexOf('Edge') > -1) browserName = 'Edge';
        else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) browserName = 'Opera';

        // Detecção de OS
        if (ua.indexOf('Win') > -1) osName = 'Windows';
        else if (ua.indexOf('Mac') > -1) osName = 'macOS';
        else if (ua.indexOf('Linux') > -1) osName = 'Linux';
        else if (ua.indexOf('Android') > -1) osName = 'Android';
        else if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) osName = 'iOS';

        // Detecção de Device Type
        if (ua.indexOf('Mobile') > -1 || ua.indexOf('Android') > -1) deviceType = 'mobile';
        else if (ua.indexOf('iPad') > -1 || ua.indexOf('Tablet') > -1) deviceType = 'tablet';

        return {
            user_agent: ua,
            browser: browserName,
            os: osName,
            device_type: deviceType,
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language || 'unknown',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown'
        };
    };

    const getSessionId = () => {
        let sessionId = sessionStorage.getItem('tracking_session_id');
        if (!sessionId) {
            sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('tracking_session_id', sessionId);
        }
        return sessionId;
    };

    const getVisitorId = () => {
        let visitorId = localStorage.getItem('tracking_visitor_id');
        if (!visitorId) {
            visitorId = 'vis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('tracking_visitor_id', visitorId);
        }
        return visitorId;
    };

    const getUTMParams = () => {
        return UTM.getAll();
    };

    // ==================== CONSTRUIR EVENTO ====================

    const buildEvent = (eventType, customData = {}) => {
        const event = {
            // Informações básicas
            timestamp: new Date().toISOString(),
            event_type: eventType,
            page_url: window.location.href,
            referrer: document.referrer || 'direct',

            // Identificação
            visitor_id: getVisitorId(),
            session_id: getSessionId(),

            // UTM Parameters
            ...getUTMParams(),

            // Device Info
            ...getDeviceInfo(),

            // Custom Data
            ...customData,

            // Versão do sistema
            version: '1.0.0'
        };

        return event;
    };

    // ==================== ENVIAR EVENTO ====================

    const send = (event, callback = null) => {
        if (!isOnline) {
            log('Offline - adicionando à fila', event);
            eventQueue.push(event);
            localStorage.setItem('event_queue', JSON.stringify(eventQueue));
            if (callback) callback();
            return;
        }

        const payload = JSON.stringify(event);

        log('Enviando evento', event);

        // Usar fetch com timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        fetch(CONFIG.API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: payload,
            signal: controller.signal
        })
        .then(response => {
            clearTimeout(timeout);
            if (response.ok) {
                log('Evento enviado com sucesso', event);
                if (callback) callback();
            } else {
                throw new Error('Response not ok');
            }
        })
        .catch(error => {
            clearTimeout(timeout);
            log('Erro ao enviar evento', error);
            // Adicionar à fila para retry
            eventQueue.push(event);
            localStorage.setItem('event_queue', JSON.stringify(eventQueue));
        });
    };

    // ==================== ENVIAR FILA ====================

    const sendQueue = () => {
        if (!isOnline || eventQueue.length === 0) return;

        log(`Enviando ${eventQueue.length} eventos da fila`, eventQueue);

        const queue = [...eventQueue];
        eventQueue = [];
        localStorage.setItem('event_queue', JSON.stringify(eventQueue));

        queue.forEach(event => {
            setTimeout(() => send(event), 100);
        });
    };

    // ==================== ONLINE/OFFLINE ====================

    window.addEventListener('online', () => {
        isOnline = true;
        log('Online - enviando fila');
        sendQueue();
    });

    window.addEventListener('offline', () => {
        isOnline = false;
        log('Offline - eventos serão enviados depois');
    });

    // ==================== PUBLIC API ====================

    return {
        trackEvent: (eventType, customData = {}, callback = null) => {
            // Anti-spam
            if (isSpam() && eventType !== 'page_view') {
                return;
            }

            // Validação
            if (!eventType) {
                console.error('Event type is required');
                return;
            }

            const event = buildEvent(eventType, customData);
            send(event, callback);
        },

        setAPIEndpoint: (endpoint) => {
            CONFIG.API_ENDPOINT = endpoint;
        },

        setDebug: (enabled) => {
            CONFIG.DEBUG = enabled;
        },

        getVisitorId,
        getSessionId,
        getUTMParams,
        sendQueue
    };
})();

// Verificar fila ao carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Tracking.sendQueue);
} else {
    Tracking.sendQueue();
}
