import {
  Users,
  UserCheck,
  ClipboardList,
  CheckCircle,
} from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Users",
      value: "24",
      icon: Users,
    },
    {
      title: "Sales Users",
      value: "18",
      icon: UserCheck,
    },
    {
      title: "Total Tasks",
      value: "152",
      icon: ClipboardList,
    },
    {
      title: "Completed Tasks",
      value: "121",
      icon: CheckCircle,
    },
  ];

  return (
    <div className="min-h-screen bg-[#020b13] text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          Admin Dashboard 🔥
        </h1>
        <p className="text-slate-400 mt-2">
          Monitor users, tasks and CRM activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="bg-[#071a29] border border-cyan-500/20 rounded-3xl p-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-slate-400 text-sm">
                    {item.title}
                  </p>

                  <h2 className="text-4xl font-bold mt-2">
                    {item.value}
                  </h2>
                </div>

                <div className="w-14 h-14 rounded-full bg-cyan-500/10 flex items-center justify-center">
                  <Icon
                    size={26}
                    className="text-cyan-400"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-[#071a29] border border-cyan-500/20 rounded-3xl p-6 h-[350px]">
          <h2 className="text-xl font-semibold mb-6">
            User Growth
          </h2>

          <div className="h-full flex items-center justify-center text-slate-500">
            Chart Here
          </div>
        </div>

        <div className="bg-[#071a29] border border-cyan-500/20 rounded-3xl p-6 h-[350px]">
          <h2 className="text-xl font-semibold mb-6">
            Tasks Overview
          </h2>

          <div className="h-full flex items-center justify-center text-slate-500">
            Chart Here
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="mt-8 bg-[#071a29] border border-cyan-500/20 rounded-3xl p-6">
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-semibold">
            Recent Users
          </h2>

          <button className="text-cyan-400">
            View All →
          </button>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between border-b border-slate-800 pb-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center font-bold">
                  M
                </div>

                <div>
                  <h3 className="font-semibold">
                    Manya Kathuria
                  </h3>
                  <p className="text-slate-400 text-sm">
                    manya@gmail.com
                  </p>
                </div>
              </div>

              <span className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-sm">
                Sales
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}