import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Copy } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

const Webhooks = () => {
  const { t } = useTranslation();
  const baseUrl = `${window.location.origin}/api/webhooks/jellyfin`;
  const apiKey = "SUPABASE_ANON_KEY"; // This should be handled more securely

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    showSuccess(message);
  };

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>{t('integrations')}</CardTitle>
        <CardDescription>{t('integrations_desc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">{t('webhook_url_label')}</label>
          <p className="text-xs text-muted-foreground mb-2">{t('webhook_url_desc')}</p>
          <div className="flex items-center space-x-2">
            <Input readOnly value={baseUrl} />
            <Button variant="outline" size="icon" onClick={() => copyToClipboard(baseUrl, t('url_copied_to_clipboard'))}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">{t('webhook_headers_label')}</label>
          <p className="text-xs text-muted-foreground mb-2">{t('webhook_headers_desc')}</p>
          <div className="space-y-2 p-3 bg-muted rounded-md">
            <div className="flex items-center justify-between">
              <code className="text-sm">apikey</code>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(apiKey, t('api_key_copied'))}>
                <Copy className="h-3 w-3 mr-2" /> {t('copy')}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <code className="text-sm">Authorization</code>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`Bearer ${apiKey}`, t('api_key_copied'))}>
                <Copy className="h-3 w-3 mr-2" /> {t('copy')}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Webhooks;