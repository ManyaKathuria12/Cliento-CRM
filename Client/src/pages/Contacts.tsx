import { useState, useEffect } from "react";
import { Search, Plus, Phone, Mail, MapPin, Building } from "lucide-react";
import { getAuthHeaders } from "@/utils/api";

const phoneRegex = /^\d{10}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sanitizePhone = (value: string) => value.replace(/\D/g, "").slice(0, 10);
const emptyForm = {
  name: "",
  company: "",
  email: "",
  phone: "",
  city: "",
  role: "",
};

const Contacts = () => {
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<any | null>(null);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);

  const [form, setForm] = useState(emptyForm);

  // 🔥 FETCH FROM BACKEND
  const fetchContacts = async () => {
    const res = await fetch("http://localhost:5000/api/contacts", { headers: getAuthHeaders() });
    const data = await res.json();
    setContacts(data);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleAddContact = () => {
    setEditingContact(null);
    setSelectedContact(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingContact(null);
    setForm(emptyForm);
  };

  // 🔥 ADD / UPDATE
  const handleSave = async () => {
    if (!form.name) return alert("Name required");
    if (!emailRegex.test(form.email)) return alert("Please enter a valid email address");
    if (!phoneRegex.test(form.phone)) return alert("Phone number must be exactly 10 digits");

    if (editingContact) {
      await fetch(`http://localhost:5000/api/contacts/${editingContact._id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      });
    } else {
      await fetch("http://localhost:5000/api/contacts", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      });
      fetchContacts();
    }

    handleCloseModal();

    fetchContacts();
  };

  // 🔥 DELETE
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;

    await fetch(`http://localhost:5000/api/contacts/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    setSelectedContact(null);
    fetchContacts();
  };

  // 🔥 EDIT
  const handleEdit = (c: any) => {
    setForm({ ...c, phone: sanitizePhone(c.phone || "") });
    setEditingContact(c);
    setSelectedContact(null);
    setShowModal(true);
  };

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
          <p className="text-sm text-muted-foreground mt-1">{contacts.length} contacts</p>
        </div>

        <button
          onClick={handleAddContact}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-cyan text-primary-foreground px-5 py-2 rounded-xl text-sm"
        >
          <Plus size={16} /> Add Contact
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search contacts..."
          className="w-full bg-secondary/50 border border-border/50 rounded-xl pl-9 pr-4 py-2 text-sm"
        />
      </div>

      {/* GRID */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((c) => (
          <div
            key={c._id}
            onClick={() => setSelectedContact(c)}
            className="glass rounded-2xl p-5 hover-lift gradient-border cursor-pointer"
          >

            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-cyan/20 flex items-center justify-center text-primary font-bold text-lg">
                  {c.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.role}</p>
                </div>
              </div>

              {/* 🔥 EDIT + DELETE */}
            </div>

            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Building size={12} /> {c.company}</div>
              <div className="flex items-center gap-2"><Mail size={12} /> {c.email}</div>
              <div className="flex items-center gap-2"><Phone size={12} /> {c.phone}</div>
              <div className="flex items-center gap-2"><MapPin size={12} /> {c.city}</div>
            </div>

          </div>
        ))}
      </div>

      {/* 🔥 MODAL */}
      {/* DETAIL MODAL */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-card p-5 rounded-2xl w-[350px] space-y-3">

            <h2 className="text-xl font-semibold text-center">
              {selectedContact.name}
            </h2>
            <p className="text-sm text-muted-foreground text-center -mt-1 mb-2">{selectedContact.role}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Company */}
              <div className="rounded-xl border border-border bg-[#0f1f24] p-3">
                <p className="text-xs text-muted-foreground mb-1">Company</p>
                <p className="font-medium text-white text-sm">{selectedContact.company}</p>
              </div>

              {/* City */}
              <div className="rounded-xl border border-border bg-[#0f1f24] p-3">
                <p className="text-xs text-muted-foreground mb-1">City</p>
                <p className="font-medium text-white text-sm">{selectedContact.city}</p>
              </div>

              {/* Phone */}
              <div className="rounded-xl border border-border bg-[#0f1f24] p-3">
                <p className="text-xs text-muted-foreground mb-1">Phone</p>
                <p className="font-medium text-white text-sm">{selectedContact.phone}</p>
              </div>

              {/* Email */}
              <div className="rounded-xl border border-border bg-[#0f1f24] p-3">
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="font-medium text-white text-sm break-all w-full">{selectedContact.email}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(selectedContact)}
                className="w-1/2 border py-2 rounded-xl"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(selectedContact._id)}
                className="w-1/2 bg-red-500 text-white py-2 rounded-xl"
              >
                Delete
              </button>
            </div>

            <button
              onClick={() => setSelectedContact(null)}
              className="w-full bg-primary text-white py-2 rounded-xl"
            >
              Close
            </button>

          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-card p-6 rounded-2xl w-[350px]">

            <h2 className="text-lg font-semibold text-center mb-1">
              {editingContact ? "Edit Contact" : "Add Contact"}
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-3">{editingContact ? "Update contact details" : "Add a new contact"}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Name - full width */}
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Name</p>
                <input
                  value={(form as any).name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1a2a2f] border border-[#2e444a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Company */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Company</p>
                <input
                  value={(form as any).company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1a2a2f] border border-[#2e444a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Role */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Role</p>
                <input
                  value={(form as any).role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1a2a2f] border border-[#2e444a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Phone */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Phone</p>
                <input
                  value={(form as any).phone}
                  inputMode="numeric"
                  maxLength={10}
                  onChange={(e) => setForm({ ...form, phone: sanitizePhone(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1a2a2f] border border-[#2e444a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* City */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">City</p>
                <input
                  value={(form as any).city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1a2a2f] border border-[#2e444a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Email - full width */}
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <input
                  type="email"
                  value={(form as any).email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1a2a2f] border border-[#2e444a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCloseModal}
                className="w-1/2 border py-2 rounded-xl"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="w-1/2 bg-primary text-white py-2 rounded-xl"
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Contacts;
