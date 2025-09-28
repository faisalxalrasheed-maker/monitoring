
class URLMonitor {
    constructor() {
        this.urls = JSON.parse(localStorage.getItem('monitorUrls')) || [];
        this.settings = JSON.parse(localStorage.getItem('monitorSettings')) || this.getDefaultSettings();
        this.isMonitoring = false;
        this.monitorInterval = null;
        this.audioContext = null;
        
        this.init();
    }

    getDefaultSettings() {
        return {
            monitorInterval: 10,
            sslWarningDays: 30,
            enableSound: true,
            enableNotifications: true,
            enableBackground: true,
            maxRetries: 3,
            timeout: 10000,
            enableSSLCheck: true,
            soundVolume: 0.5,
            darkMode: false,
            autoRefresh: true,
            showResponseTime: true,
            enableAlerts: true,
            enableHistory: true,
            maxHistory: 100
        };
    }

    init() {
        this.setupEventListeners();
        this.renderURLs();
        this.updateStats();
        this.startMonitoring();
        this.requestNotificationPermission();
    }

    setupEventListeners() {
        document.getElementById('addUrlBtn').addEventListener('click', () => {
            document.getElementById('addUrlModal').classList.remove('hidden');
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            document.getElementById('addUrlModal').classList.add('hidden');
        });

        document.getElementById('addUrlConfirm').addEventListener('click', () => {
            this.addURL();
        });

        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.openSettings();
        });

        document.getElementById('inspectorBtn').addEventListener('click', () => {
            document.getElementById('inspectorPanel').classList.remove('hidden');
        });

        document.getElementById('closeInspector').addEventListener('click', () => {
            document.getElementById('inspectorPanel').classList.add('hidden');
        });

        document.getElementById('startInspection').addEventListener('click', () => {
            this.startAutoInspection();
        });

        document.getElementById('newUrlInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addURL();
        });
    }

    addURL() {
        const urlInput = document.getElementById('newUrlInput');
        const nameInput = document.getElementById('urlNameInput');
        const url = urlInput.value.trim();
        const name = nameInput.value.trim();

        if (!url) {
            alert('Please enter a valid URL');
            return;
        }

        let formattedURL = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            formattedURL = 'https://' + url;
        }

        const newURL = {
            id: Date.now(),
            url: formattedURL,
            name: name || formattedURL,
            status: 'pending',
            responseTime: 0,
            lastCheck: null,
            sslExpiry: null,
            uptime: 100
        };

        this.urls.push(newURL);
        this.saveURLs();
        this.renderURLs();
        this.updateStats();

        urlInput.value = '';
        nameInput.value = '';
        document.getElementById('addUrlModal').classList.add('hidden');
        
        // Check the new URL immediately
        this.checkURL(newURL);
    }

    async checkURL(urlObj) {
        const startTime = Date.now();
        
        try {
            // Using a CORS proxy for demonstration - in production, you'd need your own backend
            const
