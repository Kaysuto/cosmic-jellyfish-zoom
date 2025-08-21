import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Server, CheckCircle, XCircle, Zap, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import WebhookInstructions from '@/components/admin/WebhookInstructions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

const JellyfinSettings = () => {
  const { t } = useTranslation();
  const [isSyncing, setIsSyncing] = useState(false);
  const [debugStartIndex, setDebugStartIndex] = useState(0);
  const [debugBatchSize] = useState(50);
  const [debugLog, setDebugLog] = useState<any[]>([]);
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [connStatus, setConnStatus] = useState<{ success: boolean; message: string; data?: any } | null>(null);
  const appUrl = window.location.origin;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess("URL copiée !");
  };

  const handleTestConnection = async () => {
    setIsTestingConn(true);
    setConnStatus(null);
    const toastId = showLoading("Test de la connexion...");
    try {
      const { data, error } = await supabase.functions.invoke('test-jellyfin-connection');
      if (error) throw error;
      setConnStatus(data);
      if (data.success) {
        showSuccess(data.message);
      } else {
        showError(data.message);
      }
    } catch (error: any) {
      const message = error.message || "Échec du test de la connexion.";
      setConnStatus({ success: false, message });
      showError(message);
    } finally {
      dismissToast(toastId);
      setIsTestingConn(false);
    }
  };

  const handleSyncJellyfin = async () => {
    setIsSyncing(true);
    const toastId = showLoading("Synchronisation avec Jellyfin en cours...");
    try {
      const { data, error } = await supabase.functions.invoke('media-sync', {
        body: { _path: '/sync' }
      });
      if (error) throw error;
      dismissToast(toastId);
      showSuccess(`Synchronisation terminée ! ${data.upserted || 0} éléments traités.`);
    } catch (error: any) {
      dismissToast(toastId);
      showError(`Erreur de synchronisation: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDebugSync = async () => {
    setIsSyncing(true);
    const toastId = showLoading(`Test du lot commençant à ${debugStartIndex}...`);
    try {
      const { data, error } = await supabase.functions.invoke('media-sync', {
        body: { startIndex: debugStartIndex, limit: debugBatchSize }
      });
      if (error) throw error;
      
      setDebugLog(prev => [data.log, ...prev]);
      if (data.log.upsert.status === 'success' && data.log.fetch.count > 0) {
        setDebugStartIndex(prev => prev + debugBatchSize);
      }
      dismissToast(toastId);
      showSuccess("Test du lot terminé.");

    } catch (error: any) {
      setDebugLog(prev => [{ error: error.message }, ...prev]);
      dismissToast(toastId);
      showError(`Erreur du test: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Jellyfin</h1>
        <p className="text-muted-foreground">Gérez la connexion, la synchronisation et les webhooks pour votre serveur Jellyfin.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Server className="h-5 w-5" />Connexion au serveur</CardTitle>
          <CardDescription>Testez la connexion à votre instance Jellyfin pour vous assurer que les paramètres sont corrects.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleTestConnection} disabled={isTestingConn}>
            <Zap className={`mr-2 h-4 w-4 ${isTestingConn ? 'animate-ping' : ''}`} />
            {isTestingConn ? "Test en cours..." : "Tester la connexion"}
          </Button>
          {connStatus && (
            <Alert variant={connStatus.success ? 'default' : 'destructive'}>
              {connStatus.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertTitle>{connStatus.success ? "Succès !" : "Échec"}</AlertTitle>
              <AlertDescription>
                {connStatus.message}
                {connStatus.success && connStatus.data && (
                  <div className="mt-2 text-xs space-y-1">
                    <p><strong>Serveur :</strong> {connStatus.data.serverName}</p>
                    <p><strong>Version :</strong> {connStatus.data.version}</p>
                    <p><strong>OS :</strong> {connStatus.data.operatingSystem}</p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration CORS</CardTitle>
          <CardDescription>
            Pour que la lecture vidéo fonctionne, vous devez autoriser cette application dans les paramètres CORS de votre serveur Jellyfin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">1. Allez dans votre <span className="font-semibold">Tableau de bord Jellyfin</span> &gt; <span className="font-semibold">Réseau</span>.</p>
          <p className="text-sm">2. Dans le champ <span className="font-semibold">"Domaines de partage de ressources inter-origines (CORS) connus"</span>, ajoutez l'URL suivante :</p>
          <div className="flex items-center gap-2">
            <Input readOnly value={appUrl} className="font-mono text-xs" />
            <Button variant="outline" size="icon" onClick={() => copyToClipboard(appUrl)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Si vous utilisez un nom de domaine personnalisé, ajoutez-le également. Vous pouvez ajouter plusieurs domaines en les séparant par une virgule.</p>
          <p className="text-sm">3. Enregistrez les modifications en bas de la page de votre tableau de bord Jellyfin.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Synchronisation</CardTitle>
          <CardDescription>Synchronisez votre bibliothèque Jellyfin avec l'application.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSyncJellyfin} disabled={isSyncing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? "Synchronisation..." : "Lancer la synchronisation Jellyfin"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Outil de débogage de synchronisation</CardTitle>
          <CardDescription>Exécutez la synchronisation par petits lots pour trouver le point de défaillance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
              <p className="text-sm">Lot de <strong>{debugBatchSize}</strong> éléments, commençant à l'index <strong>{debugStartIndex}</strong>.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDebugSync} disabled={isSyncing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? "Test en cours..." : "Lancer le test du prochain lot"}
            </Button>
            <Button variant="outline" onClick={() => { setDebugStartIndex(0); setDebugLog([]); }}>Réinitialiser</Button>
          </div>
          {debugLog.length > 0 && (
              <div className="space-y-2">
                  <h4 className="font-semibold">Logs de débogage:</h4>
                  <ScrollArea className="h-96 w-full rounded-md border p-4 bg-muted/50">
                      {debugLog.map((log, index) => (
                          <div key={index} className="mb-4 p-2 border-b">
                              <pre className="text-xs font-mono whitespace-pre-wrap">{JSON.stringify(log, null, 2)}</pre>
                          </div>
                      ))}
                  </ScrollArea>
              </div>
          )}
        </CardContent>
      </Card>

      <WebhookInstructions />
    </div>
  );
};

export default JellyfinSettings;