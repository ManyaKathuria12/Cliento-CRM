import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useState, useEffect } from "react";
import { IndianRupee, Calendar, User } from "lucide-react";

interface Deal {
  id: string;
  title: string;
  company: string;
  value: string;
  contact: string;
  date: string;
  stage?: string;
  notes?: string;
  leadId?: string;
  createdAt?: string;
  activity?: Array<{ action: string; timestamp: string }>;
}

const getInitialColumns = () => ({
  new: { title: "New", color: "bg-emerald-500", deals: [] as Deal[] },
  contacted: { title: "Contacted", color: "bg-blue-500", deals: [] as Deal[] },
  qualified: { title: "Qualified", color: "bg-yellow-500", deals: [] as Deal[] },
  won: { title: "Won", color: "bg-green-500", deals: [] as Deal[] },
  lost: { title: "Lost", color: "bg-red-500", deals: [] as Deal[] },
});

export default function Deals() {
  const [columns, setColumns] = useState(() => getInitialColumns());
  const [leads, setLeads] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<string | null>(null);
  const [newDeal, setNewDeal] = useState<Partial<Deal>>({
    title: "",
    company: "",
    value: "",
    contact: "",
    stage: "new",
    leadId: "",
    notes: "",
  });
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchDeals();
    fetchLeads();
  }, []);

  const fetchDeals = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/deals");
      const data = await res.json();
      const items = Array.isArray(data) ? data : data?.deals || [];
      const cols = getInitialColumns() as any;
      items.forEach((d: any) => {
        const stageKey = (d.stage || "new").toLowerCase();
        if (!cols[stageKey]) {
          cols[stageKey] = { title: stageKey.charAt(0).toUpperCase() + stageKey.slice(1), color: "bg-gray-500", deals: [] };
        }
        const deal: Deal = {
          id: d._id,
          title: d.title || "",
          company: d.company || "No Company",
          value: d.value || "0",
          contact: d.contact || "N/A",
          date: d.date || "",
          stage: stageKey,
          notes: d.notes || "",
          leadId: d.leadId,
          createdAt: d.createdAt,
          activity: d.activity || [],
        };
        cols[stageKey].deals.push(deal);
      });
      setColumns(cols);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchLeads = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/leads");
      const data = await res.json();
      setLeads(data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = { ...columns[source.droppableId as keyof typeof columns] } as any;
    const destCol = { ...columns[destination.droppableId as keyof typeof columns] } as any;
    const [moved] = sourceCol.deals.splice(source.index, 1);
    moved.stage = destination.droppableId;
    destCol.deals.splice(destination.index, 0, moved);

    setColumns((prev: any) => ({
      ...prev,
      [source.droppableId]: sourceCol,
      [destination.droppableId]: destCol,
    }));

    // persist
    fetch(`http://localhost:5000/api/deals/${moved.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(moved),
    }).catch((e) => console.log(e));
  };

  const addDeal = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDeal),
      });
      const data = await res.json();
      const selectedLead = leads.find((l) => l._id === newDeal.leadId);
      const deal: Deal = {
        id: data._id,
        title: data.title || newDeal.title || "",
        company: (selectedLead?.company as string) || newDeal.company || "No Company",
        value: data.value || (newDeal.value as string) || "0",
        contact: data.contact || (newDeal.contact as string) || "N/A",
        date: data.date || "",
        stage: data.stage || (newDeal.stage as string) || "new",
        notes: data.notes || (newDeal.notes as string) || "",
        createdAt: data.createdAt,
        activity: data.activity || [],
      };

      setColumns((prev: any) => ({
        ...prev,
        [deal.stage]: {
          ...prev[deal.stage],
          deals: [...prev[deal.stage].deals, deal],
        },
      }));

      setNewDeal({ title: "", company: "", value: "", contact: "", stage: "new", leadId: "", notes: "" });
      setShowModal(false);
    } catch (err) {
      console.log(err);
    }
  };

  const confirmDelete = (id: string) => {
    setDealToDelete(id);
    setShowDeleteConfirm(true);
  };

  const deleteDeal = async () => {
    if (!dealToDelete) return;
    try {
      await fetch(`http://localhost:5000/api/deals/${dealToDelete}`, { method: "DELETE" });
      const updated = { ...columns } as any;
      Object.keys(updated).forEach((col) => {
        updated[col].deals = updated[col].deals.filter((d: Deal) => d.id !== dealToDelete);
      });
      setColumns(updated);
      setSelectedDeal(null);
      setShowDeleteConfirm(false);
      setDealToDelete(null);
    } catch (err) {
      console.log(err);
      alert("Delete failed");
    }
  };

  const updateDeal = async () => {
    if (!selectedDeal) return;
    try {
      const res = await fetch(`http://localhost:5000/api/deals/${selectedDeal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedDeal),
      });
      const updatedDeal = await res.json();
      const updated = { ...columns } as any;
      Object.keys(updated).forEach((col) => {
        updated[col].deals = updated[col].deals.filter((d: Deal) => d.id !== updatedDeal._id);
      });
      const stage = updatedDeal.stage || selectedDeal.stage || "new";
      const newD: Deal = {
        id: updatedDeal._id,
        title: updatedDeal.title || selectedDeal.title,
        company: updatedDeal.company || selectedDeal.company || "No Company",
        value: updatedDeal.value || selectedDeal.value || "0",
        contact: updatedDeal.contact || selectedDeal.contact || "N/A",
        date: updatedDeal.date || selectedDeal.date || "",
        stage,
        notes: updatedDeal.notes || selectedDeal.notes || "",
        createdAt: updatedDeal.createdAt || selectedDeal.createdAt,
        activity: updatedDeal.activity || selectedDeal.activity || [],
      };
      updated[stage].deals.push(newD);
      setColumns(updated);
      setIsEditing(false);
      setSelectedDeal(null);
    } catch (err) {
      console.log(err);
    }
  };

  const formatValue = (v?: string) => {
    const n = Number(v || 0);
    return n.toLocaleString("en-IN", { style: "currency", currency: "INR" }).replace("INR", "");
  };

  const getTotal = (deals: Deal[]) => deals.reduce((sum, d) => sum + Number(d.value || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Deals Pipeline</h1>
        <button onClick={() => setShowModal(true)} className="bg-primary text-white px-4 py-2 rounded-xl">+ Add Deal</button>
      </div>

      <input
        placeholder="Search deals..."
        className="w-full max-w-2xl px-4 py-2 rounded-full bg-[#1a2a2f] border border-[#2e444a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
        onChange={(e) => setSearch(e.target.value)}
      />

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-16 mt-8">
          {Object.entries(columns).map(([colId, col]) => (
            <div key={colId} className="w-[300px] flex-shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${col.color}`} />
                <span className="text-sm font-semibold">
                  {col.title}
                  <span className="ml-2 text-muted-foreground">({col.deals.length})</span>
                </span>
                <span className="ml-auto text-sm font-semibold text-white">{formatValue(getTotal(col.deals).toString())}</span>
              </div>

              <Droppable droppableId={colId}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3 min-h-[200px]">
                    {col.deals
                      .filter((d: Deal) => (d.title || "").toLowerCase().includes(search.toLowerCase()))
                      .map((deal: Deal, i: number) => (
                        <Draggable key={deal.id} draggableId={deal.id} index={i}>
                          {(prov) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              onClick={() => {
                                setSelectedDeal(deal);
                                setIsEditing(false);
                              }}
                              className="p-4 rounded-xl border border-border cursor-pointer transition-all duration-200 hover:border-primary/40 hover:bg-[#0f1f24]"
                            >
                              <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-semibold text-white">{deal.title}</h4>
                                  <span className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary">{col.title}</span>
                                </div>
                                <p className={`text-sm ${deal.company === "No Company" ? "text-muted-foreground italic" : "text-muted-foreground"}`}>{deal.company}</p>
                                <p className={`text-sm ${deal.contact === "N/A" ? "text-muted-foreground italic" : "text-muted-foreground"}`}>{deal.contact}</p>
                                <p className="text-xs text-muted-foreground opacity-70">Created {new Date(deal.createdAt).toLocaleDateString()}</p>
                              </div>
                              <div className="mt-3 text-lg font-bold text-white">{formatValue(deal.value)}</div>
                            </div>
                          )}
                        </Draggable>
                      ))}

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-card p-6 rounded-2xl w-[350px] space-y-4">
            <h2 className="text-lg font-semibold text-center">Add Deal</h2>

            <select
              aria-label="Select Lead"
              className="w-full px-4 py-2 rounded-xl bg-[#1a2a2f] text-white"
              onChange={(e) => setNewDeal({ ...newDeal, leadId: e.target.value })}
            >
              <option value="">Select Lead</option>
              {leads.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.name} - {l.company}
                </option>
              ))}
            </select>

            <input
              value={newDeal.title}
              placeholder="Title"
              aria-label="Deal Title"
              className="w-full px-4 py-2 rounded-xl bg-[#1a2a2f] border border-[#2e444a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
            />

            <input
              value={newDeal.value}
              placeholder="Value"
              aria-label="Deal Value"
              className="w-full px-4 py-2 rounded-xl bg-[#1a2a2f] border border-[#2e444a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })}
            />

            <textarea
              placeholder="Add notes..."
              value={newDeal.notes}
              onChange={(e) => setNewDeal({ ...newDeal, notes: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#1a2a2f] border border-[#2e444a] text-white placeholder-gray-400"
            />

            <select
              aria-label="Stage"
              value={newDeal.stage}
              className="w-full px-4 py-2 rounded-xl bg-[#1a2a2f] border border-[#2e444a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value })}
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>

            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="w-1/2 border py-2 rounded-xl">Cancel</button>
              <button onClick={addDeal} className="w-1/2 bg-primary text-white py-2 rounded-xl">Add</button>
            </div>
          </div>
        </div>
      )}

      {selectedDeal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-card p-6 rounded-2xl w-[350px] space-y-4">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-xl font-semibold">{isEditing ? "Edit Deal" : selectedDeal.title}</h2>
              {!isEditing && (
                <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">{selectedDeal.stage}</span>
              )}
            </div>

            {!isEditing ? (
              <>
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-[#0f1f24] p-4">
                    <p className="text-xs text-muted-foreground mb-1">Company</p>
                    <p className="font-medium text-white">{selectedDeal.company}</p>
                  </div>

                  <div className="rounded-xl border border-border bg-[#0f1f24] p-4">
                    <p className="text-xs text-muted-foreground mb-1">Phone</p>
                    <p className="font-medium text-white">{selectedDeal.contact}</p>
                  </div>

                  <div className="rounded-xl border border-border bg-[#0f1f24] p-4">
                    <p className="text-xs text-muted-foreground mb-1">Amount</p>
                    <p className="text-2xl font-bold text-white">{formatValue(selectedDeal.value)}</p>
                  </div>

                  {selectedDeal.notes && (
                    <div className="rounded-xl border border-border bg-[#0f1f24] p-4">
                      <p className="text-xs text-muted-foreground mb-1">Notes</p>
                      <p className="text-white">{selectedDeal.notes}</p>
                    </div>
                  )}

                  {selectedDeal.activity && selectedDeal.activity.length > 0 && (
                    <div className="rounded-xl border border-border bg-[#0f1f24] p-4">
                      <p className="text-xs text-muted-foreground mb-3">Activity Timeline</p>
                      <div className="space-y-3">
                        {[...selectedDeal.activity].reverse().map((act, idx) => (
                          <div key={idx} className="flex gap-3 text-sm">
                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                            <div>
                              <p className="text-white font-medium">{act.action}</p>
                              <p className="text-xs text-muted-foreground">{new Date(act.timestamp).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setIsEditing(true)} className="w-1/2 border py-2 rounded-xl">Edit</button>
                  <button onClick={() => confirmDelete(selectedDeal.id)} className="w-1/2 bg-red-500 text-white py-2 rounded-xl">Delete</button>
                </div>

                <button onClick={() => setSelectedDeal(null)} className="w-full bg-primary text-white py-2 rounded-xl">Close</button>
              </>
            ) : (
              <>
                <input aria-label="Deal Title" placeholder="Title" value={selectedDeal.title} className="w-full px-4 py-2 rounded-xl bg-[#1a2a2f] text-white" onChange={(e) => setSelectedDeal({ ...selectedDeal, title: e.target.value })} />
                <input aria-label="Company" placeholder="Company" value={selectedDeal.company} className="w-full px-4 py-2 rounded-xl bg-[#1a2a2f] text-white" onChange={(e) => setSelectedDeal({ ...selectedDeal, company: e.target.value })} />
                <input aria-label="Deal Value" placeholder="Value" value={selectedDeal.value} className="w-full px-4 py-2 rounded-xl bg-[#1a2a2f] text-white" onChange={(e) => setSelectedDeal({ ...selectedDeal, value: e.target.value })} />
                <input aria-label="Contact" placeholder="Contact" value={selectedDeal.contact} className="w-full px-4 py-2 rounded-xl bg-[#1a2a2f] text-white" onChange={(e) => setSelectedDeal({ ...selectedDeal, contact: e.target.value })} />

                <select aria-label="Stage" value={selectedDeal.stage} className="w-full px-4 py-2 rounded-xl bg-[#1a2a2f] text-white" onChange={(e) => setSelectedDeal({ ...selectedDeal, stage: e.target.value })}>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>

                <textarea placeholder="Add notes..." value={selectedDeal.notes || ""} className="w-full px-4 py-3 rounded-xl bg-[#1a2a2f] border border-[#2e444a] text-white placeholder-gray-400" onChange={(e) => setSelectedDeal({ ...selectedDeal, notes: e.target.value })} />

                <div className="flex gap-2">
                  <button onClick={() => setIsEditing(false)} className="w-1/2 border py-2 rounded-xl">Cancel</button>
                  <button onClick={updateDeal} className="w-1/2 bg-primary text-white py-2 rounded-xl">Save</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-2xl w-[350px] border border-border">
            <h2 className="text-lg font-semibold text-white mb-2">Delete Deal</h2>
            <p className="text-muted-foreground mb-6">Are you sure you want to delete this deal? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteConfirm(false); setDealToDelete(null); }} className="w-1/2 border py-2 rounded-xl">Cancel</button>
              <button onClick={deleteDeal} className="w-1/2 bg-red-600 text-white py-2 rounded-xl hover:bg-red-700 transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

