"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Suspense } from "react";

function CallbackInner() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createClient();
        
        // Wait for Supabase to process the OAuth callback from URL hash
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          router.replace("/auth/login?error=auth_failed");
          return;
        }

        // Send Supabase token to our Flask backend
        // Backend will create/update user in our DB and return our own JWT
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/supabase-callback`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              access_token: data.session.access_token,
              user: data.session.user,
            }),
          }
        );

        const result = await response.json();
        
        if (result.success && result.data?.token) {
          localStorage.setItem("access_token", result.data.token);
          router.replace("/dashboard");
        } else {
          router.replace("/auth/login?error=backend_error");
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        router.replace("/auth/login?error=network_error");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense>
      <CallbackInner />
    </Suspense>
  );
}
