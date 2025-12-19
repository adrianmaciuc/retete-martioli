import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { User as UserIcon, Mail, Calendar, MapPin, LogOut } from "lucide-react";
import { toast } from "sonner";

export function UserProfile() {
  const navigate = useNavigate();
  const { user, logout, updateProfile, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    bio: user?.bio || "",
    newsletterSubscribed: user?.newsletterSubscribed || false,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        bio: user.bio || "",
        newsletterSubscribed: user.newsletterSubscribed || false,
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewsletterChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      newsletterSubscribed: checked,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getAvatarFallback = (username?: string) => {
    return username ? username.substring(0, 2).toUpperCase() : "U";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.avatar} alt={user?.username} />
                <AvatarFallback>
                  {getAvatarFallback(user?.username)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {user?.username}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user?.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    {user?.role === "cook" ? "👨‍🍳 Chef" : "👤 User"}
                  </div>
                  {user?.createdAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Membru din data de {formatDate(user.createdAt)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {/* Profile Settings Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>
                    Manage your account information
                  </CardDescription>
                </div>
                {!isEditing && (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        disabled={isSaving}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Tell us about yourself..."
                        rows={4}
                        disabled={isSaving}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Username</Label>
                      <p className="text-lg font-medium">{formData.username}</p>
                    </div>

                    {formData.bio && (
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Bio</Label>
                        <p className="text-foreground whitespace-pre-wrap">
                          {formData.bio}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="text-lg font-medium">{user?.email}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Newsletter Card */}
            <Card>
              <CardHeader>
                <CardTitle>Newsletter</CardTitle>
                <CardDescription>
                  Subscribe to our cooking tips and new recipes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label
                      htmlFor="newsletter"
                      className="text-base font-medium"
                    >
                      Subscribe to newsletter
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive weekly cooking tips and new recipes
                    </p>
                  </div>
                  <Switch
                    id="newsletter"
                    checked={formData.newsletterSubscribed}
                    onCheckedChange={handleNewsletterChange}
                    disabled={isEditing || isSaving}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Account Actions Card */}
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Account</CardTitle>
                <CardDescription>Manage your account</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full sm:w-auto"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
