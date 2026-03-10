/**
 * Tracking System - Versão Simplificada
 */

const Tracking = {
    config: {
        endpoint: 'COLOQUE_AQUI_A_URL_DO_SEU_GOOGLE_APPS_SCRIPT'
    },

    getDeviceInfo: function() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        let os = 'Unknown';

        if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
        else if (ua.indexOf('Safari') > -1) browser = 'Safari';
        else if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
        else if (ua.indexOf('Edge') > -1) browser = 'Edge';

        if (ua.indexOf('Windows') > -1) os = 'Windows';
        else if (ua.indexOf('Mac') > -1) os = 'macOS';
        else if (ua.indexOf('Linux') > -1) os = 'Linux';
        else if (ua.indexOf('Android') > -1) os = 'Android';
        else if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) os = 'iOS';

        return {
            browser: browser,
            os: os,
            resolution: window.screen.width + 'x' + window.screen.height,
            timezone: new Date().toString().match(/\([^)]+\)/)[0]
        };
    },

    track: function(linkName, linkType, description) {
        if (!this.config.endpoint || this.config.endpoint.indexOf('COLOQUE') > -1) {
            console.warn('Analytics endpoint nao configurado');
            return;
        }

        const deviceInfo = this.getDeviceInfo();
        const data = {
            timestamp: new Date().toISOString(),
            button_name: linkName,
            link_type: linkType,
            description: description,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            resolution: deviceInfo.resolution,
            timezone: deviceInfo.timezone,
            page_origin: window.location.href
        };

        console.log('Enviando para Analytics:', data);

        fetch(this.config.endpoint, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
        .then(function(response) {
            console.log('Dados enviados com sucesso!', response);
        })
        .catch(function(error) {
            console.error('Erro ao enviar dados:', error);
        });
    }
};
