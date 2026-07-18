import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import Button from "../ui/Button";
import { api } from "../../services/api";
import { useToast } from "../../contexts/ToastContext";

export default function AvatarEditorModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (avatar: string) => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", selectedFile);

      const response = await api.put("/accounts/user-profile/", formData);
      // Backend returns { message, data: { avatar_url, ... } }
      const avatarUrl = response.data?.data?.avatar_url || response.data?.data?.avatar || previewUrl;
      onSave(avatarUrl);
      showToast({ message: "Avatar updated successfully!", type: "success" });
      onClose();
    } catch (err: any) {
      showToast({
        message: err?.message || "Failed to update avatar",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-surface border border-border/50 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg text-text font-medium mb-4">
                  Update Profile Picture
                </Dialog.Title>

                <div className="space-y-6">
                  <div className="flex justify-center">
                    <div className="relative">
                      <img
                        src={previewUrl || "/default-avatar.png"}
                        alt="Preview"
                        className="w-32 h-32 rounded-full object-cover border-4 border-primary/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-text-muted mb-1">Upload new image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <Button variant="secondary" className="text-text" onClick={onClose} disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      isLoading={isLoading}
                      disabled={!selectedFile}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
