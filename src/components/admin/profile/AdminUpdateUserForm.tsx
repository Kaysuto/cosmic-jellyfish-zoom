import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, KeyRound } from "lucide-react";
import { Profile } from "@/hooks/useProfile";
import { auditLog } from "@/utils/audit";

interface AdminUpdateUserFormProps {
  user: Profile;
}

const AdminUpdateUserForm: React.FC<AdminUpdateUserFormProps> = ({ user }) => {
  const { t, i18n } = useTranslation();

  const formSchema = useMemo(
    () =>
      z.object({
        email: z.string().email({ message: t("invalid_email") }),
        password: z.string().optional(),
      }),
    [t],
  );

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user.email ?? "",
      password: "",
    },
  });

  useEffect(() => {
    // re-run validation when language changes (for messages)
    if (Object.keys(form.formState.errors).length > 0) {
      form.trigger();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  const onSubmit = async (values: FormValues) => {
    const attributes: { email?: string; password?: string } = {};
    if (values.email && values.email !== user.email) attributes.email = values.email;
    if (values.password) attributes.password = values.password;

    if (Object.keys(attributes).length === 0) {
      showSuccess(t("no_changes_to_save") ?? "Aucune modification à enregistrer.");
      return;
    }

    try {
      const res: any = await supabase.functions.invoke("update-user-details", {
        body: { userId: user.id, attributes },
      });

      // supabase.functions.invoke may return an object containing error property
      if (res?.error) {
        throw new Error(res.error?.message ?? JSON.stringify(res.error));
      }

      // Some runtimes return { data } or raw response; try to detect error inside data
      const payload = res?.data ?? res;
      if (payload && (payload.error || payload?.status >= 400)) {
        const errMsg = payload.error?.message ?? payload?.error ?? JSON.stringify(payload);
        throw new Error(errMsg);
      }

      showSuccess(t("user_update_success") ?? "Détails de l'utilisateur mis à jour avec succès.");
      await auditLog("admin_updated_user", { targetUserId: user.id, attributes });
      form.reset({ email: values.email, password: "" });
    } catch (err: any) {
      const message = err?.message ?? String(err);
      console.error("AdminUpdateUserForm error:", err);
      showError(`${t("error_updating_user") ?? "Erreur"}: ${message}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          {t("change_email_or_password")}
        </CardTitle>
        <CardDescription>{t("update_user_email_password_desc")}</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("email_address")}</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("new_password_optional") ?? "Nouveau mot de passe (optionnel)"}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? t("saving") ?? "Enregistrement..." : t("save_changes") ?? "Enregistrer"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AdminUpdateUserForm;