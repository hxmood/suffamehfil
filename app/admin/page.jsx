import { FiCalendar, FiUsers } from "react-icons/fi";

// app/admin/page.js
export default function AdminDashboard() {
    return (
      <div>
        <h1 className="text-2xl font-bold text-[#2E2E2E] mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <DashboardCard 
            title="Total Programs" 
            value="24" 
            icon={<FiCalendar className="text-[#12CBC4]" />}
          />
          <DashboardCard 
            title="Participants" 
            value="156" 
            icon={<FiUsers className="text-[#FFC312]" />}
          />
          <DashboardCard 
            title="Teams" 
            value="3" 
            icon={<FiUsers className="text-[#FF6B6B]" />}
          />
        </div>
  
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-[#2E2E2E] mb-4">Recent Activity</h2>
          {/* Activity feed would go here */}
        </div>
      </div>
    );
  }
  
  function DashboardCard({ title, value, icon }) {
    return (
      <div className="bg-white rounded-lg shadow p-6 flex items-center">
        <div className="p-3 rounded-full bg-gray-100 mr-4">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-[#2E2E2E]">{value}</p>
        </div>
      </div>
    );
  }