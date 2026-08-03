import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AvatarId } from '@/constants/colors';

const STORAGE_KEY = 'officeos_v1';

export type OfficeStyle = 'hitech' | 'classic' | 'loft';
export type GamePhase = 'register' | 'company' | 'avatar' | 'style' | 'entrance' | 'office';
export type EmployeeType = 'assistant' | 'accountant' | 'lawyer' | 'marketer' | 'it' | 'warehouse';

export interface Player {
  name: string;
  email: string;
  avatarId: AvatarId;
  photoUri?: string | null;
}

export interface Company {
  name: string;
  logoUri: string | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export type EmployeeStatus = 'idle' | 'working' | 'done' | 'attention' | 'away';

export interface Employee {
  id: string;
  type: EmployeeType;
  name: string;
  status: EmployeeStatus;
  hiredAt: number;
  messages: ChatMessage[];
  currentTaskId?: string | null;
  lastResult?: string | null;
}

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'done';
  createdAt: number;
  assignedTo: string | null;
  finishAt?: number | null; // when an in_progress task auto-completes
  result?: string | null;
}

export interface GameDocument {
  id: string;
  title: string;
  type: 'contract' | 'report' | 'invoice' | 'memo';
  createdAt: number;
}

export interface GameEvent {
  id: string;
  message: string;
  type: 'hire' | 'task' | 'finance' | 'system';
  timestamp: number;
}

export interface GameState {
  phase: GamePhase;
  player: Player | null;
  company: Company | null;
  officeStyle: OfficeStyle;
  employees: Employee[];
  tasks: Task[];
  documents: GameDocument[];
  events: GameEvent[];
  balance: number;
  tutorialStep: number; // 0=not started, 1-4=steps, 5=complete
}

const INITIAL_STATE: GameState = {
  phase: 'register',
  player: null,
  company: null,
  officeStyle: 'hitech',
  employees: [],
  tasks: [],
  documents: [],
  events: [],
  balance: 10000,
  tutorialStep: 0,
};

interface GameContextType {
  state: GameState;
  isLoaded: boolean;
  updateGame: (updates: Partial<GameState>) => void;
  setPlayer: (player: Player) => void;
  setCompany: (company: Company) => void;
  setOfficeStyle: (style: OfficeStyle) => void;
  setPhase: (phase: GamePhase) => void;
  initOffice: () => void;
  addEmployee: (type: EmployeeType) => void;
  addTask: (title: string) => void;
  assignTask: (employeeId: string, title: string) => void;
  acknowledgeResult: (employeeId: string) => void;
  completeTask: (id: string) => void;
  addEvent: (msg: string, type: GameEvent['type']) => void;
  sendEmployeeMessage: (employeeId: string, content: string) => void;
  advanceTutorial: () => void;
  spendBalance: (amount: number) => boolean;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

const EMPLOYEE_NAMES: Record<EmployeeType, string[]> = {
  assistant: ['Alex Chen', 'Sam Rivera', 'Jordan Kim'],
  accountant: ['Morgan Liu', 'Casey Park', 'Dana Wu'],
  lawyer: ['Blake Torres', 'Avery Walsh', 'Quinn Lee'],
  marketer: ['Riley Scott', 'Taylor Nguyen', 'Drew Hall'],
  it: ['Jamie Patel', 'Skyler Zhang', 'Reese Brown'],
  warehouse: ['Finley Ross', 'Harper Davis', 'Sage Thompson'],
};

const AI_RESPONSES: Record<EmployeeType, string[]> = {
  assistant: [
    "I've added that to your calendar right away.",
    "Noted! I'll make sure that gets done today.",
    "On it! I'll send you an update shortly.",
  ],
  accountant: [
    "I'll review the figures and prepare a report.",
    "The financial projections look solid. I'll run the numbers.",
    "I'll cross-reference this with our Q3 data.",
  ],
  lawyer: [
    "I'll draft that contract and have it ready for review.",
    "I've identified a few compliance points to address.",
    "Let me examine the legal implications first.",
  ],
  marketer: [
    "Great opportunity! I'll create a campaign brief.",
    "I'll analyze the market data and propose a strategy.",
    "Let me craft some creative concepts for this.",
  ],
  it: [
    "I'll look into the system requirements.",
    "Running diagnostics now. I'll report back soon.",
    "I can automate that process — will reduce costs.",
  ],
  warehouse: [
    "I'll update the inventory records immediately.",
    "Stock levels noted. I'll optimize the layout.",
    "I'll coordinate with the logistics team on this.",
  ],
};

function genId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const saved = { ...INITIAL_STATE, ...(JSON.parse(raw) as Partial<GameState>) };
          // Sanitize: roll phase back if required data is missing (guards
          // against corrupted saves and prevents redirect loops)
          if (!saved.player && saved.phase !== 'register') {
            saved.phase = 'register';
          } else if (!saved.company && !['register', 'company'].includes(saved.phase)) {
            saved.phase = 'company';
          }
          setState(saved);
        } catch {
          setState(INITIAL_STATE);
        }
      }
      setIsLoaded(true);
    });
  }, []);

  const save = useCallback((next: GameState) => {
    setState(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const updateGame = useCallback((updates: Partial<GameState>) => {
    setState(prev => {
      const next = { ...prev, ...updates };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const setPlayer = useCallback((player: Player) => {
    updateGame({ player });
  }, [updateGame]);

  const setCompany = useCallback((company: Company) => {
    updateGame({ company });
  }, [updateGame]);

  const setOfficeStyle = useCallback((officeStyle: OfficeStyle) => {
    updateGame({ officeStyle });
  }, [updateGame]);

  const setPhase = useCallback((phase: GamePhase) => {
    updateGame({ phase });
  }, [updateGame]);

  const persist = useCallback((next: GameState) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
    return next;
  }, []);

  const initOffice = useCallback(() => {
    setState(prev => persist({
      ...prev,
      phase: 'office',
      tutorialStep: 1,
      tasks: [
        { id: genId(), title: 'Set up your office space', status: 'pending', createdAt: Date.now(), assignedTo: null },
        { id: genId(), title: 'Create a business plan', status: 'pending', createdAt: Date.now() - 1000, assignedTo: null },
        { id: genId(), title: 'Hire your first team member', status: 'pending', createdAt: Date.now() - 2000, assignedTo: null },
      ],
      documents: [
        { id: genId(), title: 'Company Registration', type: 'contract', createdAt: Date.now() },
        { id: genId(), title: 'Business Plan Template', type: 'memo', createdAt: Date.now() - 5000 },
      ],
      events: [
        { id: genId(), message: `Welcome to OfficeOS! Your office is open for business.`, type: 'system', timestamp: Date.now() },
        ...(prev.company?.name ? [{ id: genId(), message: `${prev.company.name} is now registered.`, type: 'system' as const, timestamp: Date.now() - 100 }] : []),
      ],
    }));
  }, [persist]);

  const addEmployee = useCallback((type: EmployeeType) => {
    const COSTS: Record<EmployeeType, number> = {
      assistant: 800, accountant: 1200, lawyer: 1500,
      marketer: 1000, it: 1100, warehouse: 900,
    };
    const cost = COSTS[type];
    setState(prev => {
      if (prev.balance < cost) return prev;
      const names = EMPLOYEE_NAMES[type];
      const name = names[prev.employees.filter(e => e.type === type).length % names.length];
      const employee: Employee = { id: genId(), type, name, status: 'idle', hiredAt: Date.now(), messages: [], currentTaskId: null, lastResult: null };
      const newEvent: GameEvent = { id: genId(), message: `${name} joined as ${type}.`, type: 'hire', timestamp: Date.now() };
      return persist({
        ...prev,
        balance: prev.balance - cost,
        employees: [...prev.employees, employee],
        events: [newEvent, ...prev.events],
        tasks: prev.tasks.map(t => t.title === 'Hire your first team member' ? { ...t, status: 'done' as const } : t),
      });
    });
  }, [persist]);

  const RESULT_TEXTS: Record<EmployeeType, string[]> = {
    assistant: ['Schedule organized and reminders set.', 'All arrangements completed and confirmed.'],
    accountant: ['Financial report ready — numbers look healthy.', 'Books balanced, expense summary attached.'],
    lawyer: ['Contract drafted and reviewed for compliance.', 'Legal memo prepared with recommendations.'],
    marketer: ['Campaign brief ready — projected reach looks strong.', 'Market analysis done, strategy proposed.'],
    it: ['System configured and tested successfully.', 'Automation deployed — process now runs itself.'],
    warehouse: ['Inventory updated and layout optimized.', 'Logistics coordinated, shipments on track.'],
  };

  const assignTask = useCallback((employeeId: string, title: string) => {
    setState(prev => {
      const emp = prev.employees.find(e => e.id === employeeId);
      if (!emp || emp.status === 'working') return prev; // one task at a time
      const taskId = genId();
      const finishAt = Date.now() + 10000 + Math.random() * 8000;
      return persist({
        ...prev,
        tasks: [{ id: taskId, title, status: 'in_progress' as const, createdAt: Date.now(), assignedTo: employeeId, finishAt }, ...prev.tasks],
        employees: prev.employees.map(e => e.id === employeeId
          ? { ...e, status: 'working' as const, currentTaskId: taskId }
          : e),
        events: [{ id: genId(), message: `Task "${title}" assigned to ${emp.name}.`, type: 'task' as const, timestamp: Date.now() }, ...prev.events].slice(0, 50),
      });
    });
  }, [persist]);

  const acknowledgeResult = useCallback((employeeId: string) => {
    setState(prev => persist({
      ...prev,
      employees: prev.employees.map(e => e.id === employeeId && e.status === 'done'
        ? { ...e, status: 'idle' as const }
        : e),
    }));
  }, [persist]);

  // Tick: auto-complete in-progress tasks whose finishAt passed
  useEffect(() => {
    if (!isLoaded) return;
    const iv = setInterval(() => {
      setState(prev => {
        const now = Date.now();
        const due = prev.tasks.filter(t => t.status === 'in_progress' && t.finishAt && t.finishAt <= now);
        if (due.length === 0) return prev;
        let next = { ...prev };
        for (const task of due) {
          const emp = next.employees.find(e => e.id === task.assignedTo);
          const pool = emp ? RESULT_TEXTS[emp.type] : ['Task completed.'];
          const result = pool[Math.floor(Math.random() * pool.length)];
          next = {
            ...next,
            tasks: next.tasks.map(t => t.id === task.id ? { ...t, status: 'done' as const, result } : t),
            employees: next.employees.map(e => e.id === task.assignedTo
              ? { ...e, status: 'done' as const, currentTaskId: null, lastResult: result }
              : e),
            documents: [{ id: genId(), title: task.title, type: 'report' as const, createdAt: now }, ...next.documents],
            events: [{ id: genId(), message: `${emp?.name ?? 'Employee'} finished "${task.title}".`, type: 'task' as const, timestamp: now }, ...next.events].slice(0, 50),
          };
        }
        return persist(next);
      });
    }, 2000);
    return () => clearInterval(iv);
  }, [isLoaded, persist]);

  const addTask = useCallback((title: string) => {
    setState(prev => persist({
      ...prev,
      tasks: [{ id: genId(), title, status: 'pending', createdAt: Date.now(), assignedTo: null }, ...prev.tasks],
    }));
  }, [persist]);

  const completeTask = useCallback((id: string) => {
    setState(prev => persist({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, status: 'done' as const } : t),
      events: [{ id: genId(), message: 'Task completed.', type: 'task', timestamp: Date.now() }, ...prev.events],
    }));
  }, [persist]);

  const addEvent = useCallback((message: string, type: GameEvent['type']) => {
    setState(prev => persist({
      ...prev,
      events: [{ id: genId(), message, type, timestamp: Date.now() }, ...prev.events].slice(0, 50),
    }));
  }, [persist]);

  const sendEmployeeMessage = useCallback((employeeId: string, content: string) => {
    setState(prev => persist({
      ...prev,
      employees: prev.employees.map(e => {
        if (e.id !== employeeId) return e;
        const responses = AI_RESPONSES[e.type];
        const reply = responses[Math.floor(Math.random() * responses.length)];
        return {
          ...e, status: 'working' as const,
          messages: [
            ...e.messages,
            { id: genId(), role: 'user' as const, content, timestamp: Date.now() },
            { id: genId(), role: 'assistant' as const, content: reply, timestamp: Date.now() + 100 },
          ],
        };
      }),
    }));
  }, [persist]);

  const advanceTutorial = useCallback(() => {
    setState(prev => persist({ ...prev, tutorialStep: prev.tutorialStep + 1 }));
  }, [persist]);

  const spendBalance = useCallback((amount: number): boolean => {
    let success = false;
    setState(prev => {
      if (prev.balance < amount) return prev;
      success = true;
      return persist({
        ...prev,
        balance: prev.balance - amount,
        events: [{ id: genId(), message: `Spent $${amount.toLocaleString()}.`, type: 'finance', timestamp: Date.now() }, ...prev.events],
      });
    });
    return success;
  }, [persist]);

  const resetGame = useCallback(() => {
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    setState(INITIAL_STATE);
  }, []);

  return (
    <GameContext.Provider value={{
      state, isLoaded,
      updateGame, setPlayer, setCompany, setOfficeStyle, setPhase, initOffice,
      addEmployee, addTask, assignTask, acknowledgeResult, completeTask, addEvent,
      sendEmployeeMessage, advanceTutorial, spendBalance, resetGame,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
