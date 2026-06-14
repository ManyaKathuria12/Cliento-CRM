import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuthHeaders } from "@/utils/api";
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
} from "lucide-react";

interface Lead {
  _id: string;
  name: string;
  company: string;
  phone: string;
  city: string;
  email?: string;
  source?: string;
  status?: string;
  createdAt?: string;
}

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);

  const [showDeleteModal, setShowDeleteModal] =
  useState(false);

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    city: "",
    email: "",
  source: "",
  });

  useEffect(() => {
    fetchLead();
  }, []);

  const fetchLead = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/leads/${id}`,
        { headers: getAuthHeaders() }
      );

      setLead(res.data);

      setFormData({
        name: res.data.name || "",
        company: res.data.company || "",
        phone: res.data.phone || "",
        city: res.data.city || "",
        email: res.data.email || "",
  source: res.data.source || "",
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const saveLead = async () => {
    if (formData.phone.length !== 10) {
      alert("Phone number must be exactly 10 digits");
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/leads/${id}`,
          {
    name: formData.name,
    company: formData.company,
    phone: formData.phone,
    city: formData.city,
    email: formData.email,
    source: formData.source,
  },
        { headers: getAuthHeaders() }
      );

      setLead(res.data);
      setIsEditOpen(false);

      alert("Lead Updated Successfully");
    } catch (err) {
      console.log(err);
      alert("Update Failed");
    }
  };

  const handleConvert = async () => {
  try {
    const res = await axios.post(
      "http://localhost:5000/api/deals",
      {
        leadId: lead?._id,
        title: `${lead?.name} Deal`,
        company: lead?.company,
        value: 50000,
        contact: lead?.phone,
        stage: "New",
      },
      { headers: getAuthHeaders() }
    );

    if (
      res.data?.message ===
      "ALREADY_CONVERTED"
    ) {
      alert(
        "This lead is already converted."
      );

      return;
    }

    alert(
      "Lead converted successfully ✅"
    );

    fetchLead();
  } catch (err) {
    console.log(err);

    alert("Conversion failed ❌");
  }
};

const handleDelete = async () => {
 

  try {
    await axios.delete(
      `http://localhost:5000/api/leads/${id}`,
      { headers: getAuthHeaders() }
    );

    alert("Lead deleted successfully");

    navigate("/leads");
  } catch (err) {
    console.log(err);
    alert("Delete failed");
  }
};

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400">
        Loading...
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-20 text-red-500">
        Lead not found
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">

        {/* Header */}

        <div className="flex items-start gap-4">

          <button
            onClick={() => navigate("/leads")}
            className="h-10 w-10 rounded-full border border-slate-700 flex items-center justify-center hover:bg-slate-800"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold text-white">
                {lead.name}
              </h1>

              <span className="text-cyan-400 text-sm">
                {lead.status || "new"}
              </span>
            </div>

            <p className="text-gray-400">
              {lead.company}
            </p>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setIsEditOpen(true)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white"
              >
                Edit Lead
              </button>

      <button
  onClick={() => setShowDeleteModal(true)}
  className="
px-6
py-3
rounded-xl
bg-red-600
hover:bg-red-700
text-white
font-medium
transition
"
>
  Delete Lead
</button>

              <button
  onClick={handleConvert}
  disabled={
    lead.status === "converted"
  }
  className={`
    px-5 py-2 rounded-xl text-white

    ${
      lead.status === "converted"
        ? "bg-slate-700 cursor-not-allowed"
        : "bg-cyan-500 hover:bg-cyan-400"
    }
  `}
>
  {lead.status === "converted"
    ? "Already Converted"
    : "Convert To Deal"}
</button>
            </div>
          </div>

        </div>

        {/* Cards */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <InfoCard
            icon={<Building2 size={18} />}
            title="Company"
            value={lead.company}
          />

          <InfoCard
            icon={<Phone size={18} />}
            title="Phone"
            value={lead.phone}
          />

          <InfoCard
            icon={<MapPin size={18} />}
            title="City"
            value={lead.city}
          />

         
  <InfoCard
    icon={<Mail size={18} />}
    title="Email"
    value={lead.email}
  />



  <InfoCard
    icon={<User size={18} />}
    title="Source"
    value={lead.source}
  />

          <InfoCard
            icon={<Calendar size={18} />}
            title="Created"
            value={
              lead.createdAt
                ? new Date(
                    lead.createdAt
                  ).toLocaleDateString()
                : "-"
            }
          />

        </div>

        {/* Timeline */}

        <div className="rounded-xl border border-slate-800 bg-[#06111d] p-6">

          <h2 className="text-xl font-semibold mb-5">
            Activity Timeline
          </h2>

          <div className="space-y-4">

            <div>
              <p className="font-medium">
                Lead Created
              </p>

              <p className="text-sm text-gray-400">
                {lead.createdAt
                  ? new Date(
                      lead.createdAt
                    ).toLocaleString()
                  : "-"}
              </p>
            </div>

            {lead.status === "converted" && (
              <div>
                <p className="font-medium text-green-400">
                  Converted To Deal
                </p>

                <p className="text-sm text-gray-400">
                  Lead successfully converted
                </p>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Edit Modal */}

      {isEditOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

          <div className="bg-[#071321] border border-slate-700 rounded-xl p-6 w-[450px]">

            <h2 className="text-xl font-bold mb-5">
              Edit Lead
            </h2>

            <div className="space-y-4">

              <input
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                placeholder="Name"
                className="w-full p-3 rounded bg-slate-900 border border-slate-700"
              />

              <input
                value={formData.company}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    company: e.target.value,
                  })
                }
                placeholder="Company"
                className="w-full p-3 rounded bg-slate-900 border border-slate-700"
              />

              <input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                  })
                }
                placeholder="Phone"
                inputMode="numeric"
                className="w-full p-3 rounded bg-slate-900 border border-slate-700"
              />

              <input
                value={formData.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    city: e.target.value,
                  })
                }
                placeholder="City"
                className="w-full p-3 rounded bg-slate-900 border border-slate-700"
              />

              <input
  value={formData.email}
  onChange={(e) =>
    setFormData({
      ...formData,
      email: e.target.value,
    })
  }
  placeholder="Email"
  className="w-full p-3 rounded bg-slate-900 border border-slate-700"
/>

<select
  value={formData.source}
  onChange={(e) =>
    setFormData({
      ...formData,
      source: e.target.value,
    })
  }
  className="w-full p-3 rounded bg-slate-900 border border-slate-700"
>
  <option value="">Select Source</option>
  <option value="Website">Website</option>
  <option value="Google Ads">Google Ads</option>
  <option value="Facebook Ads">Facebook Ads</option>
  <option value="LinkedIn">LinkedIn</option>
  <option value="Referral">Referral</option>
  <option value="Cold Call">Cold Call</option>
  <option value="Instagram">Instagram</option>
  <option value="Other">Other</option>
</select>

            </div>

            <div className="flex justify-end gap-3 mt-6">

               

              <button
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 rounded bg-cyan-500 text-white"
              >
                Cancel
              </button>

               <button
                onClick={saveLead}
                className="px-4 py-2 rounded bg-slate-700"
              >
                Save
              </button>

            </div>

          </div>

        </div>
      )}


      {showDeleteModal && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-[400px]">
      <h3 className="text-lg font-semibold text-white mb-2">
        Delete Lead
      </h3>

      <p className="text-gray-400 mb-6">
        Are you sure you want to delete this lead?
      </p>

      <div className="flex justify-end gap-3">

         <button
          onClick={handleDelete}
          className="px-4 py-2 rounded-lg bg-red-600 text-white"
        >
          Delete
        </button>

        <button
          onClick={() => setShowDeleteModal(false)}
          className="px-4 py-2 rounded-lg bg-slate-800 text-white"
        >
          Cancel
        </button>

       
      </div>
    </div>
  </div>
)}

    </>
  );
};

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
}

const InfoCard = ({
  icon,
  title,
  value,
}: InfoCardProps) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#06111d] p-5">

      <div className="flex items-center gap-2 text-cyan-400 mb-2">
        {icon}
        <span className="text-sm">
          {title}
        </span>
      </div>

      <p className="text-white font-medium">
        {value}
      </p>

    </div>
  );
};

export default LeadDetails;