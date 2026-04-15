/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  LifeBuoy, 
  Pill, 
  BriefcaseMedical, 
  ClipboardList, 
  AlertTriangle, 
  Printer, 
  Plus, 
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Menu,
  X,
  Download,
  Settings,
  Package,
  Stethoscope,
  FileText,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  RescueEquipment, 
  Medicine, 
  FirstAidKit, 
  BorrowersLog, 
  ItemCondition, 
  LogStatus 
} from './types';
// Types are imported from ./types

export default function App() {
  const queryClient = useQueryClient();
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('drrm_logged_in') === 'true');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Queries
  const { data: equipment = [], isLoading: isLoadingEq } = useQuery<RescueEquipment[]>({
    queryKey: ['equipment'],
    queryFn: () => fetch('/api/equipment').then(res => res.json()),
  });

  const { data: medicines = [], isLoading: isLoadingMed } = useQuery<Medicine[]>({
    queryKey: ['medicines'],
    queryFn: () => fetch('/api/medicines').then(res => res.json()),
  });

  const { data: kits = [], isLoading: isLoadingKits } = useQuery<FirstAidKit[]>({
    queryKey: ['kits'],
    queryFn: () => fetch('/api/kits').then(res => res.json()),
  });

  const { data: logs = [], isLoading: isLoadingLogs } = useQuery<BorrowersLog[]>({
    queryKey: ['logs'],
    queryFn: () => fetch('/api/logs').then(res => res.json()),
  });

  const { data: personnelProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => fetch('/api/profile').then(res => res.json()),
    initialData: {
      name: 'Admin User',
      designation: 'DRRM Personnel',
      badge: 'ADM'
    }
  });

  // Mutations
  const addEquipmentMutation = useMutation({
    mutationFn: (newItem: RescueEquipment) => 
      fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast.success('Equipment added successfully');
      setShowAddEquipment(false);
      setNewEquipment({ condition: ItemCondition.VERY_GOOD, unit: 'pcs' });
    },
    onError: () => toast.error('Failed to add equipment')
  });

  const addMedicineMutation = useMutation({
    mutationFn: (newItem: Medicine) => 
      fetch('/api/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      toast.success('Medicine added successfully');
      setShowAddMedicine(false);
      setNewMedicine({ unit: 'pcs' });
    },
    onError: () => toast.error('Failed to add medicine')
  });

  const addKitMutation = useMutation({
    mutationFn: (newItem: FirstAidKit) => 
      fetch('/api/kits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kits'] });
      toast.success('First Aid Kit added');
      setShowAddKit(false);
      setNewKit({ condition: 'Intact', contents: [] });
    },
    onError: () => toast.error('Failed to add kit')
  });

  const addLogMutation = useMutation({
    mutationFn: (newItem: BorrowersLog) => 
      fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs'] });
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast.success('Log recorded successfully');
      setShowAddLog(false);
      setNewLog({ status: LogStatus.BORROWED, dateBorrowed: new Date().toISOString().slice(0, 16), items: [] });
    },
    onError: () => toast.error('Failed to record log')
  });

  const deleteMutation = useMutation({
    mutationFn: ({ type, id }: { type: string, id: string }) => 
      fetch(`/api/${type}/${id}`, { method: 'DELETE' }).then(res => res.json()),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.type] });
      toast.success(`${variables.type.charAt(0).toUpperCase() + variables.type.slice(1)} deleted`);
    },
    onError: () => toast.error('Delete failed')
  });

  const returnLogMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => 
      fetch(`/api/logs/${id}/return`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs'] });
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast.success('Items returned successfully');
    },
    onError: () => toast.error('Return failed')
  });

  const updateProfileMutation = useMutation({
    mutationFn: (profile: any) => 
      fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated');
      setShowProfileModal(false);
    },
    onError: () => toast.error('Profile update failed')
  });

  // Set initial sidebar state based on screen size
  useEffect(() => {
    setIsSidebarOpen(window.innerWidth >= 1024);
  }, []);

  // Persist login state
  useEffect(() => {
    localStorage.setItem('drrm_logged_in', isLoggedIn.toString());
  }, [isLoggedIn]);

  const [showProfileModal, setShowProfileModal] = useState(false);

  const [profileForm, setProfileForm] = useState({ name: '', designation: '', badge: '', username: '', password: '' });

  useEffect(() => {
    if (personnelProfile) {
      setProfileForm({
        name: personnelProfile.name,
        designation: personnelProfile.designation,
        badge: personnelProfile.badge,
        username: personnelProfile.username || 'admin',
        password: personnelProfile.password || 'mambusao2026'
      });
    }
  }, [personnelProfile]);

  const isSyncing = queryClient.isFetching() > 0 || queryClient.isMutating() > 0;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      
      if (data.success) {
        setIsLoggedIn(true);
        setLoginError('');
      } else {
        setLoginError(data.message || 'Invalid username or password.');
      }
    } catch (error) {
      setLoginError('An error occurred during login. Please try again.');
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      setIsLoggedIn(false);
      setLoginForm({ username: '', password: '' });
      localStorage.removeItem('drrm_logged_in');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Search States
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [medicineSearch, setMedicineSearch] = useState('');

  // Modal States
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [showAddKit, setShowAddKit] = useState(false);

  const [newEquipment, setNewEquipment] = useState<Partial<RescueEquipment>>({
    condition: ItemCondition.VERY_GOOD,
    unit: 'pcs'
  });

  const [newMedicine, setNewMedicine] = useState<Partial<Medicine>>({
    unit: 'pcs'
  });

  const [newKit, setNewKit] = useState<Partial<FirstAidKit>>({
    condition: 'Intact',
    contents: []
  });

  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    const id = newEquipment.id || `EQ-${String(equipment.length + 1).padStart(3, '0')}`;
    const newItem = { ...newEquipment, id } as RescueEquipment;
    addEquipmentMutation.mutate(newItem);
  };

  const handleEditEquipment = (item: RescueEquipment) => {
    setNewEquipment(item);
    setShowAddEquipment(true);
  };

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    const id = newMedicine.id || `MED-${String(medicines.length + 1).padStart(3, '0')}`;
    const newItem = { ...newMedicine, id } as Medicine;
    addMedicineMutation.mutate(newItem);
  };

  const handleEditMedicine = (item: Medicine) => {
    setNewMedicine(item);
    setShowAddMedicine(true);
  };

  const handleAddKit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = newKit.id || `KIT-${String(kits.length + 1).padStart(3, '0')}`;
    const newItem = { ...newKit, id, lastCheckedDate: newKit.lastCheckedDate || new Date().toISOString().split('T')[0] } as FirstAidKit;
    addKitMutation.mutate(newItem);
  };

  const handleEditKit = (item: FirstAidKit) => {
    setNewKit(item);
    setShowAddKit(true);
  };

  const [showAddLog, setShowAddLog] = useState(false);
  const [newLog, setNewLog] = useState<Partial<BorrowersLog>>({
    status: LogStatus.BORROWED,
    dateBorrowed: new Date().toISOString().slice(0, 16),
    items: []
  });

  const [reconciliationCounts, setReconciliationCounts] = useState<Record<string, number>>({});
  const [itemToDelete, setItemToDelete] = useState<{ type: 'equipment' | 'medicines' | 'kits' | 'logs', id: string } | null>(null);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `LOG-${String(logs.length + 1).padStart(3, '0')}`;
    const newItem = { ...newLog, id } as BorrowersLog;
    addLogMutation.mutate(newItem);
  };

  const handleDeleteItem = (type: 'equipment' | 'medicines' | 'kits' | 'logs', id: string) => {
    setItemToDelete({ type, id });
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete);
      setItemToDelete(null);
    }
  };

  const handleReturnLog = (log: BorrowersLog) => {
    const dateReturned = new Date().toISOString().slice(0, 16);
    const receivingOfficer = personnelProfile.name;
    const status = LogStatus.RETURNED;

    returnLogMutation.mutate({ 
      id: log.id, 
      data: { dateReturned, receivingOfficer, status, items: log.items } 
    });
  };

  const filteredEquipment = useMemo(() => {
    return equipment.filter(item => 
      item.name.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
      item.location.toLowerCase().includes(equipmentSearch.toLowerCase())
    );
  }, [equipment, equipmentSearch]);

  const filteredMedicines = useMemo(() => {
    return medicines.filter(med => 
      med.genericName.toLowerCase().includes(medicineSearch.toLowerCase()) ||
      med.brandName?.toLowerCase().includes(medicineSearch.toLowerCase()) ||
      med.lotNumber.toLowerCase().includes(medicineSearch.toLowerCase())
    );
  }, [medicines, medicineSearch]);

  const stats = useMemo(() => {
    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(now.getMonth() + 3);

    const expiringSoonMeds = medicines.filter(m => {
      const exp = new Date(m.expiryDate);
      return exp <= threeMonthsFromNow;
    });

    const lowStockMeds = medicines.filter(m => m.quantity < 50); // Simple threshold

    return {
      totalEquipment: equipment.reduce((acc, curr) => acc + curr.quantity, 0),
      expiringSoon: expiringSoonMeds.length,
      lowStock: lowStockMeds.length,
      activeLoans: logs.filter(l => l.status === LogStatus.BORROWED).length
    };
  }, [equipment, medicines, logs]);

  const renderDashboard = () => (
    <div className="space-y-6 h-full overflow-y-auto pb-10 pr-2">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">MDRRMO Mambusao Dashboard</h1>
          <p className="text-slate-500 italic">"Handa sa Kalamidad, Ligtas ang Mambusaonon"</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddEquipment(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>New Entry</span>
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Printer size={18} />
            <span>Print Reports</span>
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <LifeBuoy size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Rescue Gear</p>
            <p className="text-2xl font-bold text-slate-900">{stats.totalEquipment} items</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Expiring Soon</p>
            <p className="text-2xl font-bold text-slate-900">{stats.expiringSoon} items</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <ClipboardList size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Low Stock</p>
            <p className="text-2xl font-bold text-slate-900">{stats.lowStock} alerts</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Active Loans</p>
            <p className="text-2xl font-bold text-slate-900">{stats.activeLoans} logs</p>
          </div>
        </div>
      </div>

      {/* Critical Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-bottom border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              Critical Expiry Alerts (Meds/Kits)
            </h3>
            <button onClick={() => setActiveTab('medicines')} className="text-xs text-blue-600 font-medium hover:underline">View All</button>
          </div>
          <div className="divide-y divide-slate-50">
            {medicines.filter(m => {
              const exp = new Date(m.expiryDate);
              const now = new Date();
              const diff = exp.getTime() - now.getTime();
              return diff < (90 * 24 * 60 * 60 * 1000); // 90 days
            }).map(m => (
              <div key={m.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-medium text-slate-900">{m.genericName}</p>
                  <p className="text-xs text-slate-500">Lot: {m.lotNumber} | Qty: {m.quantity} {m.unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">{m.expiryDate}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Expires in {Math.ceil((new Date(m.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-bottom border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Clock size={18} className="text-purple-500" />
              Recent Borrowers Log
            </h3>
            <button onClick={() => setActiveTab('logs')} className="text-xs text-blue-600 font-medium hover:underline">View All</button>
          </div>
          <div className="divide-y divide-slate-50">
            {logs.slice(0, 5).map(log => (
              <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex gap-3 items-start">
                  <div className={`mt-1 w-2 h-2 rounded-full ${log.status === LogStatus.BORROWED ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <div>
                    <p className="font-medium text-slate-900">{log.borrowerName}</p>
                    <p className="text-xs text-slate-500">{log.purpose}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-600">{new Date(log.dateBorrowed).toLocaleDateString()}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${log.status === LogStatus.BORROWED ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderEquipment = () => (
    <div className="h-full flex flex-col space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Rescue Equipment</h2>
          <p className="text-slate-500">Inventory of boats, life jackets, and rescue tools.</p>
        </div>
        <button 
          onClick={() => setShowAddEquipment(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>Add Equipment</span>
        </button>
      </header>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search equipment..." 
              value={equipmentSearch}
              onChange={(e) => setEquipmentSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
            />
          </div>
          <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
            <Download size={20} />
          </button>
        </div>
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur z-10 shadow-sm">
              <tr className="border-b border-slate-100">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Item Name</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Qty</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Source</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Condition</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Inspection</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEquipment.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4">
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </td>
                  <td className="p-4">
                    <span className="font-mono font-bold text-slate-700">{item.quantity} {item.unit}</span>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{item.source}</td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                      item.condition === ItemCondition.VERY_GOOD ? 'bg-emerald-100 text-emerald-700' :
                      item.condition === ItemCondition.GOOD ? 'bg-blue-100 text-blue-700' :
                      item.condition === ItemCondition.NEEDS_REPAIR ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.condition}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{item.location}</td>
                  <td className="p-4 text-sm text-slate-600">{item.lastInspectionDate}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEditEquipment(item)}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteItem('equipment', item.id)}
                        className="text-red-600 hover:underline text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMedicine = () => (
    <div className="h-full flex flex-col space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Medicines</h2>
          <p className="text-slate-500">Essential medicines for evacuation and emergency response.</p>
        </div>
        <button 
          onClick={() => setShowAddMedicine(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>Add Medicine</span>
        </button>
      </header>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search medicine..." 
              value={medicineSearch}
              onChange={(e) => setMedicineSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur z-10 shadow-sm">
              <tr className="border-b border-slate-100">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Generic Name</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Dosage/Form</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Qty</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Expiry Date</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Lot Number</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMedicines.map(med => {
                const isExpiring = new Date(med.expiryDate).getTime() - new Date().getTime() < (90 * 24 * 60 * 60 * 1000);
                const isLowStock = med.quantity < 50;
                
                return (
                  <tr key={med.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-slate-900">{med.genericName}</p>
                      <p className="text-xs text-slate-500">{med.brandName || 'No Brand'}</p>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{med.dosage} / {med.form}</td>
                    <td className="p-4">
                      <span className={`font-mono font-bold ${isLowStock ? 'text-amber-600' : 'text-slate-700'}`}>
                        {med.quantity} {med.unit}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`font-bold ${isExpiring ? 'text-red-600' : 'text-slate-700'}`}>
                        {med.expiryDate}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{med.lotNumber}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {isExpiring && <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase w-fit">Expiring</span>}
                        {isLowStock && <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase w-fit">Low Stock</span>}
                        {!isExpiring && !isLowStock && <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase w-fit">Good</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEditMedicine(med)}
                          className="text-blue-600 hover:underline text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteItem('medicines', med.id)}
                          className="text-red-600 hover:underline text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="h-full flex flex-col space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Borrower's Log</h2>
          <p className="text-slate-500">Track issuance and return of equipment for accountability.</p>
        </div>
        <button 
          onClick={() => setShowAddLog(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>New Issuance</span>
        </button>
      </header>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur z-10 shadow-sm">
              <tr className="border-b border-slate-100">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Borrowed</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Borrower</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Items</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Purpose</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Returned</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-sm text-slate-600">{new Date(log.dateBorrowed).toLocaleString()}</td>
                  <td className="p-4">
                    <p className="font-semibold text-slate-900">{log.borrowerName}</p>
                    <p className="text-xs text-slate-500">{log.borrowerContact}</p>
                  </td>
                  <td className="p-4">
                    {log.items?.map(item => (
                      <div key={item.itemId} className="text-xs font-medium text-slate-700">
                        {item.quantity}x {item.name}
                      </div>
                    ))}
                  </td>
                  <td className="p-4 text-sm text-slate-600 max-w-xs truncate">{log.purpose}</td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                      log.status === LogStatus.BORROWED ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    {log.dateReturned ? new Date(log.dateReturned).toLocaleString() : '-'}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {log.status === LogStatus.BORROWED ? (
                        <button 
                          onClick={() => handleReturnLog(log)}
                          className="text-emerald-600 hover:underline text-sm font-bold"
                        >
                          Process Return
                        </button>
                      ) : (
                        <span className="text-slate-400 text-sm italic">Returned</span>
                      )}
                      <button 
                        onClick={() => handleDeleteItem('logs', log.id)}
                        className="text-red-600 hover:underline text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderKits = () => (
    <div className="h-full flex flex-col space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">First Aid Kits</h2>
          <p className="text-slate-500">Monitoring of distributed first aid kits in various locations.</p>
        </div>
        <button 
          onClick={() => setShowAddKit(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>Add New Kit</span>
        </button>
      </header>

      <div className="overflow-y-auto flex-1 pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kits.map(kit => (
            <div key={kit.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">{kit.name}</h3>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase">{kit.condition}</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <LayoutDashboard size={14} className="text-slate-400" />
                <span>Location: <strong>{kit.location}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock size={14} className="text-slate-400" />
                <span>Last Checked: <strong>{kit.lastCheckedDate}</strong></span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contents</p>
                <div className="space-y-1">
                  {kit.contents?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-slate-700">{item.itemName}</span>
                      <span className="font-mono font-bold text-slate-500">{item.qty}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
              <button 
                onClick={() => handleEditKit(kit)}
                className="flex-1 py-1.5 text-xs font-bold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Edit Kit
              </button>
              <button 
                onClick={() => handleDeleteItem('kits', kit.id)}
                className="flex-1 py-1.5 text-xs font-bold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );

  const renderPrintables = () => (
    <div className="h-full overflow-y-auto space-y-6 pb-10 pr-2">
      <header className="shrink-0">
        <h2 className="text-2xl font-bold text-slate-900">Printable Forms & Templates</h2>
        <p className="text-slate-500">Download and print these forms for manual record-keeping at the barangay level.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Master Inventory List', desc: 'Complete list of all equipment and meds.', icon: ClipboardList },
          { title: 'Borrowers Log Form', desc: 'Daily issuance and return tracking sheet.', icon: Clock },
          { title: 'Physical Inventory Sheet', desc: 'Monthly reconciliation and counting form.', icon: CheckCircle2 },
          { title: 'First Aid Kit Checklist', desc: 'Weekly/Monthly kit inspection form.', icon: BriefcaseMedical },
          { title: 'Write-off/Condemned Form', desc: 'For damaged or expired items.', icon: XCircle },
          { title: 'Stock Card Template', desc: 'Individual item movement tracking.', icon: LayoutDashboard },
        ].map((form, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="p-3 bg-slate-50 text-slate-600 rounded-xl w-fit mb-4 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
              <form.icon size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">{form.title}</h3>
            <p className="text-sm text-slate-500 mb-4">{form.desc}</p>
            <button 
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Printer size={16} />
              <span>Print Form</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMonitoring = () => (
    <div className="h-full flex flex-col space-y-6">
      <header className="shrink-0">
        <h2 className="text-2xl font-bold text-slate-900">Expiry & Low-Stock Monitoring</h2>
        <p className="text-slate-500">Critical items requiring immediate attention or replenishment.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-red-50 border-b border-red-100 flex items-center justify-between shrink-0">
            <h3 className="font-bold text-red-900 flex items-center gap-2">
              <AlertTriangle size={18} />
              Expiring within 6 Months
            </h3>
          </div>
          <div className="divide-y divide-slate-50 overflow-y-auto flex-1">
            {medicines.filter(m => {
              const exp = new Date(m.expiryDate);
              const now = new Date();
              const sixMonths = 180 * 24 * 60 * 60 * 1000;
              return exp.getTime() - now.getTime() < sixMonths;
            }).map(m => (
              <div key={m.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{m.genericName}</p>
                  <p className="text-xs text-slate-500">Location: {m.storage}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">{m.expiryDate}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Action: Dispose/Replace</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-center justify-between shrink-0">
            <h3 className="font-bold text-amber-900 flex items-center gap-2">
              <ClipboardList size={18} />
              Low Stock Alert (Below 20%)
            </h3>
          </div>
          <div className="divide-y divide-slate-50 overflow-y-auto flex-1">
            {medicines.filter(m => m.quantity < 50).map(m => (
              <div key={m.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{m.genericName}</p>
                  <p className="text-xs text-slate-500">Current Stock: {m.quantity} {m.unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-amber-600">REPLENISH NOW</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Supplier: {m.supplier}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const val = row[header];
          const escaped = ('' + (val === null || val === undefined ? '' : val)).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',')
      )
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderReports = () => (
    <div className="h-full overflow-y-auto space-y-6 pb-10 pr-2">
      <header className="shrink-0">
        <h2 className="text-2xl font-bold text-slate-900">Reports & Data Export</h2>
        <p className="text-slate-500">Generate and download system data for official documentation.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
            <Package size={24} />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">Equipment Inventory</h3>
          <p className="text-sm text-slate-500 mb-6">Complete list of rescue gear, vehicles, and tools with condition status.</p>
          <button 
            onClick={() => exportToCSV(equipment, 'Mambusao_DRRM_Equipment')}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
            <Stethoscope size={24} />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">Medical Supplies</h3>
          <p className="text-sm text-slate-500 mb-6">Detailed list of medicines, generic names, and critical expiry dates.</p>
          <button 
            onClick={() => exportToCSV(medicines, 'Mambusao_DRRM_Medicines')}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
            <ClipboardList size={24} />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">Borrower's Logs</h3>
          <p className="text-sm text-slate-500 mb-6">Historical record of all equipment issuances and returns.</p>
          <button 
            onClick={() => exportToCSV(logs.map(l => ({ ...l, items: JSON.stringify(l.items) })), 'Mambusao_DRRM_Logs')}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex items-start gap-4">
        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
          <AlertTriangle size={20} />
        </div>
        <div>
          <h4 className="font-bold text-amber-900">Data Privacy Notice</h4>
          <p className="text-sm text-amber-800 mt-1">
            Exported files contain sensitive municipal data. Ensure all physical and digital copies are handled according to the Data Privacy Act and local municipal ordinances.
          </p>
        </div>
      </div>
    </div>
  );

  const renderReconciliation = () => (
    <div className="h-full flex flex-col space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Physical Inventory Reconciliation</h2>
          <p className="text-slate-500">Compare system records with actual physical count.</p>
        </div>
        <button className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
          Start New Count
        </button>
      </header>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <p className="text-sm font-medium text-slate-600">Inventory Period: March 2026 (Quarterly)</p>
        </div>
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur z-10 shadow-sm">
              <tr className="border-b border-slate-100">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Item Name</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">System Count</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Physical Count</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Discrepancy</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {equipment.map(item => (
                <tr key={item.id}>
                  <td className="p-4 font-medium text-slate-900">{item.name}</td>
                  <td className="p-4 font-mono text-slate-600">{item.quantity}</td>
                  <td className="p-4">
                    <input 
                      type="number" 
                      className="w-20 p-1 border border-slate-200 rounded" 
                      value={reconciliationCounts[item.id] ?? item.quantity} 
                      onChange={e => setReconciliationCounts({...reconciliationCounts, [item.id]: Number(e.target.value)})}
                    />
                  </td>
                  <td className="p-4 text-slate-400">
                    {(reconciliationCounts[item.id] ?? item.quantity) - item.quantity}
                  </td>
                  <td className="p-4">
                    <input type="text" className="w-full p-1 border border-slate-200 rounded text-sm" placeholder="e.g., Damaged during flood" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button className="px-4 py-2 text-slate-600 font-medium">Cancel</button>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium">Submit Reconciliation</button>
        </div>
      </div>
    </div>
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Decorative Background Elements inspired by the 4 phases */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-500/5 rounded-full blur-3xl" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] w-full max-w-[1000px] flex flex-col md:flex-row overflow-hidden border border-slate-100 relative z-10"
        >
          {/* Left Side: Branding & Logo */}
          <div className="md:w-1/2 bg-slate-900 p-12 flex flex-col justify-between relative overflow-hidden">
            {/* Logo Pattern Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full grid grid-cols-4 grid-rows-4">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="border-[0.5px] border-white/20" />
                ))}
              </div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-12">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/20">M</div>
                <span className="text-xl font-black text-white tracking-tighter uppercase">Mambusao DRRM</span>
              </div>
              
              <h2 className="text-4xl font-bold text-white leading-tight mb-6">
                Municipal <br />
                <span className="text-emerald-400">Inventory</span> <br />
                Management
              </h2>
              <p className="text-slate-400 text-lg max-w-xs">
                Ensuring readiness through precise resource tracking and disaster preparedness.
              </p>
            </div>

            <div className="relative z-10 mt-12">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mitigation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Preparedness</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Response</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recovery</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Login Form */}
          <div className="md:w-1/2 p-12 bg-white flex flex-col justify-center">
            <div className="mb-10">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h3>
              <p className="text-slate-500">Please enter your credentials to access the system.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {loginError && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-rose-50 text-rose-600 text-sm rounded-2xl border border-rose-100 font-medium flex items-center gap-3"
                >
                  <AlertTriangle size={18} />
                  {loginError}
                </motion.div>
              )}
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
                <div className="relative">
                  <input 
                    required 
                    type="text" 
                    placeholder="Enter your username"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all pl-12"
                    value={loginForm.username}
                    onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <LayoutDashboard size={20} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <input 
                    required 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all pl-12"
                    value={loginForm.password}
                    onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Clock size={20} />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">Remember me</span>
                </label>
                <button type="button" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">Forgot Password?</button>
              </div>

              <button 
                type="submit" 
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98]"
              >
                Sign In to Dashboard
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 tracking-widest">Authorized Access Only</span></div>
              </div>
            </form>

            <div className="mt-8 flex justify-center gap-6">
              <div className="w-1 h-1 rounded-full bg-emerald-500" />
              <div className="w-1 h-1 rounded-full bg-indigo-500" />
              <div className="w-1 h-1 rounded-full bg-rose-500" />
              <div className="w-1 h-1 rounded-full bg-amber-500" />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans overflow-x-hidden">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`bg-slate-900 text-slate-400 w-72 fixed h-full transition-all duration-500 ease-in-out z-[70] border-r border-white/5 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/20">M</div>
            <div className="flex flex-col">
              <span className="font-black text-white tracking-tight leading-none text-lg">Mambusao</span>
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">DRRM PORTAL</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>

        <nav className="mt-4 px-4 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)] custom-scrollbar">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'equipment', label: 'Rescue Gear', icon: LifeBuoy },
            { id: 'medicine', label: 'Medicine', icon: Pill },
            { id: 'kits', label: 'First Aid Kits', icon: BriefcaseMedical },
            { id: 'logs', label: 'Borrowers Log', icon: ClipboardList },
            { id: 'reports', label: 'Reports', icon: FileText },
            { id: 'monitoring', label: 'Monitoring', icon: AlertTriangle },
            { id: 'reconciliation', label: 'Reconciliation', icon: CheckCircle2 },
            { id: 'printables', label: 'Printables', icon: Printer },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
                activeTab === item.id 
                ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/40' 
                : 'hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'} />
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-white/5 bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-emerald-500 border border-emerald-500/20">
              {personnelProfile.badge}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white truncate">{personnelProfile.name}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{personnelProfile.designation}</p>
            </div>
            <button 
              onClick={() => setShowProfileModal(true)}
              className="p-2 text-slate-500 hover:text-white transition-colors"
            >
              <Settings size={16} />
            </button>
          </div>
          
          <div className="flex items-center justify-between px-2">
            <p className="text-[10px] text-slate-600 font-bold italic">MDRRMO Mambusao</p>
            <button 
              onClick={handleLogout}
              className="text-slate-600 hover:text-rose-400 transition-colors flex items-center gap-1 group"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Logout</span>
              <XCircle size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-500 ease-in-out ${isSidebarOpen ? 'lg:ml-72' : 'ml-0'} h-screen flex flex-col overflow-hidden`}>
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 p-6 z-40 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-3 text-slate-600 hover:bg-slate-50 rounded-2xl transition-all border border-slate-200 shadow-sm"
              title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Municipal DRRM</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mambusao, Capiz • Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {isSyncing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-emerald-600"
              >
                <RefreshCw size={14} className="animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Syncing</span>
              </motion.div>
            )}
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search records..." 
                className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 w-64 transition-all text-sm"
              />
            </div>
            <button 
              onClick={handlePrint}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Printer size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden p-6 md:p-10">
          <div className="max-w-7xl mx-auto h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'equipment' && renderEquipment()}
              {activeTab === 'medicine' && renderMedicine()}
              {activeTab === 'logs' && renderLogs()}
              {activeTab === 'monitoring' && renderMonitoring()}
              {activeTab === 'reports' && renderReports()}
            {activeTab === 'reconciliation' && renderReconciliation()}
              {activeTab === 'printables' && renderPrintables()}
              {activeTab === 'kits' && renderKits()}
            </motion.div>
          </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showAddEquipment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold text-slate-900">{newEquipment.id ? 'Edit' : 'Add New'} Rescue Equipment</h3>
                <button onClick={() => {setShowAddEquipment(false); setNewEquipment({ condition: ItemCondition.VERY_GOOD, unit: 'pcs' });}} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              <form onSubmit={handleAddEquipment} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Item Name</label>
                  <input required type="text" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
                    value={newEquipment.name || ''}
                    onChange={e => setNewEquipment({...newEquipment, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity</label>
                  <input required type="number" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
                    value={newEquipment.quantity || ''}
                    onChange={e => setNewEquipment({...newEquipment, quantity: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unit</label>
                  <input required type="text" placeholder="pcs, set, unit" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
                    value={newEquipment.unit || ''}
                    onChange={e => setNewEquipment({...newEquipment, unit: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Condition</label>
                  <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    value={newEquipment.condition || ItemCondition.VERY_GOOD}
                    onChange={e => setNewEquipment({...newEquipment, condition: e.target.value as ItemCondition})}>
                    {Object.values(ItemCondition).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                  <textarea className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" rows={2}
                    value={newEquipment.description || ''}
                    onChange={e => setNewEquipment({...newEquipment, description: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location</label>
                  <input required type="text" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
                    value={newEquipment.location || ''}
                    onChange={e => setNewEquipment({...newEquipment, location: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Source/Donor</label>
                  <input required type="text" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
                    value={newEquipment.source || ''}
                    onChange={e => setNewEquipment({...newEquipment, source: e.target.value})} />
                </div>
                <div className="md:col-span-2 flex gap-3 mt-4">
                  <button type="button" onClick={() => {setShowAddEquipment(false); setNewEquipment({ condition: ItemCondition.VERY_GOOD, unit: 'pcs' });}} className="flex-1 py-3 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-3 font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/20">Save Equipment</button>

                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showAddMedicine && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold text-slate-900">{newMedicine.id ? 'Edit' : 'Add New'} Medicine</h3>
                <button onClick={() => {setShowAddMedicine(false); setNewMedicine({ unit: 'pcs' });}} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              <form onSubmit={handleAddMedicine} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Generic Name</label>
                  <input required type="text" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
                    value={newMedicine.genericName || ''}
                    onChange={e => setNewMedicine({...newMedicine, genericName: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Brand Name</label>
                  <input type="text" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
                    value={newMedicine.brandName || ''}
                    onChange={e => setNewMedicine({...newMedicine, brandName: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dosage</label>
                  <input required type="text" placeholder="e.g. 500mg" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
                    value={newMedicine.dosage || ''}
                    onChange={e => setNewMedicine({...newMedicine, dosage: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Form</label>
                  <input required type="text" placeholder="Tablet, Syrup, etc" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
                    value={newMedicine.form || ''}
                    onChange={e => setNewMedicine({...newMedicine, form: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity</label>
                  <input required type="number" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
                    value={newMedicine.quantity || ''}
                    onChange={e => setNewMedicine({...newMedicine, quantity: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expiry Date</label>
                  <input required type="date" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
                    value={newMedicine.expiryDate || ''}
                    onChange={e => setNewMedicine({...newMedicine, expiryDate: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lot Number</label>
                  <input required type="text" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
                    value={newMedicine.lotNumber || ''}
                    onChange={e => setNewMedicine({...newMedicine, lotNumber: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Storage</label>
                  <input required type="text" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
                    value={newMedicine.storage || ''}
                    onChange={e => setNewMedicine({...newMedicine, storage: e.target.value})} />
                </div>
                <div className="md:col-span-2 flex gap-3 mt-4">
                  <button type="button" onClick={() => {setShowAddMedicine(false); setNewMedicine({ unit: 'pcs' });}} className="flex-1 py-3 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-3 font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/20">Save Medicine</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showAddKit && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold text-slate-900">{newKit.id ? 'Edit' : 'Add New'} First Aid Kit</h3>
                <button onClick={() => {setShowAddKit(false); setNewKit({ condition: 'Intact', contents: [] });}} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              <form onSubmit={handleAddKit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kit Name</label>
                  <input required type="text" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
                    value={newKit.name || ''}
                    onChange={e => setNewKit({...newKit, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location</label>
                  <input required type="text" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
                    value={newKit.location || ''}
                    onChange={e => setNewKit({...newKit, location: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Responsible Person</label>
                  <input required type="text" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
                    value={newKit.responsiblePerson || ''}
                    onChange={e => setNewKit({...newKit, responsiblePerson: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Condition</label>
                  <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    value={newKit.condition || 'Intact'}
                    onChange={e => setNewKit({...newKit, condition: e.target.value})}>
                    <option value="Intact">Intact</option>
                    <option value="Needs Refill">Needs Refill</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contents (Comma separated names)</label>
                  <input required type="text" placeholder="e.g. 10x Bandages, 2x Alcohol" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
                    value={newKit.contents?.map(c => `${c.qty}x ${c.itemName}`).join(', ') || ''}
                    onChange={e => {
                      const itemsStr = e.target.value.split(',');
                      const contents = itemsStr.map(s => {
                        const parts = s.trim().split('x');
                        return { itemName: parts[1]?.trim() || parts[0].trim(), qty: parseInt(parts[0]) || 1 };
                      });
                      setNewKit({...newKit, contents});
                    }} />
                </div>
                <div className="md:col-span-2 flex gap-3 mt-4">
                  <button type="button" onClick={() => {setShowAddKit(false); setNewKit({ condition: 'Intact', contents: [] });}} className="flex-1 py-3 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-3 font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/20">Save Kit</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showAddLog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold text-slate-900">New Borrower Issuance</h3>
                <button onClick={() => setShowAddLog(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              <form onSubmit={handleAddLog} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Borrower Name</label>
                  <input required type="text" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
                    onChange={e => setNewLog({...newLog, borrowerName: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Number</label>
                  <input required type="text" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
                    onChange={e => setNewLog({...newLog, borrowerContact: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date/Time Borrowed</label>
                  <input required type="datetime-local" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
                    value={newLog.dateBorrowed}
                    onChange={e => setNewLog({...newLog, dateBorrowed: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Releasing Officer</label>
                  <input required type="text" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
                    value={personnelProfile.name}
                    onChange={e => setNewLog({...newLog, releasingOfficer: e.target.value})} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Purpose</label>
                  <textarea required className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" rows={2}
                    onChange={e => setNewLog({...newLog, purpose: e.target.value})} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Items (Comma separated names)</label>
                  <input required type="text" placeholder="e.g. 5x Life Jacket, 1x Rubber Boat" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
                    onChange={e => {
                      const itemsStr = e.target.value.split(',');
                      const items = itemsStr.map(s => {
                        const parts = s.trim().split('x');
                        return { itemId: 'TEMP', name: parts[1]?.trim() || parts[0].trim(), quantity: parseInt(parts[0]) || 1 };
                      });
                      setNewLog({...newLog, items});
                    }} />
                </div>
                <div className="md:col-span-2 flex gap-3 mt-4">
                  <button type="button" onClick={() => setShowAddLog(false)} className="flex-1 py-3 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-3 font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/20">Save Issuance</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showProfileModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold text-slate-900">Personnel Profile Settings</h3>
                <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    value={profileForm.name}
                    onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Designation</label>
                  <input 
                    type="text" 
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    value={profileForm.designation}
                    onChange={e => setProfileForm({...profileForm, designation: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Badge Initials</label>
                  <input 
                    type="text" 
                    maxLength={3}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    value={profileForm.badge}
                    onChange={e => setProfileForm({...profileForm, badge: e.target.value.toUpperCase()})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Username</label>
                  <input 
                    type="text" 
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    value={profileForm.username}
                    onChange={e => setProfileForm({...profileForm, username: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                  <input 
                    type="password" 
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    value={profileForm.password}
                    onChange={e => setProfileForm({...profileForm, password: e.target.value})}
                  />
                </div>
                <button 
                  onClick={() => updateProfileMutation.mutate(profileForm)}
                  disabled={updateProfileMutation.isPending}
                  className="w-full py-3 mt-4 font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {itemToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-red-50">
                <h3 className="text-xl font-bold text-red-900 flex items-center gap-2">
                  <AlertTriangle size={20} />
                  Confirm Deletion
                </h3>
                <button onClick={() => setItemToDelete(null)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              <div className="p-6">
                <p className="text-slate-600 mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setItemToDelete(null)}
                    className="flex-1 py-3 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="flex-1 py-3 font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
