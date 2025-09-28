
    constructor() {
        this.urls = JSON.parse(localStorage.getItem('urls')) || [];
        this.settings = JSON.parse(localStorage.getItem('settings')) || {
            interval: 10,
            sslWarningDays: 30,
            enableSound: true,
            enableNotifications: true,
            enableBackground: true,
            timeout: 10,
            maxRetries: 3,
            enableSSLCheck: true,
            soundVolume: 0.5,
            showResponseTime: true,
            enableAlerts: true,
            enableHistory: true,
            maxHistory: 100,
            enableExport: true,
            enableImport: true,
            darkMode: false,
            autoRefresh: true,
            customUserAgent: 'URLMonitor/1.0',
            enableEmailAlerts: false,
            enableWebhook: false,
            enableProxyCheck: false,
            enableGeoLocation: false
        };
        this.monitorInterval = null;
        this.audioContext = null;
        this.isInspecting = false;
        this.init();
    }

    init() {
        this.setupEvents();
        this.render();
        this.requestNotifications();
        this.initAudio();
        this.startMonitoring();
        this.setupServiceWorker();
    }

    setupEvents() {
        document.getElementById('addUrlBtn').onclick = () => {
            document.getElementById('addUrlModal').classList.remove('hidden');
        };

        document.getElementById('closeModal').onclick = () => {
            document.getElementById('addUrlModal').classList.add('hidden');
        };

        document.getElementById('addUrlConfirm').onclick = () => {
            this.addUrl();
        };

        document.getElementById('settingsBtn').onclick = () => {
            this.showSettings();
        };

        document.getElementById('inspectorBtn').onclick = () => {
            document.getElementById('inspectorPanel').classList.remove('hidden');
        };

        document.getElementById('closeInspector').onclick = () => {
            document.getElementById('inspectorPanel').classList.add('hidden');
        };

        document.getElementById('closeSettings').onclick = () => {
            document.getElementById('settingsPanel').classList.add('hidden');
        };

        document.getElementById('startInspection').onclick = () => {
            this.startInspection();
        };

        document.getElementById('newUrlInput').onkeypress = (e) => {
            if (e.key === 'Enter') this.addUrl();
        };

        document.getElementById('inspectUrl').onkeypress = (e) => {
            if (e.key === 'Enter') this.startInspection();
        };

        window.onclick = (e) => {
            const modal = document.getElementById('addUrlModal');
            if (e.target === modal) modal.classList.add('hidden');
            
            const settings = document.getElementById('settingsPanel');
            if (e.target === settings) settings.classList.add('hidden');
            
            const inspector = document.getElementById('inspectorPanel');
            if (e.target === inspector) inspector.classList.add('hidden');
        };
    }

    addUrl() {
        const urlInput = document.getElementById('newUrlInput');
        const nameInput = document.getElementById('urlNameInput');
        const url = urlInput.value.trim();
        const name = nameInput.value.trim();
        
        if (!url) {
            this.showAlert('Please enter a valid URL');
            return;
        }

        let formattedUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            formattedUrl = 'https://' + url;
        }

        const urlObj = {
            id: Date.now(),
            url: formattedUrl,
            name: name || formattedUrl,
            status: 'checking',
            lastCheck: null,
            responseTime: 0,
            uptime: 100,
            sslExpiry: null,
            ssl
