
class Settings {
    constructor(urlMonitor) {
        this.urlMonitor = urlMonitor;
    }

    openSettingsPanel() {
        this.createSettingsHTML();
        document.getElementById('settingsPanel').classList.remove('hidden');
    }

    createSettingsHTML() {
        const settingsPanel = document.getElementById('settingsPanel');
        if (!settingsPanel) {
            // Create settings panel if it doesn't exist
            const panel = document.createElement('div');
            panel.id = 'settingsPanel';
            panel.className = 'panel hidden';
            document.body.appendChild(panel);
        }

        const settings = this.urlMonitor.settings;
        
        settingsPanel.innerHTML = `
            <div class="panel-header">
                <h2>⚙️ Settings & Features</h2>
                <button id="closeSettings" class="btn-close">×</button>
            </div>
            <div class="settings-content">
                <div class="settings-grid">
                    
                    <!-- Feature 1: Monitoring Interval -->
                    <div class="setting-group">
                        <label>1. Monitoring Interval (seconds)</label>
                        <input type="number" id="monitorInterval" min="5" max="300" value="${settings.monitorInterval}">
                        <small>How often to check URLs (5-300 seconds)</small>
                    </div>

                    <!-- Feature 2: SSL Warning Days -->
                    <div class="setting-group">
                        <label>2. SSL Certificate Warning (days)</label>
                        <input type="number" id="sslWarningDays" min="1" max="90" value="${settings.sslWarningDays}">
                        <small>Warn when SSL expires in X days</small>
                    </div>

                    <!-- Feature 3: Sound Notifications -->
                    <div class="setting-group">
                        <label>3. Sound Notifications</label>
                        <input type="checkbox" id="enableSound" ${settings.enableSound ? 'checked' : ''}>
                        <small>Play sound alerts for status changes</small>
                    </div>

                    <!-- Feature 4: Push Notifications -->
                    <div class="setting-group">
                        <label>4. Browser Notifications</label>
                        <input type="checkbox" id="enableNotifications" ${settings.enableNotifications ? 'checked' : ''}>
                        <small>Show browser push notifications</small>
                    </div>

                    <!-- Feature 5: Background Monitoring -->
                    <div class="setting-group">
                        <label>5. Background Monitoring</label>
                        <input type="checkbox" id="enableBackground" ${settings.enableBackground ? 'checked' : ''}>
                        <small>Continue monitoring when tab is inactive</small>
                    </div>

                    <!-- Feature 6: Max Retries -->
                    <div class="setting-group">
                        <label>6. Maximum Retries</label>
                        <input type="number" id="maxRetries" min="1" max="10" value="${settings.maxRetries}">
                        <small>Retry failed requests X times</small>
                    </div>

                    <!-- Feature 7: Timeout -->
                    <div class="setting-group">
                        <label>7. Request Timeout (seconds)</label>
                        <input type="number" id="timeout" min="5" max="60" value="${settings.timeout / 1000}">
                        <small>Cancel request after X seconds</small>
                    </div>

                    <!-- Feature 8: SSL Checking -->
                    <div class="setting-group">
                        <label>8. SSL Certificate Checking</label>
                        <input type="checkbox" id="enableSSLCheck" ${settings.enableSSL
