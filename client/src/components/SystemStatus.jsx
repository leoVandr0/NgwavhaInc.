import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';

const SystemStatus = () => {
    const [status, setStatus] = useState('checking'); // 'operational', 'degraded', 'down', 'checking'
    const [checks, setChecks] = useState([]);
    const [lastChecked, setLastChecked] = useState(null);

    useEffect(() => {
        checkSystemHealth();
        const interval = setInterval(checkSystemHealth, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const checkSystemHealth = async () => {
        setStatus('checking');
        const newChecks = [];

        try {
            // Check API connectivity
            const apiStart = Date.now();
            const apiResponse = await fetch('/api/health', { 
                method: 'GET',
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });
            const apiLatency = Date.now() - apiStart;
            
            newChecks.push({
                name: 'API',
                status: apiResponse.ok ? (apiLatency < 1000 ? 'operational' : 'degraded') : 'down',
                latency: apiLatency,
                details: apiResponse.ok ? `${apiLatency}ms` : 'No response'
            });
        } catch (error) {
            newChecks.push({
                name: 'API',
                status: 'down',
                details: 'Connection failed'
            });
        }

        // Check database connectivity (via API endpoint)
        try {
            const dbStart = Date.now();
            const dbResponse = await fetch('/api/health/database', { 
                method: 'GET',
                signal: AbortSignal.timeout(3000)
            });
            const dbLatency = Date.now() - dbStart;
            
            newChecks.push({
                name: 'Database',
                status: dbResponse.ok ? (dbLatency < 500 ? 'operational' : 'degraded') : 'down',
                latency: dbLatency,
                details: dbResponse.ok ? `${dbLatency}ms` : 'Connection failed'
            });
        } catch (error) {
            newChecks.push({
                name: 'Database',
                status: 'down',
                details: 'Connection failed'
            });
        }

        // Check authentication service
        try {
            const authResponse = await fetch('/api/health/auth', { 
                method: 'GET',
                signal: AbortSignal.timeout(3000)
            });
            
            newChecks.push({
                name: 'Auth Service',
                status: authResponse.ok ? 'operational' : 'down',
                details: authResponse.ok ? 'Working' : 'Service unavailable'
            });
        } catch (error) {
            newChecks.push({
                name: 'Auth Service',
                status: 'down',
                details: 'Service unavailable'
            });
        }

        // Check payment service (PayNow/Stripe)
        try {
            const paymentResponse = await fetch('/api/health/payments', { 
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
            
            newChecks.push({
                name: 'Payment Service',
                status: paymentResponse.ok ? 'operational' : 'down',
                details: paymentResponse.ok ? 'Gateways available' : 'Payment services down'
            });
        } catch (error) {
            newChecks.push({
                name: 'Payment Service',
                status: 'down',
                details: 'Payment services unavailable'
            });
        }

        // Check file upload service
        try {
            const uploadResponse = await fetch('/api/health/uploads', { 
                method: 'GET',
                signal: AbortSignal.timeout(3000)
            });
            
            newChecks.push({
                name: 'File Uploads',
                status: uploadResponse.ok ? 'operational' : 'down',
                details: uploadResponse.ok ? 'Storage available' : 'Storage issues'
            });
        } catch (error) {
            newChecks.push({
                name: 'File Uploads',
                status: 'degraded', // Less critical, so degraded instead of down
                details: 'Storage limited'
            });
        }

        // Check CDN/Static assets
        try {
            const cdnStart = Date.now();
            const img = new Image();
            const cdnPromise = new Promise((resolve, reject) => {
                img.onload = () => resolve(Date.now() - cdnStart);
                img.onerror = reject;
                img.src = '/favicon.ico';
                setTimeout(() => reject(new Error('Timeout')), 3000);
            });
            const cdnLatency = await cdnPromise;
            
            newChecks.push({
                name: 'CDN',
                status: cdnLatency < 1000 ? 'operational' : 'degraded',
                latency: cdnLatency,
                details: `${cdnLatency}ms`
            });
        } catch (error) {
            newChecks.push({
                name: 'CDN',
                status: 'degraded',
                details: 'Slow loading'
            });
        }

        setChecks(newChecks);
        setLastChecked(new Date());

        // Determine overall status
        const downServices = newChecks.filter(check => check.status === 'down');
        const degradedServices = newChecks.filter(check => check.status === 'degraded');
        
        if (downServices.length > 0) {
            setStatus('down');
        } else if (degradedServices.length > 2) {
            setStatus('degraded');
        } else {
            setStatus('operational');
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'operational':
                return <CheckCircle size={10} className="text-green-500" />;
            case 'degraded':
                return <AlertTriangle size={10} className="text-yellow-500" />;
            case 'down':
                return <XCircle size={10} className="text-red-500" />;
            case 'checking':
                return <Loader2 size={10} className="text-blue-500 animate-spin" />;
            default:
                return <CheckCircle size={10} className="text-green-500" />;
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'operational':
                return 'All Systems Operational';
            case 'degraded':
                return 'Some Systems Degraded';
            case 'down':
                return 'System Issues Detected';
            case 'checking':
                return 'Checking Systems...';
            default:
                return 'All Systems Operational';
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'operational':
                return 'text-green-500';
            case 'degraded':
                return 'text-yellow-500';
            case 'down':
                return 'text-red-500';
            case 'checking':
                return 'text-blue-500';
            default:
                return 'text-green-500';
        }
    };

    const getTooltipText = () => {
        if (checks.length === 0) return 'Checking system health...';
        
        const operational = checks.filter(c => c.status === 'operational').length;
        const degraded = checks.filter(c => c.status === 'degraded').length;
        const down = checks.filter(c => c.status === 'down').length;
        
        let tooltip = `System Status:\n`;
        if (operational > 0) tooltip += `✓ ${operational} Operational\n`;
        if (degraded > 0) tooltip += `⚠ ${degraded} Degraded\n`;
        if (down > 0) tooltip += `✗ ${down} Down\n`;
        
        if (lastChecked) {
            tooltip += `\nLast checked: ${lastChecked.toLocaleTimeString()}`;
        }
        
        return tooltip;
    };

    return (
        <div 
            className="flex items-center gap-2 px-3 py-1 bg-dark-900 rounded-full border border-dark-800 hover:border-dark-700 transition-all duration-300 cursor-pointer group"
            title={getTooltipText()}
            onClick={() => {
                // Optional: Show detailed status modal
                console.log('System checks:', checks);
            }}
        >
            <div className={`w-1.5 h-1.5 rounded-full ${status === 'checking' ? 'bg-blue-500' : 'bg-green-500'} ${status === 'operational' ? 'animate-pulse' : status === 'checking' ? 'animate-spin' : ''}`}></div>
            <span className={`text-xs font-medium ${getStatusColor()} transition-colors duration-300`}>
                {getStatusText()}
            </span>
            
            {/* Optional: Show detailed status on hover */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
                <div className="bg-dark-800 border border-dark-700 rounded-lg p-3 min-w-48">
                    <div className="text-xs space-y-1">
                        {checks.map((check, index) => (
                            <div key={index} className="flex justify-between items-center gap-2">
                                <span className="text-dark-300">{check.name}:</span>
                                <span className={`text-xs ${
                                    check.status === 'operational' ? 'text-green-500' :
                                    check.status === 'degraded' ? 'text-yellow-500' :
                                    'text-red-500'
                                }`}>
                                    {check.details}
                                </span>
                            </div>
                        ))}
                        {lastChecked && (
                            <div className="text-dark-500 text-xs pt-1 border-t border-dark-700">
                                Last: {lastChecked.toLocaleTimeString()}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemStatus;
