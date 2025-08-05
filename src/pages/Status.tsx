import React from 'react';
import StatusHeader from '@/components/status/StatusHeader';
import ServiceStatus from '@/components/status/ServiceStatus';
import UptimeChart from '@/components/status/UptimeChart';
import IncidentHistory from '@/components/status/IncidentHistory';
import { MadeWithDyad } from '@/components/made-with-dyad';

const StatusPage: React.FC = () => {
  // Mock data - in a real app this would come from an API
  const services = [
    {
      name: 'Website',
      status: 'operational' as const,
      description: 'Main PlayJelly website and user interface',
      uptime: '100.00'
    },
    {
      name: 'API',
      status: 'operational' as const,
      description: 'Application programming interface for third-party integrations',
      uptime: '99.95'
    },
    {
      name: 'Database',
      status: 'operational' as const,
      description: 'Primary database service for user data',
      uptime: '100.00'
    },
    {
      name: 'Authentication',
      status: 'operational' as const,
      description: 'User authentication and account management',
      uptime: '99.98'
    },
    {
      name: 'File Storage',
      status: 'operational' as const,
      description: 'Cloud storage for user files and media',
      uptime: '99.99'
    },
    {
      name: 'Email Service',
      status: 'operational' as const,
      description: 'Email delivery system for notifications',
      uptime: '99.90'
    }
  ];

  // Generate mock uptime data for the last 90 days
  const generateUptimeData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate realistic uptime values (mostly 100, occasional small dips)
      const uptime = i === 15 ? 99.85 : 
                    i === 45 ? 99.92 : 
                    Math.random() < 0.02 ? 99.95 : 100;
      
      data.push({
        date: date.toISOString().split('T')[0],
        uptime: parseFloat(uptime.toFixed(2))
      });
    }
    
    return data;
  };

  const uptimeData = generateUptimeData();

  const incidents = [
    {
      id: '1',
      title: 'Intermittent API Latency',
      status: 'resolved' as const,
      createdAt: '2023-05-15T10:30:00Z',
      updatedAt: '2023-05-15T14:45:00Z',
      description: 'Some users experienced slower than usual API response times. Issue has been resolved.'
    },
    {
      id: '2',
      title: 'Email Delivery Delays',
      status: 'resolved' as const,
      createdAt: '2023-04-22T08:15:00Z',
      updatedAt: '2023-04-22T12:30:00Z',
      description: 'Delayed email notifications due to third-party service issues. Service has been restored.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <StatusHeader 
          overallStatus="operational" 
          lastUpdated={new Date().toLocaleString()} 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {services.map((service, index) => (
            <ServiceStatus key={index} {...service} />
          ))}
        </div>
        
        <div className="mb-8">
          <UptimeChart data={uptimeData} />
        </div>
        
        <div className="mb-8">
          <IncidentHistory incidents={incidents} />
        </div>
        
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default StatusPage;