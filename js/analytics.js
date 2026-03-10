/**
 * Analytics Wrapper
 * Interface simplificada para rastreamento
 */

const Analytics = (() => {
    // Rastrear visualização de página
    const trackPageView = () => {
        Tracking.trackEvent('page_view', {
            page_title: document.title,
            page_path: window.location.pathname
        });
    };

    // Rastrear clique em link
    const trackLinkClick = (linkId, linkName, destination) => {
        Tracking.trackEvent('link_click', {
            button_id: linkId,
            button_name: linkName,
            destination_url: destination,
            click_x: event?.clientX || 0,
            click_y: event?.clientY || 0
        });
    };

    // Rastrear play de vídeo
    const trackVideoPlay = (videoId, videoName) => {
        Tracking.trackEvent('video_play', {
            video_id: videoId,
            video_name: videoName
        });
    };

    // Rastrear scroll
    const trackScroll = (scrollDepth) => {
        Tracking.trackEvent('scroll', {
            scroll_depth: scrollDepth
        });
    };

    // Rastrear evento customizado
    const trackCustomEvent = (eventName, customData = {}) => {
        Tracking.trackEvent('custom_event', {
            event_name: eventName,
            ...customData
        });
    };

    // Obter dados do visitante
    const getVisitorData = () => {
        return {
            visitor_id: Tracking.getVisitorId(),
            session_id: Tracking.getSessionId(),
            utm_params: Tracking.getUTMParams()
        };
    };

    // Configurar endpoint
    const setConfig = (endpoint, debugMode = false) => {
        Tracking.setAPIEndpoint(endpoint);
        Tracking.setDebug(debugMode);
    };

    return {
        trackPageView,
        trackLinkClick,
        trackVideoPlay,
        trackScroll,
        trackCustomEvent,
        trackEvent: Tracking.trackEvent,
        getVisitorData,
        setConfig
    };
})();
