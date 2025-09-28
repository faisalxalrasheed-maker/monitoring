
class AutoInspector {
    constructor(urlMonitor) {
        this.urlMonitor = urlMonitor;
        this.foundEndpoints = new Map();
        this.isInspecting = false;
    }

    async startInspection(baseUrl) {
        if (this.isInspecting) {
            this.showMessage('Inspection already in progress...', 'warning');
            return;
        }

        this.isInspecting = true;
        this.foundEndpoints.clear();
        
        const progressBar = document.getElementById('inspectionProgress');
        const resultsDiv = document.getElementById('inspectionResults');
        
        progressBar.classList.remove('hidden');
        resultsDiv.innerHTML = '<div class="inspection-status">🔍 Starting inspection...</div>';
        
        try {
            // Normalize URL
            if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
                baseUrl = 'https://' + baseUrl;
            }
            
            const url = new URL(baseUrl);
            const domain = url.origin;
            
            // Step 1: Check robots.txt
            await this.checkRobotsTxt(domain);
            this.updateProgress(20);
            
            // Step 2: Check sitemap.xml
            await this.checkSitemap(domain);
            this.updateProgress(40);
            
            // Step 3: Scan main page for links
            await this.scanPageForLinks(baseUrl);
            this.updateProgress(60);
            
            // Step 4: Check common endpoints
            await this.checkCommonEndpoints(domain);
            this.updateProgress(80);
            
            // Step 5: Analyze and display results
            await this.analyzeResults();
            this.updateProgress(100);
            
            this.displayResults();
            
        } catch (error) {
            this.showMessage(`Inspection failed: ${error.message}`, 'error');
        } finally {
            this.isInspecting = false;
            progressBar.classList.add('hidden');
        }
    }

    async checkRobotsTxt(domain) {
        try {
            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(domain + '/robots.txt')}`);
            const data = await response.json();
            
            if (data.contents) {
                const robotsContent = data.contents;
                const lines = robotsContent.split('\n');
                
                lines.forEach(line => {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('Disallow:') || trimmed.startsWith('Allow:')) {
                        const path = trimmed.split(':')[1]?.trim();
                        if (path && path !== '/' && path !== '') {
                            this.addEndpoint(path, 'robots.txt');
                        }
                    }
                    if (trimmed.startsWith('Sitemap:')) {
                        const sitemapUrl = trimmed.split(':').slice(1).join(':').trim();
                        this.addEndpoint(sitemapUrl, 'sitemap');
                    }
                });
            }
        } catch (error) {
            console.log('Robots.txt check failed:', error.message);
        }
    }

    async checkSitemap(domain) {
        const sitemapUrls = [
            '/sitemap.xml',
            '/sitemap_index.xml',
            '/sitemap.txt',
            '/sitemapindex.xml'
        ];

        for (const sitemapPath of sitemapUrls) {
            try {
                const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(domain + sitemapPath)}`);
