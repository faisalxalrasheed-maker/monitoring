
class CompleteURLMonitor {
    constructor() {
        this.urls = JSON.parse(localStorage.getItem('monitorUrls')) || [];
        this.settings = JSON.parse(localStorage.getItem('monitorSettings')) || this.getDefaultSettings();
        this.isMonitoring = false;
        this.monitorInterval = null;
        
        // Initialize components
        this.notifications = new NotificationSystem(this);
        this.inspector = new WebsiteInspector(this);
        this.settingsManager = new SettingsManager(this);
        
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
            maxHistory: 100,
            enableExport: true,
            enableImport: true,
            customUserAgent: 'URLMonitor/1.0',
            enableProxyCheck: false,
            enableGeoLocation: false
        };
    }

    init() {
        this.setupEventListeners();
        this.renderURLs();
        this.updateStats();
        this.startMonitoring();
        this.requestNotificationPermission();
        this.setupServiceWorker();
    }

    setupEventListeners() {
        // Add URL
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

        // Settings
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.openSettings();
        });

        // Inspector
        document.getElementById('inspectorBtn').addEventListener('click', () => {
            document.getElementById('inspectorPanel').classList.remove('hidden');
        });

        // Close panels
        document.getElementById('closeInspector')?.addEventListener('click', () => {
            document.getElementById('inspectorPanel').classList.add('hidden');
        });

        // Start inspection
        document.getElementById('startInspection').addEventListener('click', () => {
            const url = document.getElementById('inspectUrl').value.trim();
            if (url) {
                this.inspector.startInspection(url);
            } else {
                this.notifications.showAlert('Please enter a URL to inspect', 'warning');
            }
        });

        // Enter key support
        document.getElementById('newUrlInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addURL();
        });

        document.getElementById('inspectUrl').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const url = e.target.value.trim();
                if (url) this.inspector.startInspection(url);
            }
        });

        // Prevent app from sleeping on mobile
        this.preventSleep();
    }

    addURL() {
        const urlInput = document.getElementById('newUrlInput');
        const nameInput = document.getElementById('urlNameInput');
        const url = urlInput.value.trim();
        const name = nameInput.value.trim();

        if (!url) {
            this.
