import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUsers } from "@/hooks/useUsers";
import { supabase } from "@/integrations/supabase/client";
import { auditLog } from "@/utils/audit";
import UserForm, { UserFormValues } from "./UserForm";
import { Profile } from "@/hooks/useProfile";
import { useSession } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { showSuccess, showError } from "@/utils/toast";
import { AvatarFallback as AF } from "@/components/ui/avatar";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Shield, ShieldOff, ArrowUpDown, Search } from "lucide-react";
import { getGravatarURL } from "@/lib/gravatar";
import { motion } from "framer-motion";

type SortByType = "updated_at" | "email" | "first_name" | "role" | "mfa";

const UserManager: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { users, loading, refreshUsers } = useUsers();
  const { session } = useSession();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null);
  const [isMfaDialogOpen, setIsMfaDialogOpen] = useState(false);
  const [userToEditMfa, setUserToEditMfa] = useState<Profile | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "user">("all");
  const [sortBy, setSortBy] = useState<SortByType>("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [mfaUserIds, setMfaUserIds] = useState<string[]>([]);
  const [loadingMfa, setLoadingMfa] = useState(true);

  const currentLocale = i18n.language === "fr" ? fr : enUS;

  const fetchMfaStatus = useCallback(async () => {
    setLoadingMfa(true);
    try {
      const res: any = await supabase.functions.invoke("get-mfa-factors");
      // res may be { data } or raw; normalize
      const payload = res?.data ?? res;
      if (payload?.userIds) {
        setMfaUserIds(payload.userIds);
      } else if (payload?.userIds === undefined && payload?.userIds !== null) {
        // nothing
        setMfaUserIds([]);
      } else if (Array.isArray(payload)) {
        setMfaUserIds(payload);
      } else {
        setMfaUserIds(payload?.userIds ?? []);
      }
    } catch (err) {
      console.error("Error fetching MFA status:", err);
      setMfaUserIds([]);
    } finally {
      setLoadingMfa(false);
    }
  }, []);

  useEffect(() => {
    fetchMfaStatus();
  }, [fetchMfaStatus]);

  const filteredSorted = useMemo(() => {
    const list = users.filter((u) => {
      if (filterRole !== "all" && u.role !== filterRole) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const name = `${u.first_name ?? ""} ${u.last_name ?? ""}`.toLowerCase();
      const email = (u.email ?? "").toLowerCase();
      return name.includes(term) || email.includes(term);
    });

    const sorted = [...list].sort((a, b) => {
      let aVal: any = "";
      let bVal: any = "";

      if (sortBy === "mfa") {
        aVal = mfaUserIds.includes(a.id) ? 1 : 0;
        bVal = mfaUserIds.includes(b.id) ? 1 : 0;
      } else if (sortBy === "first_name") {
        aVal = `${a.first_name ?? ""} ${a.last_name ?? ""}`.toLowerCase();
        bVal = `${b.first_name ?? ""} ${b.last_name ?? ""}`.toLowerCase();
      } else {
        aVal = (a as any)[sortBy] ?? "";
        bVal = (b as any)[sortBy] ?? "";
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [users, filterRole, searchTerm, sortBy, sortOrder, mfaUserIds]);

  const handleSort = (column: SortByType) => {
    if (sortBy === column) {
      setSortOrder((s) => (s === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  // Create user via Edge Function
  const handleCreateUser = async (values: UserFormValues) => {
    setIsSubmitting(true);
    try {
      const res: any = await supabase.functions.invoke("create-user", { body: values });
      const payload = res?.data ?? res;
      if (res?.error) throw res.error;
      if (payload?.error) throw new Error(payload.error?.message ?? payload.error);

      showSuccess(t("user_created_successfully", { email: values.email }));
      await auditLog("user_created", { email: values.email, createdBy: session?.user?.id ?? null });
      refreshUsers();
      setIsSheetOpen(false);
    } catch (err: any) {
      console.error("create-user error:", err);
      const message = err?.message ?? String(err);
      showError(`${t("error_creating_user") ?? "Error creating user"}: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete user via edge function (admin)
  const confirmDelete = (u: Profile) => {
    setUserToDelete(u);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      const res: any = await supabase.functions.invoke("delete-user", { body: { userId: userToDelete.id } });
      const payload = res?.data ?? res;
      if (res?.error) throw res.error;
      if (payload?.error) throw new Error(payload.error?.message ?? payload.error);

      showSuccess(t("user_deleted_successfully"));
      await auditLog("user_deleted", { userId: userToDelete.id, email: userToDelete.email });
      refreshUsers();
    } catch (err: any) {
      console.error("delete-user error:", err);
      showError(`${t("error_deleting_user") ?? "Error deleting user"}: ${err?.message ?? String(err)}`);
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: "admin" | "user") => {
    try {
      const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
      if (error) throw error;
      showSuccess(t("role_updated_successfully"));
      await auditLog("role_updated", { targetUserId: userId, newRole });
      refreshUsers();
    } catch (err: any) {
      console.error("role update error:", err);
      showError(`${t("error_updating_role") ?? "Error updating role"}: ${err?.message ?? String(err)}`);
    }
  };

  const confirmDisableMfa = (u: Profile) => {
    setUserToEditMfa(u);
    setIsMfaDialogOpen(true);
  };

  const handleDisableMfa = async () => {
    if (!userToEditMfa) return;
    try {
      const res: any = await supabase.functions.invoke("admin-unenroll-mfa", { body: { userId: userToEditMfa.id } });
      const payload = res?.data ?? res;
      if (res?.error) throw res.error;
      if (payload?.error) throw new Error(payload.error?.message ?? payload.error);

      showSuccess(t("mfa_disabled_for_user", { email: userToEditMfa.email }));
      await auditLog("mfa_disabled_by_admin", { targetUserId: userToEditMfa.id });
      fetchMfaStatus();
    } catch (err: any) {
      console.error("admin-unenroll-mfa error:", err);
      showError(`${t("error_disabling_mfa") ?? "Error disabling MFA"}: ${err?.message ?? String(err)}`);
    } finally {
      setIsMfaDialogOpen(false);
      setUserToEditMfa(null);
    }
  };

  if (loading || loadingMfa) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("manage_users")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full mt-4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Card>
        <CardHeader className="flex items-center justify-between gap-4">
          <CardTitle>{t("manage_users")}</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-10" placeholder={t("search_user_placeholder")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Select value={filterRole} onValueChange={(v) => setFilterRole(v as any)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t("filter_by_role")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_roles")}</SelectItem>
                <SelectItem value="admin">{t("admin_role")}</SelectItem>
                <SelectItem value="user">{t("user_role")}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setIsSheetOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("create_user") ?? "Create user"}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("first_name")}>
                    {t("user_header")} <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>{t("role")}</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("mfa")}>
                    MFA <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>{t("last_update")}</TableHead>
                <TableHead className="text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredSorted.map((u) => {
                const hasMfa = mfaUserIds.includes(u.id);
                const isCurrent = u.id === session?.user?.id;
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={u.avatar_url || getGravatarURL(u.email)} />
                          <AvatarFallback>{(u.first_name || u.email || "U")[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{u.first_name} {u.last_name}</div>
                          <div className="text-sm text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                        {u.role === "admin" ? t("admin_role") : t("user_role")}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge variant={hasMfa ? "default" : "outline"} className={hasMfa ? "bg-green-500/20 text-green-500" : ""}>
                        {hasMfa ? t("mfa_enabled") : t("mfa_disabled")}
                      </Badge>
                    </TableCell>

                    <TableCell>{format(new Date(u.updated_at), "PP", { locale: currentLocale })}</TableCell>

                    <TableCell className="text-right">
                      {isCurrent ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button variant="ghost" size="icon" disabled>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent><div>{t("cannot_edit_self_tooltip")}</div></TooltipContent>
                        </Tooltip>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <a href={`/admin/users/${u.id}/edit`} className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" /> {t("edit")}
                              </a>
                            </DropdownMenuItem>

                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger><Shield className="mr-2 h-4 w-4" /> {t("role")}</DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                  <DropdownMenuItem onClick={() => handleRoleChange(u.id, "admin")}>{t("admin_role")}</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleRoleChange(u.id, "user")}>{t("user_role")}</DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem onClick={() => confirmDisableMfa(u)} disabled={!hasMfa}>
                              <ShieldOff className="mr-2 h-4 w-4" /> {t("disable_mfa")}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem onClick={() => confirmDelete(u)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> {t("delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{t("create_user")}</SheetTitle>
            <SheetDescription>{t("create_user_desc") ?? "Create a new user"}</SheetDescription>
          </SheetHeader>

          <UserForm onSubmit={handleCreateUser} onCancel={() => setIsSheetOpen(false)} isSubmitting={isSubmitting} />
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirm_delete_title")}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">{t("delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isMfaDialogOpen} onOpenChange={setIsMfaDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirm_disable_mfa_title")}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToEditMfa(null)}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisableMfa} className="bg-destructive hover:bg-destructive/90">{t("disable_mfa")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default UserManager;