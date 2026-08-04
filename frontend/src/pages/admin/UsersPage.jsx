import { useState } from "react";
import { motion } from "framer-motion";
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiMail, FiShield, FiSave } from "react-icons/fi";
const TABS = ["Staff", "Roles", "Permissions"];
const staffList = [
  { id: "1", name: "Isabelle Fontaine", email: "isabelle@eternal.com", role: "Owner", status: "Active", lastLogin: "2025-01-15 09:42", initials: "IF", color: "#2d4a3e" },
  { id: "2", name: "Tom Bridges", email: "tom@eternal.com", role: "Admin", status: "Active", lastLogin: "2025-01-15 08:17", initials: "TB", color: "#8c8277" },
  { id: "3", name: "Sarah Kim", email: "sarah@eternal.com", role: "Inventory Manager", status: "Active", lastLogin: "2025-01-14 16:03", initials: "SK", color: "#c9b99a" },
  { id: "4", name: "Dev Patel", email: "dev@eternal.com", role: "Customer Support", status: "Inactive", lastLogin: "2025-01-10 11:29", initials: "DP", color: "#6b7280" }
];
const roles = [
  { id: "1", name: "Owner", description: "Full access to all areas of the store", staffCount: 1, permissions: "All permissions" },
  { id: "2", name: "Admin", description: "Manage all store operations except billing", staffCount: 1, permissions: "Most permissions" },
  { id: "3", name: "Inventory Manager", description: "Manage products, inventory and collections", staffCount: 1, permissions: "Products, Inventory" },
  { id: "4", name: "Customer Support", description: "View and manage orders and customers", staffCount: 1, permissions: "Orders, Customers" },
  { id: "5", name: "Marketing Manager", description: "Manage campaigns, newsletters and banners", staffCount: 0, permissions: "Marketing, Analytics" }
];
const permAreas = ["Products", "Orders", "Customers", "Analytics", "Marketing", "Settings", "Users"];
const permMatrix = {
  "Owner": [true, true, true, true, true, true, true],
  "Admin": [true, true, true, true, true, true, false],
  "Inventory Manager": [true, false, false, true, false, false, false],
  "Customer Support": [false, true, true, false, false, false, false],
  "Marketing Manager": [false, false, false, true, true, false, false]
};
function UsersPage() {
  const [tab, setTab] = useState("Staff");
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [matrix, setMatrix] = useState(permMatrix);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", description: "" });
  function togglePerm(role, idx) {
    setMatrix((prev) => {
      const row = [...prev[role] ?? []];
      row[idx] = !row[idx];
      return { ...prev, [role]: row };
    });
  }
  return <div className="space-y-6">
      {
    /* Header */
  }
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-[#0a0a0a]">Staff & Roles</h1>
          <p className="text-sm text-[#8c8277] mt-0.5">Manage team access and permissions</p>
        </div>
        {tab === "Staff" && <button
    onClick={() => setShowInvite(!showInvite)}
    className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] text-white text-sm font-medium rounded-lg hover:bg-[#2d4a3e] transition-colors"
  >
            <FiPlus size={16} /> Invite Staff
          </button>}
        {tab === "Roles" && <button
    onClick={() => setShowRoleForm(!showRoleForm)}
    className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] text-white text-sm font-medium rounded-lg hover:bg-[#2d4a3e] transition-colors"
  >
            <FiPlus size={16} /> Create Role
          </button>}
      </div>

      {
    /* Tabs */
  }
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map((t) => <button
    key={t}
    onClick={() => setTab(t)}
    className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${tab === t ? "bg-white text-[#0a0a0a] shadow-sm" : "text-[#8c8277] hover:text-[#0a0a0a]"}`}
  >
            {t}
          </button>)}
      </div>

      {
    /* Staff Tab */
  }
      {tab === "Staff" && <div className="space-y-4">
          {showInvite && <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#f0ebe2]/30 border border-[#c9b99a]/40 rounded-xl p-5"
  >
              <p className="font-semibold text-sm text-[#0a0a0a] mb-3">Invite a team member</p>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
    type="email"
    value={inviteEmail}
    onChange={(e) => setInviteEmail(e.target.value)}
    placeholder="colleague@eternal.com"
    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#2d4a3e]"
  />
                </div>
                <button className="px-4 py-2 bg-[#0a0a0a] text-white text-sm rounded-lg hover:bg-[#2d4a3e] transition-colors">
                  Send Invite
                </button>
                <button onClick={() => setShowInvite(false)} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-[#8c8277]">
                  <FiX size={14} />
                </button>
              </div>
            </motion.div>}

          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Staff Member", "Role", "Status", "Last Login", "Actions"].map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#8c8277] uppercase tracking-wider">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {staffList.map((s) => <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: s.color }}>
                          {s.initials}
                        </div>
                        <div>
                          <p className="font-medium text-[#0a0a0a]">{s.name}</p>
                          <p className="text-xs text-[#8c8277]">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f0ebe2] text-[#8c8277]">
                        <FiShield size={10} /> {s.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.status === "Active" ? "bg-[#2d4a3e]/10 text-[#2d4a3e]" : "bg-gray-100 text-gray-500"}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#8c8277] text-xs">{s.lastLogin}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 text-[#8c8277] hover:text-[#0a0a0a] hover:bg-gray-100 rounded-md transition-colors"><FiEdit2 size={13} /></button>
                        {s.role !== "Owner" && <button className="p-1.5 text-[#8c8277] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><FiTrash2 size={13} /></button>}
                      </div>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>}

      {
    /* Roles Tab */
  }
      {tab === "Roles" && <div className="space-y-4">
          {showRoleForm && <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#f0ebe2]/30 border border-[#c9b99a]/40 rounded-xl p-5 space-y-4"
  >
              <p className="font-semibold text-sm text-[#0a0a0a]">New Role</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#8c8277] font-medium block mb-1">Role Name</label>
                  <input
    value={newRole.name}
    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
    placeholder="e.g. Store Manager"
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e]"
  />
                </div>
                <div>
                  <label className="text-xs text-[#8c8277] font-medium block mb-1">Description</label>
                  <input
    value={newRole.description}
    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
    placeholder="Brief description"
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e]"
  />
                </div>
              </div>
              <div>
                <label className="text-xs text-[#8c8277] font-medium block mb-2">Permissions</label>
                <div className="flex flex-wrap gap-3">
                  {permAreas.map((area) => <label key={area} className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300 text-[#2d4a3e]" />
                      <span>{area}</span>
                    </label>)}
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] text-white text-sm rounded-lg hover:bg-[#2d4a3e] transition-colors">
                  <FiSave size={14} /> Create Role
                </button>
                <button onClick={() => setShowRoleForm(false)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                  <FiX size={14} /> Cancel
                </button>
              </div>
            </motion.div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((r) => <div key={r.id} className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-[#0a0a0a]">{r.name}</h3>
                    <p className="text-sm text-[#8c8277] mt-1">{r.description}</p>
                  </div>
                  <button className="p-1.5 text-[#8c8277] hover:text-[#0a0a0a] hover:bg-gray-100 rounded-md transition-colors">
                    <FiEdit2 size={14} />
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-[#8c8277]">{r.staffCount} staff member{r.staffCount !== 1 ? "s" : ""}</span>
                  <span className="text-xs px-2.5 py-1 bg-[#f0ebe2] text-[#8c8277] rounded-full">{r.permissions}</span>
                </div>
              </div>)}
          </div>
        </div>}

      {
    /* Permissions Tab */
  }
      {tab === "Permissions" && <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="font-semibold text-sm text-[#0a0a0a]">Permission Matrix</p>
            <p className="text-xs text-[#8c8277] mt-0.5">Toggle to grant or revoke access per role</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#8c8277] uppercase tracking-wider">Role</th>
                  {permAreas.map((a) => <th key={a} className="text-center px-3 py-3 text-xs font-semibold text-[#8c8277] uppercase tracking-wider whitespace-nowrap">{a}</th>)}
                </tr>
              </thead>
              <tbody>
                {roles.map((r) => <tr key={r.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/20 transition-colors">
                    <td className="px-5 py-4 font-medium text-[#0a0a0a] whitespace-nowrap">{r.name}</td>
                    {permAreas.map((_, idx) => {
    const allowed = matrix[r.name]?.[idx] ?? false;
    return <td key={idx} className="px-3 py-4 text-center">
                          <button
      onClick={() => r.name !== "Owner" && togglePerm(r.name, idx)}
      disabled={r.name === "Owner"}
      className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto transition-colors ${allowed ? "bg-[#2d4a3e]/15 text-[#2d4a3e] hover:bg-[#2d4a3e]/25" : "bg-red-50 text-red-400 hover:bg-red-100"} ${r.name === "Owner" ? "cursor-default opacity-70" : "cursor-pointer"}`}
    >
                            {allowed ? <FiCheck size={13} /> : <FiX size={13} />}
                          </button>
                        </td>;
  })}
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>}
    </div>;
}
export {
  UsersPage as default
};
