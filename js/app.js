
class URLMonitor {
    constructor() {
        this.urls = JSON.parse(localStorage.getItem('monitorUrls')) || [];
        this.settings = JSON.parse(localStorage.getItem('monitorSettings')) || this.getDefaultSettings();
        this.isMonitoring = false;
        this.monitorInterval = null;
        this.audioContext = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderURLs();
        this.updateStats();
        this.startMonitoring();
        this.requestNotificationPermission();
    }

    getDefaultSettings() {
        return {
            monitorInterval: 10,
            sslWarningDays: 30,
            enableSound: true,
            enableNotifications: true,
            enableBackground: true,
            maxRetries: 3,
            timeout: 10,
            enableSSLCheck: true,
            soundVolume: 0.5,
            darkMode: false,
            autoRefresh: true,
            showResponseTime: true,
            enableAlerts: true,
            enableHistory: true,
            maxHistory: 100,
            enableExport: true,
            enableImport: true,
            customAlertSound: 'default',
            enableEmailAlerts: false,
            emailAddress: '',
            enableWebhook: false
        };
    }

    setupEventListeners() {
        // Add URL button
        document.getElementById('addUrlBtn').addEventListener('click', () => {
            document.getElementById('addUrlModal').classList.remove('hidden');
        });

        // Close modal
        document.getElementById('closeModal').addEventListener('click', () => {
            document.getElementById('addUrlModal').classList.add('hidden');
        });

        // Add URL confirm
        document.getElementById('addUrlConfirm').addEventListener('click', () => {
            this.addURL();
        });

        // Settings button
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.openSettings();
        });

        // Inspector button
        document.getElementById('inspectorBtn').addEventListener('click', () => {
            document.getElementById('inspectorPanel').classList.remove('hidden');
        });

        // Close inspector
        document.getElementById('closeInspector').addEventListener('click', () => {
            document.getElementById('inspectorPanel').classList.add('hidden');
        });

        // Start inspection
        document.getElementById('startInspection').addEventListener('click', () => {
            this.startAutoInspection();
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('addUrlModal');
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });

        // Enter key for adding URL
        document.getElementById('newUrlInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addURL();
            }
        });
    }

    addURL() {
        const urlInput = document.getElementById('newUrlInput');
        const nameInput = document.getElementById('urlNameInput');
        const url = urlInput.value.trim();
        const name = nameInput.value.trim();

        if (!url) {
            this.showAlert('Please enter a valid URL', 'error');
            return;
        }

        // Add https:// if no protocol specified
        let formattedURL = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            formattedURL = 'https://' + url;
        }

        const newURL = {
            id: Date.now(),
            url: formattedURL,
            name: name || formattedURL,
            status: 'pending',
            response
