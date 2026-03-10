/**
 * UTM Parameter Extractor
 * Extrai parâmetros UTM da URL e os armazena em localStorage
 */

const UTM = (() => {
    const PARAMS = {
        utm_source: 'utm_source',
        utm_medium: 'utm_medium',
        utm_campaign: 'utm_campaign',
        utm_content: 'utm_content',
        utm_term: 'utm_term'
    };

    const get = (key) => {
        const params = new URLSearchParams(window.location.search);
        return params.get(key) || null;
    };

    const getAll = () => {
        const result = {};
        Object.keys(PARAMS).forEach(param => {
            const value = get(param);
            if (value) {
                result[param] = value;
                sessionStorage.setItem(`tracking_${param}`, value);
            } else {
                result[param] = sessionStorage.getItem(`tracking_${param}`) || null;
            }
        });
        return result;
    };

    return {
        get,
        getAll,
        PARAMS
    };
})();
