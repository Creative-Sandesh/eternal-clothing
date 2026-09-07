import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiShield, FiSave } from "react-icons/fi";
import { userApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const TABS = ["Staff", "Roles", "Permissions"];

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

const emptyStaffForm = { firstName: "", lastName: "", email: "", password: "", role: "STAFF" };

function UsersPage() {
  const { user: me } = useAuth();
  const [tab, setTab] = useState("Staff");
  const [matrix, setMatrix] = useState(permMatrix);

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyStaffForm);

  const loadStaff = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userApi.getStaff();
      setStaff((res.data || []).map((u) => ({
        id: u.id,
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Staff Member",
        email: u.email,
        role: u.role,
        phoneNumber: u.phoneNumber || "",
        joined: u.createdAt
          ? new Date(u.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
          : "—",
        initials: `${(u.firstName || "S")[0]}${(u.lastName || "M")[0]}`
      })));
      setError("");
    } catch (err) {
      console.error("Failed to load staff list", err);
      setError(err.message || "Failed to load staff");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyStaffForm);
    setShowForm(true);
  }

  function openEdit(s) {
    setEditingId(s.id);
    setForm({ firstName: s.firstName, lastName: s.lastName, email: s.email, password: "", role: s.role });
    setShowForm(true);
  }

  async function handleSubmit() {
    if (!form.firstName || !form.lastName || !form.email || (!editingId && !form.password)) {
      setError("First name, last name, email and password are required");
      return;
    }
    try {
      setSaving(true);
      setError("");
      if (editingId) {
        await userApi.updateStaff(editingId, {
          firstName: form.firstName,
          lastName: form.lastName,
          role: form.role
        });
      } else {
        await userApi.createStaff(form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyStaffForm);
      await loadStaff();
    } catch (err) {
      console.error("Failed to save staff user", err);
      setError(err.message || "Failed to save staff user");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await userApi.deleteStaff(id);
      setStaff((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete staff user", err);
      setError(err.message || "Failed to delete staff user");
    }
  }

  function togglePerm(role, idx) {
    setMatrix((prev) => {
      const row = [...(prev[role] ?? [])];
      row[idx] = !row[idx];
      return { ...prev, [role]: row };
    });
  }

  const [showRoleForm, setShowRoleForm] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", description: "" });

  return <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-[#0a0a0a]">Staff & Roles</h1>
          <p className="text-sm text-[#8c8277] mt-0.5">Manage team access and permissions</p>
        </div>
        {tab === "Staff" && <button
    onClick={showForm ? () => setShowForm(false) : openCreate}
    className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] text-white text-sm font-medium rounded-lg hover:bg-[#2d4a3e] transition-colors"
  >
            <FiPlus size={16} /> Add Staff
          </button>}
        {tab === "Roles" && <button
    onClick={() => setShowRoleForm(!showRoleForm)}
    className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] text-white text-sm font-medium rounded-lg hover:bg-[#2d4a3e] transition-colors"
  >
            <FiPlus size={16} /> Create Role
          </button>}
      </div>

      {error && <div className="px-4 py-2.5 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map((t) => <button
    key={t}
    onClick={() => setTab(t)}
    className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${tab === t ? "bg-white text-[#0a0a0a] shadow-sm" : "text-[#8c8277] hover:text-[#0a0a0a]"}`}
  >
            {t}
          </button>)}
      </div>

      {/* Staff Tab */}
      {tab === "Staff" && <div className="space-y-4">
          {showForm && <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#f0ebe2]/30 border border-[#c9b99a]/40 rounded-xl p-5 space-y-4"
  >
              <p className="font-semibold text-sm text-[#0a0a0a]">{editingId ? "Edit Staff Member" : "New Staff Member"}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#8c8277] font-medium block mb-1">First Name</label>
                  <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e]" />
                </div>
                <div>
                  <label className="text-xs text-[#8c8277] font-medium block mb-1">Last Name</label>
                  <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e]" />
                </div>
                <div>
                  <label className="text-xs text-[#8c8277] font-medium block mb-1">Email</label>
                  <input type="email" value={form.email} disabled={!!editingId} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e] disabled:bg-gray-50 disabled:text-[#8c8277]" />
                </div>
                <div>
                  <label className="text-xs text-[#8c8277] font-medium block mb-1">Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e] bg-white">
                    <option value="STAFF">Staff</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                {!editingId && <div className="col-span-2">
                  <label className="text-xs text-[#8c8277] font-medium block mb-1">Temporary Password</label>
                  <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="They can change it after first login" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e]" />
                </div>}
              </div>
              <div className="flex gap-3">
                <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] text-white text-sm rounded-lg hover:bg-[#2d4a3e] transition-colors disabled:opacity-60">
                  <FiSave size={14} /> {saving ? "Saving…" : editingId ? "Update" : "Create"}
                </button>
                <button onClick={() => { setShowForm(false); setEditingId(null); }} className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                  <FiX size={14} /> Cancel
                </button>
              </div>
            </motion.div>}

          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Staff Member", "Role", "Joined", "Actions"].map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#8c8277] uppercase tracking-wider">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={4} className="px-5 py-10 text-center text-[#8c8277]">Loading…</td></tr>
                : staff.length === 0 ? <tr><td colSpan={4} className="px-5 py-10 text-center text-[#8c8277]">No staff users yet.</td></tr>
                : staff.map((s) => <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 bg-[#2d4a3e]">
                          {s.initials}
                        </div>
                        <div>
                          <p className="font-medium text-[#0a0a0a]">{s.name}{s.id === me?.id && <span className="text-xs text-[#8c8277] font-normal"> (you)</span>}</p>
                          <p className="text-xs text-[#8c8277]">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f0ebe2] text-[#8c8277]">
                        <FiShield size={10} /> {s.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#8c8277] text-xs">{s.joined}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(s)} className="p-1.5 text-[#8c8277] hover:text-[#0a0a0a] hover:bg-gray-100 rounded-md transition-colors"><FiEdit2 size={13} /></button>
                        {s.id !== me?.id && <button onClick={() => handleDelete(s.id)} className="p-1.5 text-[#8c8277] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><FiTrash2 size={13} /></button>}
                      </div>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>}

      {/* Roles Tab — reference only (no backend model for custom roles) */}
      {tab === "Roles" && <div className="space-y-4">
          <p className="text-xs text-[#8c8277]">Reference matrix — the backend currently supports the <code>ADMIN</code> and <code>STAFF</code> roles only.</p>
          {showRoleForm && <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#f0ebe2]/30 border border-[#c9b99a]/40 rounded-xl p-5 space-y-4"
  >
              <p className="font-semibold text-sm text-[#0a0a0a]">New Role (local preview)</p>
              <div className="grid grid-cols-2 gap-4">
                <input value={newRole.name} onChange={(e) => setNewRole({ ...newRole, name: e.target.value })} placeholder="Role name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e]" />
                <input value={newRole.description} onChange={(e) => setNewRole({ ...newRole, description: e.target.value })} placeholder="Description" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d4a3e]" />
              </div>
              <button onClick={() => setShowRoleForm(false)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                <FiX size={14} /> Close
              </button>
            </motion.div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((r) => <div key={r.id} className="bg-white border border-gray-100 rounded-xl p-5">
                <h3 className="font-semibold text-[#0a0a0a]">{r.name}</h3>
                <p className="text-sm text-[#8c8277] mt-1">{r.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-[#8c8277]">{r.staffCount} staff member{r.staffCount !== 1 ? "s" : ""}</span>
                  <span className="text-xs px-2.5 py-1 bg-[#f0ebe2] text-[#8c8277] rounded-full">{r.permissions}</span>
                </div>
              </div>)}
          </div>
        </div>}

      {/* Permissions Tab — reference only */}
      {tab === "Permissions" && <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="font-semibold text-sm text-[#0a0a0a]">Permission Matrix</p>
            <p className="text-xs text-[#8c8277] mt-0.5">Reference only — not enforced by the backend yet</p>
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
