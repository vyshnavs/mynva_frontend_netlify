import { useState } from "react";

export default function UserProfile() {
  const [tab, setTab] = useState("info");

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">My Profile</h1>

      <div className="flex gap-6 border-b pb-2 text-lg">
        <button className={tab === "info" ? "font-bold text-green-600" : ""} onClick={() => setTab("info")}>Personal Info</button>
        <button className={tab === "account" ? "font-bold text-green-600" : ""} onClick={() => setTab("account")}>Account Settings</button>
        <button className={tab === "notifications" ? "font-bold text-green-600" : ""} onClick={() => setTab("notifications")}>Notifications</button>
        <button className={tab === "billing" ? "font-bold text-green-600" : ""} onClick={() => setTab("billing")}>Billing</button>
      </div>

      {/* TAB CONTENT */}
      {tab === "info" && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">
          <h2 className="text-xl font-semibold">Personal Information</h2>
          <input className="w-full p-3 rounded border" placeholder="Full Name" defaultValue="John Doe" />
          <input className="w-full p-3 rounded border" placeholder="Email" defaultValue="john@example.com" />
          <input className="w-full p-3 rounded border" placeholder="Phone" defaultValue="+1 555 123 4567" />
          <button className="px-6 py-2 bg-green-600 text-white rounded">Save Changes</button>
        </div>
      )}

      {tab === "account" && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
          <p className="text-gray-500">Password change, login history, security settings…</p>
        </div>
      )}

      {tab === "notifications" && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
          <p className="text-gray-500">Email alerts, usage warnings, billing alerts…</p>
        </div>
      )}

      {tab === "billing" && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Billing Information</h2>
          <p className="text-gray-500">Billing history, payment methods, invoices…</p>
        </div>
      )}
    </div>
  );
}
