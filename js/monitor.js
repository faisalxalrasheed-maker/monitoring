
class Monitor {
    constructor(urlMonitor) {
        this.urlMonitor = urlMonitor;
    }

    async checkURL(urlObj) {
        const startTime = Date.now();
        
        try {
            // Use fetch with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.urlMonitor.settings.timeout);
            
            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(urlObj.url)}`, {
                signal: controller.signal,
                method: 'GET'
            });
            
            clearTimeout(timeoutId);
            const responseTime = Date.now() - startTime;
            
            // Parse the response
            const data = await response.json();
            const statusCode = data.status?.http_code || response.status;
            
            // Determine if URL is up based on your criteria (200, 401, 403)
            const isUp = [200, 401, 403].includes(statusCode);
            
            urlObj.status = isUp ? 'up' : 'down';
            urlObj.statusCode = statusCode;
            urlObj.responseTime = responseTime;
            urlObj.lastCheck = new Date().toISOString();
            
            // Update uptime calculation
            this.updateUptime(urlObj, isUp);
            
            // Check SSL if enabled
            if (this.urlMonitor.settings.enableSSLCheck) {
                await this.checkSSL(urlObj);
            }
            
            // Trigger alerts if status changed
            this.checkForAlerts(urlObj, isUp);
            
        } catch (error) {
            urlObj.status = 'down';
            urlObj.statusCode = 0;
            urlObj.responseTime = Date.now() - startTime;
            urlObj.lastCheck = new Date().toISOString();
            urlObj.error = error.message;
            
            this.updateUptime(urlObj, false);
            this.checkForAlerts(urlObj, false);
        }
        
        return urlObj;
    }

    async checkSSL(urlObj) {
        try {
            // Extract hostname from URL
            const hostname = new URL(urlObj.url).hostname;
            
            // Use a simple SSL checker API
            const response = await fetch(`https://api.ssllabs.com/api/v3/analyze?host=${hostname}&publish=off&startNew=off&all=done`);
            const data = await response.json();
            
            if (data.endpoints && data.endpoints.length > 0) {
                const endpoint = data.endpoints[0];
                if (endpoint.details && endpoint.details.cert) {
                    const cert = endpoint.details.cert;
                    const expiryDate = new Date(cert.notAfter);
                    const daysUntilExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
                    
                    urlObj.sslExpiry = expiryDate.toISOString();
                    urlObj.sslDaysLeft = daysUntilExpiry;
                    
                    // Check if SSL is expiring soon
                    if (daysUntilExpiry <= this.urlMonitor.settings.sslWarningDays) {
                        this.triggerSSLAlert(urlObj, daysUntilExpiry);
                    }
                }
            }
        } catch (error) {
            console.log('SSL check failed:', error.message);
            // Fallback method - just check if HTTPS is accessible
            if (urlObj.url.startsWith('https://') && urlObj.status === 'up') {
                urlObj.sslStatus = 'active';
            }
        }
    }
