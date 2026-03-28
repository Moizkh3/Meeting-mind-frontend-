import { useState, useEffect } from "react";
import { 
  LayoutGrid, 
  ChevronRight, 
  Bell, 
  User, 
  Mail,
  Loader2
} from "lucide-react";
import axiosInstance from "../../../api/axiosinstance";
import { useNavigate, useParams } from "react-router-dom";


const CreateOrganization = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    email: "",
    logo: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isEdit) {
      const fetchOrg = async () => {
        try {
          const response = await axiosInstance.get(`/organizations/${id}`);
          const org = Array.isArray(response.data) ? response.data[0] : response.data;
          
          if (org) {
            setFormData({
              name: org.name || "",
              description: org.description || "",
              email: org.email || "",
              logo: null,
            });
          }
        } catch (err) {
          console.error("Failed to fetch organization for edit:", err);
          setError("Failed to load organization data.");
        }
      };
      fetchOrg();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, logo: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!formData.name || !formData.email || !formData.description) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("email", formData.email);
    if (formData.logo) {
      data.append("logo", formData.logo);
    }

    try {
      const endpoint = isEdit ? `/organizations/update/${id}` : "/organizations/create";
      const method = isEdit ? "put" : "post";
      
      const response = await axiosInstance[method](endpoint, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success || response.status === 201 || response.status === 200) {
        setSuccess(isEdit ? "Organization updated successfully!" : "Organization created successfully!");
        setTimeout(() => {
          navigate("/admin/organizations");
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} organization. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="p-4 md:p-8 pb-0 mt-4 lg:mt-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-2 md:gap-4 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-[0.2em] overflow-x-auto whitespace-nowrap pb-2 md:pb-0">
            <LayoutGrid size={18} className="shrink-0" />
            <span>Platform Controls</span>
            <ChevronRight size={12} className="shrink-0" />
            <span className="text-primary font-bold">New Organization</span>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <button className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded bg-white border border-border text-slate-500 hover:bg-sidebar transition-all shadow-sm">
              <Bell size={18} />
            </button>
            <button className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded bg-white border border-border text-slate-500 hover:bg-sidebar transition-all shadow-sm">
              <User size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-[800px] mx-auto">
          {/* Title */}
          <h1 className="text-xl md:text-2xl font-bold text-charcoal">
            {isEdit ? "Refine Organization Identity" : "Create Organization"}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1 mb-6 md:mb-8">
            {isEdit 
              ? "Update organizational parameters and synchronize enterprise configurations."
              : "Initialize a new secure workspace for client onboarding and scribe deployment."}
          </p>

          {/* Notifications */}
          {error && (
            <div className="mb-6 p-3 md:p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded text-xs md:text-sm font-medium shadow-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-3 md:p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded text-xs md:text-sm font-medium shadow-sm">
              {success}
            </div>
          )}

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="border border-border rounded bg-white p-4 md:p-6 mb-6 shadow-sm">
            <h3 className="text-xs md:text-sm font-semibold text-charcoal uppercase tracking-wide mb-4">
              Organization Details
            </h3>
            <div className="h-[1px] bg-border mb-6"></div>

            <div className="space-y-5">
              {/* Legal Entity Name */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-charcoal mb-1.5 whitespace-nowrap">
                  Legal Entity Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Acme Corp International"
                  className="w-full px-4 py-2 bg-sidebar border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-slate-400"
                  required
                />
                <p className="text-[10px] md:text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Enter the full registered legal name of the organization.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-charcoal mb-1.5 whitespace-nowrap">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the organization's focus..."
                  className="w-full px-4 py-2 bg-sidebar border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-slate-400 min-h-[100px]"
                  required
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-charcoal mb-1.5 whitespace-nowrap">
                  Organization Logo
                </label>
                <div className="mt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="flex-1 px-4 py-2 bg-sidebar border border-border rounded text-xs md:text-sm text-slate-500 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] md:text-xs file:font-semibold file:bg-charcoal file:text-white hover:file:opacity-90 transition-all"
                  />
                </div>
              </div>

              {/* Primary Admin Email */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-charcoal mb-1.5 whitespace-nowrap">
                  Primary Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@organization.com"
                    className="w-full pl-10 pr-4 py-2 bg-sidebar border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-8 gap-4">
              <button 
                type="button"
                className="px-5 py-2.5 text-xs md:text-sm font-semibold border border-border rounded text-charcoal hover:bg-slate-50 transition-colors shadow-sm order-2 sm:order-1"
              >
                Save as Draft
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 text-xs md:text-sm font-semibold bg-charcoal text-white rounded hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:bg-slate-400 shadow-md order-1 sm:order-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading 
                  ? (isEdit ? "Synchronizing..." : "Onboarding...") 
                  : (isEdit ? "Update Configuration" : "Complete Onboarding")}
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] md:text-xs text-slate-400 text-center">
            <a href="#" className="hover:text-primary transition-colors">
              Support Docs
            </a>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-300"></span>
            <a href="#" className="hover:text-primary transition-colors">
              Data Security Policy
            </a>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-300"></span>
            <a href="#" className="hover:text-primary transition-colors">
              Live Assistance
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrganization;
