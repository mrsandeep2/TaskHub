"use client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/format";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground text-sm">Your account information</p>
      </div>

      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
            <Badge variant="info" className="mt-1 capitalize">{user?.role}</Badge>
          </div>
        </div>
        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Member since</span>
            <span className="font-medium">{user?.created_at ? formatDate(user.created_at) : "—"}</span>
          </div>
          {user?.app_metadata?.provider && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sign-in method</span>
              <span className="font-medium capitalize">{user.app_metadata.provider}</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
