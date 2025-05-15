import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import Button from "../ui/Button";

export default function EditProfileModal({
  isOpen,
  onClose,
  initialData = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
  },
}: {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}) {
  const [formData, setFormData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onClose();
    }, 1000);
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
                  Edit Profile
                </Dialog.Title>

                <div className="space-y-4">
                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-text-muted mb-1">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-background border text-text border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-text-muted mb-1">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-background border text-text border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-text-muted mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-background border text-text border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-text-muted mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-background border text-text border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                    />
                  </div>

                  <div className="pt-4 flex justify-end gap-3 text-text">
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit} isLoading={isLoading}>
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
