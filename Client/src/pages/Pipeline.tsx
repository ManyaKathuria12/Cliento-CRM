import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useState, useEffect } from "react";
import { IndianRupee, Calendar, User, Search, Building, Clock } from "lucide-react";
import { getAuthHeaders, authFetch } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

interface Deal {
  id: string;
  title: string;
  company: string;
  value: string;
  contact: string;
  stage: string;
  createdAt: string;
  updatedAt: string;
}

const STAGES = {
  new: { title: "New Lead", color: "bg-teal-500", border: "border-teal-500/20" },
  contacted: { title: "Contacted", color: "bg-blue-500", border: "border-blue-500/20" },
  qualified: { title: "Qualified", color: "bg-yellow-500", border: "border-yellow-500/20" },
  proposal: { title: "Proposal Sent", color: "bg-amber-500", border: "border-amber-500/20" },
  negotiation: { title: "Negotiation", color: "bg-purple-500", border: "border-purple-500/20" },
  won: { title: "Won", color: "bg-emerald-500", border: "border-emerald-500/20" },
  lost: { title: "Lost", color: "bg-rose-500", border: "border-rose-500/20" },
};

const mapStageToKey = (stage?: string): string => {
  if (!stage) return "new";
  const s = stage.toLowerCase();
  if (s === "new" || s === "new lead") return "new";
  if (s === "contacted") return "contacted";
  if (s === "qualified") return "qualified";
  if (s === "proposal" || s === "proposal sent") return "proposal";
  if (s === "negotiation") return "negotiation";
  if (s === "won") return "won";
  if (s === "lost") return "lost";
  return "new"; // default fallback for other stages like contacted
};

export default function Pipeline() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [columns, setColumns] = useState(() => ({
    new: [] as Deal[],
    contacted: [] as Deal[],
    qualified: [] as Deal[],
    proposal: [] as Deal[],
    negotiation: [] as Deal[],
    won: [] as Deal[],
    lost: [] as Deal[],
  }));
  const [loading, setLoading] = useState(true);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/deals", { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to fetch deals");
      const data = await res.json();
      
      const items = Array.isArray(data) ? data : data?.deals || [];
      const cols = {
        new: [] as Deal[],
        contacted: [] as Deal[],
        qualified: [] as Deal[],
        proposal: [] as Deal[],
        negotiation: [] as Deal[],
        won: [] as Deal[],
        lost: [] as Deal[],
      };

      items.forEach((d: any) => {
        const stageKey = mapStageToKey(d.stage) as keyof typeof cols;
        const deal: Deal = {
          id: d._id,
          title: d.title || "Untitled Deal",
          company: d.company || "No Company",
          value: d.value || "0",
          contact: d.contact || "N/A",
          stage: stageKey,
          createdAt: d.createdAt || new Date().toISOString(),
          updatedAt: d.updatedAt || new Date().toISOString(),
        };
        cols[stageKey].push(deal);
      });

      setColumns(cols);
    } catch (err: any) {
      toast.error(err.message || "Failed to load pipeline deals ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceColId = source.droppableId as keyof typeof columns;
    const destColId = destination.droppableId as keyof typeof columns;

    const sourceDeals = [...columns[sourceColId]];
    const destDeals = [...columns[destColId]];

    const [moved] = sourceDeals.splice(source.index, 1);
    
    // Update local stage
    moved.stage = destColId;
    moved.updatedAt = new Date().toISOString();

    if (sourceColId === destColId) {
      sourceDeals.splice(destination.index, 0, moved);
      setColumns((prev) => ({
        ...prev,
        [sourceColId]: sourceDeals,
      }));
    } else {
      destDeals.splice(destination.index, 0, moved);
      setColumns((prev) => ({
        ...prev,
        [sourceColId]: sourceDeals,
        [destColId]: destDeals,
      }));
    }

    try {
      // Persist deal stage to database
      const res = await fetch(`http://localhost:5000/api/deals/${moved.id}`, {
        method: "PUT",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stage: destColId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save pipeline changes to backend");
      }
      toast.success(`Moved to ${STAGES[destColId].title}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save deal stage ❌");
      // Rollback changes by reloading deals
      fetchDeals();
    }
  };

  const formatValue = (val?: string) => {
    const num = Number(val || 0);
    return num.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });
  };

  const getColumnTotal = (deals: Deal[]) => {
    return deals
      .filter((d) => d.title.toLowerCase().includes(search.toLowerCase()))
      .reduce((sum, d) => sum + Number(d.value || 0), 0);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return "N/A";
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full px-6 lg:px-8 pb-12">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sales Pipeline</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage deal stages, drag & drop cards, and review pipe values.
        </p>
      </div>

      {/* SEARCH BAR */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search deals by name..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border/80 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all text-sm"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading deal pipeline...</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-5 overflow-x-auto pb-8 pt-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {Object.entries(STAGES).map(([colId, stageInfo]) => {
              const deals = columns[colId as keyof typeof columns] || [];
              const filteredDeals = deals.filter((d) =>
                d.title.toLowerCase().includes(search.toLowerCase())
              );

              return (
                <div key={colId} className="w-[300px] flex-shrink-0 flex flex-col max-h-[70vh]">
                  {/* Column Header */}
                  <div className="flex items-center gap-2 mb-4 bg-secondary/30 p-3 rounded-xl border border-border/40">
                    <span className={`w-2 h-2 rounded-full ${stageInfo.color}`} />
                    <span className="text-sm font-bold text-foreground truncate">{stageInfo.title}</span>
                    <span className="text-xs text-muted-foreground">({filteredDeals.length})</span>
                    <span className="ml-auto text-xs font-semibold text-primary">
                      {formatValue(getColumnTotal(deals).toString())}
                    </span>
                  </div>

                  {/* Droppable Area */}
                  <Droppable droppableId={colId}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto no-scrollbar space-y-3 p-2 rounded-xl transition-colors min-h-[150px] border border-dashed ${
                          snapshot.isDraggingOver
                            ? "bg-secondary/40 border-primary/30"
                            : "border-transparent"
                        }`}
                      >
                        {filteredDeals.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border/30 rounded-xl">
                            <p className="text-xs text-muted-foreground">No deals</p>
                          </div>
                        ) : (
                          filteredDeals.map((deal, idx) => (
                            <Draggable key={deal.id} draggableId={deal.id} index={idx}>
                              {(providedSnapshot, dragSnapshot) => (
                                <div
                                  ref={providedSnapshot.innerRef}
                                  {...providedSnapshot.draggableProps}
                                  {...providedSnapshot.dragHandleProps}
                                  className={`glass p-4 rounded-xl border transition-all duration-200 hover:border-primary/50 relative group ${
                                    dragSnapshot.isDragging
                                      ? "border-primary/80 bg-background/90 shadow-2xl scale-[1.02]"
                                      : "border-border/60 hover:bg-secondary/20"
                                  }`}
                                >
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-start gap-2">
                                      <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-tight">
                                        {deal.title}
                                      </h4>
                                    </div>

                                    <div className="space-y-1 text-xs text-muted-foreground">
                                      <div className="flex items-center gap-1.5">
                                        <Building size={12} className="shrink-0 text-muted-foreground/80" />
                                        <span className="truncate">{deal.company}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <User size={12} className="shrink-0 text-muted-foreground/80" />
                                        <span className="truncate">Owner: {user?.name || "Unassigned"}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/75 pt-1">
                                        <Clock size={11} className="shrink-0" />
                                        <span>Updated: {formatDate(deal.updatedAt)}</span>
                                      </div>
                                    </div>

                                    <div className="border-t border-border/40 pt-2.5 flex justify-between items-center">
                                      <span className="text-xs text-muted-foreground">Value</span>
                                      <span className="font-bold text-sm text-foreground flex items-center">
                                        <IndianRupee size={12} className="text-muted-foreground shrink-0" />
                                        {Number(deal.value || 0).toLocaleString("en-IN")}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}
    </div>
  );
}
