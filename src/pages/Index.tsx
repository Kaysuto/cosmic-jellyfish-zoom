import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Server, 
  Shield, 
  Zap, 
  Globe, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { MadeWithDyad } from '@/components/made-with-dyad';

const Index: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: t('home.features.reliable.title'),
      description: t('home.features.reliable.description')
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: t('home.features.fast.title'),
      description: t('home.features.fast.description')
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: t('home.features.global.title'),
      description: t('home.features.global.description')
    }
  ];

  const stats = [
    { icon: <Server className="w-5 h-5" />, label: t('home.stats.servers'), value: "99.99%" },
    { icon: <Clock className="w-5 h-5" />, label: t('home.stats.uptime'), value: "24/7" },
    { icon: <BarChart3 className="w-5 h-5" />, label: t('home.stats.support'), value: "< 1h" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-blue-900/30 text-blue-300 border-blue-700/50">
            <CheckCircle className="w-4 h-4 mr-2" />
            {t('home.badge')}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {t('home.title')}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            {t('home.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              {t('home.get_started')}
            </Button>
            <Button size="lg" variant="outline" className="border-gray-600 hover:bg-gray-800">
              {t('home.learn_more')}
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-3 text-blue-400">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-lg mb-16">
          <h2 className="text-2xl font-semibold mb-4 text-blue-300">{t('home.mission.title')}</h2>
          <p className="text-gray-300">
            {t('home.mission.description')}
          </p>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">{t('home.features.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="text-blue-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Status Preview */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-8 border border-blue-700/30 mb-16">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold text-white mb-2">{t('home.status.title')}</h2>
              <p className="text-gray-300">{t('home.status.description')}</p>
            </div>
            <div className="flex items-center">
              <div className="flex items-center bg-green-900/30 px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                <span className="text-green-400 font-medium">{t('home.status.operational')}</span>
              </div>
            </div>
          </div>
        </div>

        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;