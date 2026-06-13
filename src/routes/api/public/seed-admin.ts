import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/seed-admin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("x-seed-token");
        if (token !== "cfp-lumiere-bootstrap-2026") {
          return new Response("Unauthorized", { status: 401 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const email = "contact@cfp-lumiere.cd";
        const password = "243Cfp";

        // Check if user exists
        const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        let user = list?.users.find((u) => u.email === email);
        if (!user) {
          const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: "Administrateur CFP Lumière" },
          });
          if (error) return new Response(error.message, { status: 500 });
          user = created.user!;
        } else {
          await supabaseAdmin.auth.admin.updateUserById(user.id, { password, email_confirm: true });
        }

        await supabaseAdmin.from("profiles").upsert(
          { id: user.id, full_name: "Administrateur CFP Lumière", email, access_granted: true, status: "active" },
          { onConflict: "id" },
        );
        await supabaseAdmin.from("user_roles").upsert(
          { user_id: user.id, role: "admin" },
          { onConflict: "user_id,role" },
        );

        return new Response(JSON.stringify({ ok: true, userId: user.id }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
