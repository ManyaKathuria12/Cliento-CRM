import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { Toaster as HotToast } from "react-hot-toast";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminUsers from "@/pages/AdminUsers";



import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword"; // 🔥 ADD THIS
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Contacts from "./pages/Contacts";
import Deals from "./pages/Deals";
import Tasks from "./pages/Tasks";
import Analytics from "./pages/Analytics";
import AIChat from "./pages/AIChat";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import TaskDetail from "./pages/TaskDetail";
import LeadDetails from "./pages/LeadDetails";


const queryClient = new QueryClient();



const App = () => (
  <GoogleOAuthProvider clientId="908300278480-o2qi1otj79n56m04sbbne7ssh7jb6e0v.apps.googleusercontent.com">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
  <HotToast />
  <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>

              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
            
            

              {/* 🔥 RESET PASSWORD ROUTE */}
              <Route path="/reset-password" element={<ResetPassword />} />

             <Route path="/dashboard" element={
  <ProtectedRoute roleRequired="sales">
    <DashboardLayout><Dashboard /></DashboardLayout>
  </ProtectedRoute>
} />

              <Route path="/manager" element={
  <ProtectedRoute roleRequired="manager">
    <DashboardLayout><Dashboard /></DashboardLayout>
  </ProtectedRoute>
} />

             <Route path="/leads" element={
  <ProtectedRoute roleRequired="sales">
    <DashboardLayout><Leads /></DashboardLayout>
  </ProtectedRoute>
} />

<Route
  path="/leads/:id"
  element={
    <ProtectedRoute roleRequired="sales">
      <DashboardLayout>
        <LeadDetails />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>
             <Route path="/contacts" element={
  <ProtectedRoute roleRequired="sales">
    <DashboardLayout><Contacts /></DashboardLayout>
  </ProtectedRoute>
} />
            <Route path="/deals" element={
  <ProtectedRoute roleRequired="sales">
    <DashboardLayout><Deals /></DashboardLayout>
  </ProtectedRoute>
} />

      <Route path="/tasks" element={
  <ProtectedRoute roleRequired="sales">
    <DashboardLayout><Tasks /></DashboardLayout>
  </ProtectedRoute>
} />

              <Route path="/tasks/:id" element={
  <ProtectedRoute roleRequired="sales">
    <DashboardLayout><TaskDetail /></DashboardLayout>
  </ProtectedRoute>
} />

<Route path="/analytics" element={
  <ProtectedRoute roleRequired="sales">
    <DashboardLayout><Analytics /></DashboardLayout>
  </ProtectedRoute>
} />

<Route path="/ai-chat" element={
  <ProtectedRoute roleRequired="sales">
    <DashboardLayout><AIChat /></DashboardLayout>
  </ProtectedRoute>
} />

<Route path="/settings" element={
  <ProtectedRoute roleRequired="sales">
    <DashboardLayout><SettingsPage /></DashboardLayout>
  </ProtectedRoute>
} />

              <Route path="*" element={<NotFound />} />

              <Route
  path="/admin"
  element={
    <ProtectedRoute roleRequired="admin">
      <DashboardLayout>
        <AdminDashboard />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/users"
  element={
    <ProtectedRoute roleRequired="admin">
      <DashboardLayout>
        <AdminUsers />   
      </DashboardLayout>
    </ProtectedRoute>
  }
/>



            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);

export default App;