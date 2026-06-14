import { useEffect, useState } from "react";
import { Search, Filter, Grid3X3, List, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { getAuthHeaders } from "@/utils/api";

const Leads = () => {
  const [view, setView] = useState<"table" | "cards">("table");
  const [search, setSearch] = useState("");
  const [leads, setLeads] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  const [email, setEmail] = useState("");
const [source, setSource] = useState("");


  const [showFilter, setShowFilter] = useState(false);
  const [filterCity, setFilterCity] = useState("");
  const [filterCompany, setFilterCompany] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);

  // 🔥 FETCH
  const fetchLeads = () => {
    fetch("http://localhost:5000/api/leads", { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => setLeads(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // ✅ ADD
  const handleAddLead = () => {
    if (!name || !company) return alert("Name & Company required");
    if (phone.length !== 10) return alert("Phone number must be exactly 10 digits");

    fetch("http://localhost:5000/api/leads", {
      method: "POST",
      headers: getAuthHeaders(),
    body: JSON.stringify({
  name: toTitleCase(name),
  company: toTitleCase(company),
  phone,
  city: toTitleCase(city),
  email,
  source,
}),
    })
      .then(res => res.json())
      .then(() => {
        fetchLeads();
        setName(""); setCompany(""); setPhone(""); setCity(""); setEmail(""); setSource("");
        setShowAddModal(false);
      });

  };
const toTitleCase = (str: string) =>
  str
    .split(" ")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
    )
    .join(" ");
  


  const filtered = leads.filter((l) => {
  return (
    (l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.company?.toLowerCase().includes(search.toLowerCase())) &&
    l.city?.toLowerCase().includes(filterCity.toLowerCase()) &&
    l.company?.toLowerCase().includes(filterCompany.toLowerCase())
  );
});

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leads</h1>
          <p className="text-sm text-muted-foreground mt-1">{leads.length} total leads</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-cyan text-primary-foreground px-5 py-2 rounded-xl text-sm"
        >
          <Plus size={16} /> Add Lead
        </button>
      </div>

      
     <div className="flex items-center gap-3">

  {/* SEARCH */}
  <div className="relative flex-1 max-w-sm">
    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search leads..."
      className="w-full bg-secondary/50 border border-border/50 rounded-xl pl-9 pr-4 py-2 text-sm"
    />
  </div>

  {showFilter && (
  <div className="flex gap-3 mt-3">
    <input
      placeholder="Filter by City"
      value={filterCity}
      onChange={(e) => setFilterCity(e.target.value)}
      className="border p-2 rounded text-black"
    />

    <input
      placeholder="Filter by Company"
      value={filterCompany}
      onChange={(e) => setFilterCompany(e.target.value)}
      className="border p-2 rounded text-black"
    />
  </div>
)}

  {/* FILTER ICON */}
  <button
    onClick={() => setShowFilter(!showFilter)}
    className="p-2 rounded-xl hover:bg-secondary transition"
  >
    <Filter size={16} />
  </button>

  {/* VIEW TOGGLE */}
  <div className="flex rounded-xl overflow-hidden border">
    <button
      onClick={() => setView("table")}
      className={`p-2 ${view === "table" ? "bg-primary text-white" : ""}`}
    >
      <List size={16} />
    </button>

    <button
      onClick={() => setView("cards")}
      className={`p-2 ${view === "cards" ? "bg-primary text-white" : ""}`}
    >
      <Grid3X3 size={16} />
    </button>
  </div>

</div>
      

      {/* TABLE */}
     {/* TABLE VIEW */}
{view === "table" && (
  <div className="glass rounded-2xl overflow-hidden">
    <table className="w-full">
      <thead>
        <tr>
         {["Name", "Company", "Phone", "City", "Details"].map((h) => (
           <th
  key={h}
  className="px-6 py-4 text-left text-base font-bold text-white"
>
  {h}
</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filtered.map((l) => (
          <tr key={l._id}>
           <td className="px-6 py-4">
  <Link
    to={`/leads/${l._id}`}
    className="text-lg font-semibold hover:text-cyan-400 transition-colors"
  >
    {l.name}
  </Link>
</td>
           <td className="px-6 py-4 text-base font-medium">
  {l.company}
</td>

<td className="px-6 py-4 text-base font-medium">
  {l.phone}
</td>

<td className="px-6 py-4 text-base font-medium">
  {l.city}
</td>

<td className="px-6 py-4">
  <Link
    to={`/leads/${l._id}`}
      className="text-slate-300 hover:text-white hover:underline font-medium"
  >
    View Details
  </Link>
</td>
           
          
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

{/* CARD VIEW */}
{view === "cards" && (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {filtered.map((l) => (
      <div key={l._id} className="p-4 rounded-xl bg-secondary/40 border border-border">
        <h2 className="font-bold text-lg">
  <Link
  to={`/leads/${l._id}`}
  className="
    text-cyan-400
    text-2xl
    font-bold
    hover:text-cyan-300
  "
>
  {l.name}
</Link>
</h2>
        <p className="text-sm text-muted-foreground">{l.company}</p>
        <p className="text-sm">{l.phone}</p>
        <p className="text-sm">{l.city}</p>

    
      </div>
    ))}
   
  </div>
)}

{showAddModal && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="w-full max-w-md bg-slate-900 rounded-2xl p-6 border border-slate-700">
      <h2 className="text-xl font-bold mb-6 text-white">Add Lead</h2>

      {/* Name */}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 mb-3"
      />

      {/* Company */}
      <input
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        placeholder="Company"
        className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 mb-3"
      />

      {/* Phone */}
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
        placeholder="Phone"
        inputMode="numeric"
        className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 mb-3"
      />

      {/* City */}
      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="City"
        className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 mb-3"
      />

      {/* Email */}
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
        className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 mb-3"
      />

      {/* Source */}
      <select
        value={source}
        onChange={(e) => setSource(e.target.value)}
        className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white mb-6"
      >
        <option value="" disabled>
    Select Source
  </option>
        <option value="Website">Website</option>
        <option value="LinkedIn">LinkedIn</option>
        <option value="Instagram">Instagram</option>
        <option value="Referral">Referral</option>
        <option value="Google Ads">Google Ads</option>
      </select>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowAddModal(false)}
          className="px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            handleAddLead();
            setShowAddModal(false);
          }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-cyan text-white hover:opacity-90 transition font-medium"
        >
          Save Lead
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default Leads;