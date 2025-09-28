
class Notifications {
    constructor(urlMonitor) {
        this.urlMonitor = urlMonitor;
        this.audioContext = null;
        this.soundBuffers = {};
        this.initAudio();
    }

    async initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            await this.loadSounds();
        } catch (error) {
            console.log('Audio initialization failed:', error);
        }
    }

    async loadSounds() {
        // Create simple beep sounds using Web Audio API
        await this.createBeepSound('alert', 800, 0.3); // High pitch for alerts
        await this.createBeepSound('success', 400, 0.2); // Lower pitch for success
        await this.createBeepSound('warning', 600, 0.25); // Medium pitch for warnings
    }

    async createBeepSound(name, frequency, duration) {
        const sampleRate = this.audioContext.sampleRate;
        const numSamples = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        const channelData = buffer.getChannelData(0);

        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            channelData[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 3);
        }

        this.soundBuffers[name] = buffer;
    }

    playSound(soundType = 'alert') {
        if (!this.urlMonitor.settings.enableSound || !this.audioContext || !this.soundBuffers[soundType]) {
            return;
        }

        try {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = this.soundBuffers[soundType];
            gainNode.gain.value = this.urlMonitor.settings.soundVolume || 0.5;
            
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            source.start();
        } catch (error) {
            console.log('Sound playback failed:', error);
        }
    }

    async showNotification(title, message, type = 'info') {
        // Browser notification
        if (this.urlMonitor.settings.enableNotifications && 'Notification' in window) {
            if (Notification.permission === 'granted') {
                const icon = this.getNotificationIcon(type);
                new Notification(title, {
                    body: message,
                    icon: icon,
                    tag: 'url-monitor',
                    requireInteraction: type === 'error'
                });
            }
        }

        // Visual popup notification
        this.showPopupNotification(title, message, type);
        
        // Play sound
        this.playSound(type === 'error' ? 'alert' : type === 'success' ? 'success' : 'warning');
    }

    showPopupNotification(title, message, type) {
        // Create popup notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${this.getNotificationEmoji(type)}</div>
                <div class="notification-text">
                    <strong>${title}</strong>
                    <p>${message}</p>
                </div>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);
