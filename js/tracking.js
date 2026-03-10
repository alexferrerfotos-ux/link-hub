```javascript
const Tracking = {
    // Configuração
    config: {
        analyticsEndpoint: 'AKfycbxSk9O5XGFDwd3vRmh-jf6tSVMRVLw4Tov4YTF5eJHrzv3ywsIlZZDDq-UNuMfIvGndjg',
        // Exemplo: https://script.google.com/macros/s/AKfycbxSk9O5XGFDwd3vRmh-jf6tSVMRVLw4Tov4YTF5eJHrzv3ywsIlZZDDq-UNuMfIvGndjg/exec
        enableLogging: true
    },

    // Função para obter informações do dispositivo
    getDeviceInfo() {
        const ua = navigator.userAgent;

        let browser = 'Unknown';
        if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Safari')) browser = 'Safari';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Edge')) browser = 'Edge';
        else if (ua.includes('Opera')) browser = 'Opera';

        let os = 'Unknown';
        if (ua.includes('Windows')) os = 'Windows';
        else if (ua.includes('Mac')) os = 'macOS';
        else if (ua.includes('Linux')) os = 'Linux';
        else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
        else if (ua.includes('Android')) os = 'Android';

        const resolution = `${window.screen.width}x${window.screen.height}`;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        return {
            browser,
            os,
            resolution,
            timezone
        };
    },

    // Função para enviar dados para a Google Sheet
    sendToSheet(eventData) {
        if (!this.config.analyticsEndpoint) {
            if (this.config.enableLogging) {
                console.warn('Analytics endpoint não configurado');
            }
            return;
        }

        const deviceInfo = this.getDeviceInfo();

        const payload = {
            timestamp: new Date().toISOString(),
            button_name: eventData.button_name,
            link_type: eventData.link_type,
            description: eventData.description,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            resolution: deviceInfo.resolution,
            timezone: deviceInfo.timezone,
            page_origin: window.location.href
        };

        if (this.config.enableLogging) {
            console.log('📊 Enviando para Analytics:', payload);
        }

        // Envia os dados usando fetch
        fetch(this.config.analyticsEndpoint, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (this.config.enableLogging) {
                console.log('✅ Dados enviados com sucesso para a Sheet!', data);
            }
        })
        .catch(error => {
            if (this.config.enableLogging) {
                console.error('❌ Erro ao enviar dados:', error);
            }
        });
    },

    // Função para rastrear cliques nos links
    trackLinkClick(buttonName, linkType, description) {
        this.sendToSheet({
            button_name: buttonName,
            link_type: linkType,
            description: description
        });
    }
};
```
