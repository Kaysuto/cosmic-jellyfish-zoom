import React from "react";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableRow, TableHead, TableHeader, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { Link } from "react-router-dom";

const RecentAuditLogs: React.FC = () => {
  const { logs, loading } = useAuditLogs();
  const locale = (navigator.language || "fr").startsWith("fr") ? fr : enUS;
  const recent = (logs || []).slice(0, 5);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Logs récents</CardTitle>
          <CardDescription>Les derniers évènements d'administration</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logs récents</CardTitle>
        <CardDescription>Les 5 opérations les plus récentes</CardDescription>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">Aucun événement récent</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Détails</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs whitespace-nowrap">
                    {format(new Date(log.created_at), "Pp", { locale })}
                  </TableCell>
                  <TableCell className="text-sm">{log.profiles?.email ?? "Système"}</TableCell>
                  <TableCell className="text-sm font-medium">{log.action}</TableCell>
                  <TableCell className="text-xs">
                    {log.details ? (typeof log.details === "string" ? log.details : JSON.stringify(log.details).slice(0, 120) + (JSON.stringify(log.details).length > 120 ? "…" : "")) : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <div className="mt-4 text-right">
          <Link to="/admin/logs" className="text-sm text-blue-500 hover:underline">Voir tous les logs →</Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentAuditLogs;