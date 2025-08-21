import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Copy, AlertTriangle } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZmZrd29la3VhZXRhaHJ3aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzc5OTMsImV4cCI6MjA2OTk1Mzk5M30.2Or0n42Hc6OjdWL-oGwoQHMjPqTwg0yMGKXnEysiJP4";
const WEBHOOK_BASE_URL = "https://tgffkwoekuaetahrwioo.supabase.co/functions/v1/media-sync";

const WebhookInstructions = () => {
  const { t } = useTranslation();

  const copyToClipboard = (text: string, successMessage: string) => {
    navigator.clipboard.writeText(text);
    showSuccess(successMessage);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">{t('integrations')}</CardTitle>
        <CardDescription>{t('integrations_desc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('security_warning')}</AlertTitle>
          <AlertDescription>{t('webhook_secret_warning')}</AlertDescription>
        </Alert>

        <div>
          <h4 className="font-semibold mb-2">1. {t('webhook_url_label')}</h4>
          <p className="text-sm text-muted-foreground mb-2">{t('webhook_url_desc_detailed')}</p>
          <div className="flex items-center gap-2">
            <Input
              id="webhook-url"
              readOnly
              value={`${WEBHOOK_BASE_URL}?secret=VOTRE_NOUVEAU_SECRET`}
              className="font-mono text-xs"
            />
            <Button variant="outline" size="icon" onClick={() => copyToClipboard(WEBHOOK_BASE_URL, t('url_copied_to_clipboard'))}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold mb-2">2. {t('webhook_headers_label')}</h4>
          <p className="text-sm text-muted-foreground mb-2">{t('webhook_headers_desc')}</p>
          <div className="space-y-2 rounded-md border p-4">
            <div className="grid grid-cols-3 gap-2 items-center">
              <Label htmlFor="header-name" className="text-xs text-muted-foreground col-span-1">Name</Label>
              <div className="col-span-2">
                <Input id="header-name" readOnly value="apikey" className="font-mono text-xs h-8" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 items-center">
              <Label htmlFor="header-value" className="text-xs text-muted-foreground col-span-1">Value</Label>
              <div className="col-span-2 flex items-center gap-2">
                <Input id="header-value" readOnly value={ANON_KEY} className="font-mono text-xs h-8" />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(ANON_KEY, t('api_key_copied'))}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebhookInstructions;