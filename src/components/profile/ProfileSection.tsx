import { UserCircleIcon, PencilIcon, CameraIcon } from "@heroicons/react/24/outline";
import Button from "../ui/Button";
import AvatarEditorModal from "./AvatarEditorModal";

import { useState } from "react";
import EditProfileModal from "./EditProfileModal";
import ChangePasswordModal from "./ChangePasswordModal";

export default function ProfileSection() {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [user, setUser] = useState({
    avatar: "https://via.placeholder.com/150",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
  });
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Profile Card */}
      <div className="lg:col-span-1">
        <div className="bg-surface border border-border/50 rounded-lg p-6 text-center">
          <div className="flex flex-col items-center">
            <div className="relative group">
              <img
                src={user.avatar}
                alt="Profile Avatar"
                className="w-32 h-32 rounded-full object-cover border-2 border-border block items-center justify-center"
              />
              <button
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <CameraIcon className="h-6 w-6 text-surface" />
              </button>
            </div>
          </div>
          <h2 className="text-xl font-semibold">John Doe</h2>
          <p className="text-text-muted mb-4">john@example.com</p>
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
              <div className="p-2 bg-background rounded-lg border border-border/50">John</div>
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">Last Name</label>
              <div className="p-2 bg-background rounded-lg border border-border/50">Doe</div>
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">Email</label>
              <div className="p-2 bg-background rounded-lg border border-border/50">john@example.com</div>
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">Phone</label>
              <div className="p-2 bg-background rounded-lg border border-border/50">+1 (555) 123-4567</div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-md font-medium mb-4">Security</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border/50">
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-text-muted">Last changed 3 months ago</p>
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
      <EditProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </div>
  );
}
