window.Tracking = {
            config: {
                            endpoint: 'https://script.google.com/macros/s/AKfycbxDdUgCRftItXRP7NWlLgbVFRcid8lnrJt3SdKPFtxsZCk-0s5BJww6ijYL27QGx_g/usercopy'
            },
            track: function(linkName, linkType, description) {
                            var data = {
                                                timestamp: new Date().toISOString(),
                                                button_name: linkName,
                                                link_type: linkType,
                                                description: description,
                                                browser: 'Browser',
                                                os: 'OS',
                                                resolution: window.screen.width + 'x' + window.screen.height,
                                                timezone: 'UTC',
                                                page_origin: window.location.href
                            };
                            console.log('Enviando para Analytics:', data);
                            fetch(this.config.endpoint, {
                                                method: 'POST',
                                                headers: {'Content-Type': 'application/json'},
                                                body: JSON.stringify(data)
                            })
                            .then(function(response) {
                                                console.log('Dados enviados com sucesso!');
                            })
                            .catch(function(error) {
                                                console.error('Erro ao enviar:', error);
                            });
            }
};
