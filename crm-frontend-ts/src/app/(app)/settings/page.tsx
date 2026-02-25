"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { ThemeSwitch } from "@/components/theme-switch";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { IconUser, IconEdit } from "@tabler/icons-react";
import { format } from "date-fns";

const DESIGNATIONS = ["Frontend Dev", "Backend Dev", "Fullstack Dev", "DevOps", "QA"];

export default function SettingsPage() {
  const { user, fetchUser, logout } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    designation: "",
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState("en");
  const [passwords, setPasswords] = useState({ current: "", newPassword: "", confirm: "" });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        mobile: user.mobile || "",
        designation: (user as any).designation || "",
      });
    }

    // load preferences from localStorage
    try {
      const s = localStorage.getItem("prefs_notifications");
      if (s !== null) setNotificationsEnabled(s === "true");
      const lang = localStorage.getItem("prefs_language");
      if (lang) setLanguage(lang);
    } catch (e) {
      // noop
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target as any;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((p) => ({ ...p, [name]: value }));
  };

  const changePassword = async () => {
    if (!user) return;
    if (!passwords.newPassword || passwords.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (passwords.newPassword !== passwords.confirm) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const payload = {
        id: user.id,
        companyId: user.companyId,
        password: passwords.newPassword,
      } as any;

      await axios.put("/api/employees", payload, { headers: { "Content-Type": "application/json" } });
      toast.success("Password updated");
      setPasswords({ current: "", newPassword: "", confirm: "" });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error?.message || err?.message || "Failed to change password");
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const payload = {
        id: user.id,
        companyId: user.companyId,
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        designation: form.designation,
      } as any;

      await axios.put("/api/employees", payload, { headers: { "Content-Type": "application/json" } });

      toast.success("Profile updated");
      setEditing(false);
      // refresh auth user data
      fetchUser();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error?.message || err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = () => {
    try {
      localStorage.setItem("prefs_notifications", String(notificationsEnabled));
      localStorage.setItem("prefs_language", language);
      toast.success("Preferences saved");
    } catch (e) {
      toast.error("Unable to save preferences");
    }
  };
  console.log("USER:", user)
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>

      <div className="md:flex md:gap-6">
        {/* Left column: profile card + quick stats */}
        <div className="md:w-1/3">
          <Card>
            <CardContent>
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="h-24 w-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl">
                  <IconUser />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">{user?.name || "Unknown User"}</div>
                  <div className="text-sm text-muted-foreground">{(user as any)?.designation || user?.role || "Employee"}</div>
                </div>
                <div className="w-full mt-4">
                  <div className="flex gap-2">
                    <Button className="flex-1" variant="outline" onClick={() => { setEditing(true); setPasswords({ current: "", newPassword: "", confirm: "" }); }}>
                      Edit Profile
                    </Button>
                    <Button className="flex-1" variant="ghost" onClick={() => logout()}>
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Last login */}
          <div className="mt-4">
            <Card className="flex items-start justify-start h-full w-full">
              <CardContent className="flex flex-col items-start justify-center text-center">
                <div className="text-sm text-muted-foreground">Last login</div>
                <div className="font-medium">
                  {(user as any)?.lastLogin
                    ? format(new Date((user as any).lastLogin), "dd MMM yyyy (hh:mm a)")
                    : "—"}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right column: tabs */}
        <div className="md:w-2/3 mt-6 md:mt-0">
          <Card>
            <Tabs defaultValue="account">
              <CardHeader>
                <TabsList>
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent>
                <TabsContent value="account">
                  {/* Account content */}
                  <div className="space-y-4">
                    {!editing ? (
                      <div className="space-y-2">
                        <div className="font-medium">Name</div>
                        <div className="text-sm text-muted-foreground">{user?.name || "-"}</div>

                        <div className="font-medium mt-3">Email</div>
                        <div className="text-sm text-muted-foreground">{user?.email || "-"}</div>

                        <div className="font-medium mt-3">Phone</div>
                        <div className="text-sm text-muted-foreground">{user?.mobile || "-"}</div>

                        <div className="font-medium mt-3">Designation</div>
                        <div className="text-sm text-muted-foreground">{(user as any)?.designation || "-"}</div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Name</label>
                          <Input name="name" value={form.name} onChange={handleChange} />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Phone</label>
                          <Input name="mobile" value={form.mobile} onChange={handleChange} />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Email</label>
                          <Input type="email" name="email" value={form.email} onChange={handleChange} />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Designation</label>
                          <Select value={form.designation} onValueChange={(v: string) => setForm((p) => ({ ...p, designation: v }))}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a designation" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {DESIGNATIONS.map((d) => (
                                  <SelectItem key={d} value={d}>
                                    {d}
                                  </SelectItem>
                                ))}
                                <SelectItem value={`Custom:Other`}>Custom: Other</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                          <Button onClick={saveProfile} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="security">
                  {/* Security content: change password */}
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="text-sm font-medium">New password</label>
                      <Input name="newPassword" type="password" value={passwords.newPassword} onChange={handlePasswordChange} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Confirm password</label>
                      <Input name="confirm" type="password" value={passwords.confirm} onChange={handlePasswordChange} />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setPasswords({ current: "", newPassword: "", confirm: "" })}>Reset</Button>
                      <Button onClick={changePassword}>Change password</Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="preferences">
                  {/* Preferences content */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Theme</div>
                        <div className="text-sm text-muted-foreground">Light, dark or system theme</div>
                      </div>
                      <ThemeSwitch />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Notifications</div>
                        <div className="text-sm text-muted-foreground">Enable desktop notifications (local)</div>
                      </div>
                      <Switch checked={notificationsEnabled} onCheckedChange={(v) => setNotificationsEnabled(Boolean(v))} />
                    </div>

                    <div>
                      <div className="font-medium">Language</div>
                      <div className="mt-2 max-w-sm">
                        <Select value={language} onValueChange={(v: string) => setLanguage(v)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Español</SelectItem>
                              <SelectItem value="hi">हिन्दी</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => { setNotificationsEnabled(true); setLanguage("en"); localStorage.removeItem("prefs_notifications"); localStorage.removeItem("prefs_language"); toast.success("Preferences reset") }}>Reset</Button>
                      <Button onClick={savePreferences}>Save Preferences</Button>
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
