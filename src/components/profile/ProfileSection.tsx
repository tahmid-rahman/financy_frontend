import { UserCircleIcon, CameraIcon } from "@heroicons/react/24/outline";
import Button from "../ui/Button";
import AvatarEditorModal from "./AvatarEditorModal";
import { useState, useEffect } from "react";
import EditProfileModal from "./EditProfileModal";
import ChangePasswordModal from "./ChangePasswordModal";
import { getProfile } from "../../services/api";

export default function ProfileSection() {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({
    avatar: "",
    firstName: "",
    lastName: "",
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        setIsLoading(true);
        const res = await getProfile();
        const data = res.data || res;
        const nameParts = (data.name || "").split(" ");
        setUser({
          avatar: data.avatar_url || data.avatar || "",
          firstName: data.first_name || nameParts[0] || "",
          lastName: data.last_name || nameParts.slice(1).join(" ") || "",
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
        });
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleProfileUpdate = () => {
    // Refresh profile after update
    getProfile().then((res) => {
      const data = res.data || res;
      const nameParts = (data.name || "").split(" ");
      setUser({
        avatar: data.avatar_url || data.avatar || "",
        firstName: data.first_name || nameParts[0] || "",
        lastName: data.last_name || nameParts.slice(1).join(" ") || "",
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
      });
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        <div className="lg:col-span-1">
          <div className="bg-surface border border-border/50 rounded-lg p-6 text-center">
            <div className="w-32 h-32 rounded-full bg-border/50 mx-auto mb-4"></div>
            <div className="h-6 bg-border/50 rounded w-32 mx-auto mb-2"></div>
            <div className="h-4 bg-border/50 rounded w-40 mx-auto"></div>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-surface border border-border/50 rounded-lg p-6">
            <div className="h-6 bg-border/50 rounded w-40 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="h-4 bg-border/50 rounded w-20 mb-2"></div>
                  <div className="h-10 bg-border/50 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Profile Card */}
      <div className="lg:col-span-1">
        <div className="bg-surface border border-border/50 rounded-lg p-6 text-center">
          <div className="flex flex-col items-center">
            <div className="relative group">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile Avatar"
                  className="w-32 h-32 rounded-full object-cover border-2 border-border block mx-auto"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center border-2 border-border mx-auto">
                  <UserCircleIcon className="w-20 h-20 text-primary" />
                </div>
              )}
              <button
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <CameraIcon className="h-6 w-6 text-surface" />
              </button>
            </div>
          </div>
          <h2 className="text-xl font-semibold mt-4">{user.name}</h2>
          <p className="text-text-muted mb-4">{user.email}</p>
          <Button variant="secondary" className="w-full" onClick={() => setIsProfileModalOpen(true)}>
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Profile Details */}
      <div className="lg:col-span-2">
        <div className="bg-surface border border-border/50 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-6">Personal Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-text-muted mb-1">First Name</label>
              <div className="p-2 bg-background rounded-lg border border-border/50">{user.firstName || "-"}</div>
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">Last Name</label>
              <div className="p-2 bg-background rounded-lg border border-border/50">{user.lastName || "-"}</div>
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">Email</label>
              <div className="p-2 bg-background rounded-lg border border-border/50">{user.email}</div>
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">Phone</label>
              <div className="p-2 bg-background rounded-lg border border-border/50">{user.phone || "-"}</div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-md font-medium mb-4">Security</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border/50">
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-text-muted">Last changed: Never</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsPasswordModalOpen(true)}>
                  Change Password
                </Button>
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border/50">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-text-muted">Not enabled</p>
                </div>
                <Button variant="ghost" size="sm">
                  Enable
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AvatarEditorModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSave={(newAvatar) => setUser({ ...user, avatar: newAvatar })}
      />
      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
      <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        initialData={{
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        }}
        onSuccess={handleProfileUpdate}
      />
    </div>
  );
}