"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/utils/firebase/client";
import { signOut } from "firebase/auth";
import { 
  LayoutDashboard, 
  Users, 
  Brain, 
  Layers, 
  FlaskConical, 
  Calendar, 
  Settings, 
  LogOut,
  ChevronRight,
  Shield,
  Activity,
  ClipboardList,
  BarChart2,
  CheckCircle2,
  Mic,
  Pill,
  Sliders,
  History,
  FileSearch,
  Database,
  Cpu,
  Zap,
  Bot
} from "lucide-react";

interface SidebarProps {
  role?: string;
  userName?: string;
  isMobile?: boolean;
}

export default function Sidebar({ role = "doctor", userName = "คุณหมอ", isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      if (role === "patient") {
        router.push("/patient/login");
      } else {
        router.push("/doctor/login");
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const doctorSections = [
    {
      label: "Main Menu",
      items: [
        { title: "Dashboard", icon: LayoutDashboard, href: "/doctor/dashboard" },
        { title: "รายชื่อคนไข้", icon: Users, href: "/doctor/patients" },
        { title: "นัดหมายวันนี้", icon: Calendar, href: "/doctor/appointments" },
      ]
    },
    {
      label: "Clinical Intelligence",
      items: [
        { title: "39 Biological Axes", icon: Activity, href: "/doctor/axes" },
        { title: "Pre-visit Intelligence", icon: Zap, href: "/doctor/pre-visit" },
        { title: "Digital Twin HUD", icon: Activity, href: "/doctor/digital-twin" },
        { title: "Clinical Review", icon: ClipboardList, href: "/doctor/clinical-review" },
        { title: "Voice Clinical Form", icon: Mic, href: "/doctor/voice-form" },
        { title: "Validations", icon: CheckCircle2, href: "/doctor/validations" },
        { title: "Health Outcomes", icon: BarChart2, href: "/doctor/outcomes" },
        { title: "Lab Review", icon: FlaskConical, href: "/doctor/lab-review" },
        { title: "Lab OCR", icon: FileSearch, href: "/doctor/lab-ocr" },
      ]
    },
    {
      label: "AI Engine & Config",
      items: [
        { title: "AI Settings", icon: Cpu, href: "/doctor/ai-settings" },
        { title: "Clinical Automations", icon: Bot, href: "/doctor/automations" },
        { title: "Modules Management", icon: Pill, href: "/doctor/modules" },
        { title: "Engine Results", icon: History, href: "/doctor/engine-results" },
        { title: "Axis Weights", icon: Sliders, href: "/doctor/axis-weights" },
        { title: "Axes Mapping", icon: Layers, href: "/doctor/axes-mapping" },
        { title: "Audit Logs", icon: Shield, href: "/doctor/audit" },
        { title: "Import Framework", icon: Database, href: "/doctor/import-axes" },
        { title: "ตั้งค่าระบบ", icon: Settings, href: "/doctor/settings" },
      ]
    }
  ];

  const patientSections = [
    {
      label: "Health Center",
      items: [
        { title: "My Dashboard", icon: LayoutDashboard, href: "/patient/dashboard" },
        { title: "Health History", icon: History, href: "/patient/history" },
        { title: "My Appointments", icon: Calendar, href: "/patient/appointments" },
      ]
    },
    {
      label: "AI Support",
      items: [
        { title: "AI Health Intake", icon: Brain, href: "/patient/ai-intake" },
        { title: "Lab Reports", icon: FlaskConical, href: "/patient/download" },
        { title: "Clinical Consent", icon: Shield, href: "/patient/consent" },
      ]
    },
    {
      label: "Settings",
      items: [
        { title: "Profile Settings", icon: Settings, href: "/patient/settings" },
      ]
    }
  ];

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "Clinical Intelligence": true,
    "AI Engine & Config": false,
    "Health Center": true,
    "AI Support": true,
    "Settings": true
  });

  const toggleSection = (label: string) => {
    setExpandedSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const menuSections = role === "doctor" ? doctorSections : patientSections;

  return (
    <div className="d-flex flex-column h-100 sidebar-content-wrapper bg-transparent">
      
      {/* Navigation Menu (Treeview) */}
      <div className="sidebar-menu-wrapper flex-grow-1 px-2 overflow-auto custom-scrollbar pt-3">
        <nav>
          <ul className="nav nav-pills nav-sidebar flex-column gap-1">
            {menuSections.map((section, sectionIdx) => {
              const isExpanded = expandedSections[section.label];
              return (
                <li key={sectionIdx} className="nav-item mb-2">
                  <button 
                    onClick={() => toggleSection(section.label)}
                    className="nav-link border-0 bg-transparent d-flex align-items-center justify-content-between w-100 px-3 py-2 rounded-3 text-muted fw-bold tiny text-uppercase tracking-wider hover-bg"
                  >
                    <div className="d-flex align-items-center gap-2">
                      <span className="section-dot bg-primary-custom"></span>
                      {section.label}
                    </div>
                    <ChevronRight size={14} className={`transition-all ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>

                  <ul className={`nav nav-treeview d-grid gap-1 mt-1 ps-2 transition-all overflow-hidden ${isExpanded ? 'max-h-500' : 'max-h-0'}`}>
                    {section.items.map((item, i) => {
                      const isActive = pathname === item.href;
                      return (
                        <li key={i} className="nav-item">
                          <Link 
                            href={item.href} 
                            className={`nav-link d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none transition-all ${
                              isActive 
                                ? "bg-primary-custom text-white shadow-sm active" 
                                : "text-dark text-opacity-70 hover-bg-light"
                            }`}
                          >
                            <item.icon size={18} className={isActive ? 'text-white' : 'text-primary-custom opacity-70'} />
                            <span className="small fw-medium">{item.title}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Footer Settings & Logout */}
      <div className="sidebar-footer p-3 border-top mt-auto d-flex flex-column gap-2">
        {role === "doctor" ? (
          <Link href="/doctor/settings" className="nav-link d-flex align-items-center gap-3 px-3 py-2 text-muted text-decoration-none hover-bg-light rounded-3">
            <Settings size={18} className="text-muted" />
            <span className="small fw-medium">ตั้งค่าระบบ</span>
          </Link>
        ) : (
          <Link href="/patient/settings" className="nav-link d-flex align-items-center gap-3 px-3 py-2 text-muted text-decoration-none hover-bg-light rounded-3">
            <Settings size={18} className="text-muted" />
            <span className="small fw-medium">Profile Settings</span>
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="btn btn-link nav-link d-flex align-items-center gap-3 px-3 py-2 text-danger text-decoration-none hover-bg-danger-light rounded-3 border-0 text-start w-100"
        >
          <LogOut size={18} className="text-danger" />
          <span className="small fw-medium">ออกจากระบบ</span>
        </button>
      </div>

      <style jsx>{`
        .sidebar-content-wrapper { 
          height: 100%; 
          background-color: var(--drpat-card); 
        }
        .hover-bg:hover { background-color: rgba(212, 175, 55, 0.05); color: var(--drpat-primary) !important; }
        .hover-bg-light:hover { 
          background-color: #ffffff; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          transform: translateX(4px); 
        }
        .hover-bg-danger-light:hover {
          background-color: rgba(220, 53, 69, 0.05) !important;
          color: #dc3545 !important;
          transform: translateX(4px);
        }
        .section-dot { width: 4px; height: 4px; border-radius: 50%; }
        .rotate-90 { transform: rotate(90deg); }
        .max-h-0 { max-height: 0; opacity: 0; pointer-events: none; }
        .max-h-500 { max-height: 1000px; opacity: 1; }
        .transition-all { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .active { 
          font-weight: 700 !important; 
          border-left: 3px solid var(--drpat-primary);
          border-radius: 0 8px 8px 0 !important;
          margin-left: -0.5rem;
          padding-left: 1rem !important;
        }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
      `}</style>

    </div>

  );
}
