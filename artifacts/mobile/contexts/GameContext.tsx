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

export interface Employee {
  id: string;
  type: EmployeeType;
  name: string;
  status: 'idle' | 'working' | 'away';
  hiredAt: number;
  messages: ChatMessage[];
}

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'done';
  createdAt: number;
  assignedTo: string | null;
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
  setPlayer: (player: Player) => void;
  setCompany: (company: Company) => void;
  setOfficeStyle: (style: OfficeStyle) => void;
  setPhase: (phase: GamePhase) => void;
  initOffice: () => void;
  addEmployee: (type: EmployeeType) => void;
  addTask: (title: string) => void;
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
          const saved = JSON.parse(raw) as GameState;
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

  const setPlayer = useCallback((player: Player) => {
    save({ ...state, player });
  }, [state, save]);

  const setCompany = useCallback((company: Company) => {
    save({ ...state, company });
  }, [state, save]);

  const setOfficeStyle = useCallback((officeStyle: OfficeStyle) => {
    save({ ...state, officeStyle });
  }, [state, save]);

  const setPhase = useCallback((phase: GamePhase) => {
    save({ ...state, phase });
  }, [state, save]);

  const initOffice = useCallback(() => {
    const tasks: Task[] = [
      { id: genId(), title: 'Set up your office space', status: 'pending', createdAt: Date.now(), assignedTo: null },
      { id: genId(), title: 'Create a business plan', status: 'pending', createdAt: Date.now() - 1000, assignedTo: null },
      { id: genId(), title: 'Hire your first team member', status: 'pending', createdAt: Date.now() - 2000, assignedTo: null },
    ];
    const documents: GameDocument[] = [
      { id: genId(), title: 'Company Registration', type: 'contract', createdAt: Date.now() },
      { id: genId(), title: 'Business Plan Template', type: 'memo', createdAt: Date.now() - 5000 },
    ];
    const events: GameEvent[] = [
      { id: genId(), message: `Welcome to OfficeOS! Your office is open for business.`, type: 'system', timestamp: Date.now() },
    ];
    if (state.company?.name) {
      events.push({ id: genId(), message: `${state.company.name} is now registered.`, type: 'system', timestamp: Date.now() - 100 });
    }
    save({ ...state, phase: 'office', tasks, documents, events, tutorialStep: 1 });
  }, [state, save]);

  const addEmployee = useCallback((type: EmployeeType) => {
    const COSTS: Record<EmployeeType, number> = {
      assistant: 800, accountant: 1200, lawyer: 1500,
      marketer: 1000, it: 1100, warehouse: 900,
    };
    const cost = COSTS[type];
    if (state.balance < cost) return;
    const names = EMPLOYEE_NAMES[type];
    const name = names[state.employees.filter(e => e.type === type).length % names.length];
    const employee: Employee = {
      id: genId(), type, name,
      status: 'working', hiredAt: Date.now(), messages: [],
    };
    const newEvent: GameEvent = {
      id: genId(), message: `${name} joined as ${type}.`, type: 'hire', timestamp: Date.now(),
    };
    const updatedTask = state.tasks.map(t =>
      t.title === 'Hire your first team member' ? { ...t, status: 'done' as const } : t
    );
    save({
      ...state,
      balance: state.balance - cost,
      employees: [...state.employees, employee],
      events: [newEvent, ...state.events],
      tasks: updatedTask,
    });
  }, [state, save]);

  const addTask = useCallback((title: string) => {
    const task: Task = {
      id: genId(), title, status: 'pending', createdAt: Date.now(), assignedTo: null,
    };
    save({ ...state, tasks: [task, ...state.tasks] });
  }, [state, save]);

  const completeTask = useCallback((id: string) => {
    const tasks = state.tasks.map(t => t.id === id ? { ...t, status: 'done' as const } : t);
    const ev: GameEvent = { id: genId(), message: 'Task completed.', type: 'task', timestamp: Date.now() };
    save({ ...state, tasks, events: [ev, ...state.events] });
  }, [state, save]);

  const addEvent = useCallback((message: string, type: GameEvent['type']) => {
    const ev: GameEvent = { id: genId(), message, type, timestamp: Date.now() };
    save({ ...state, events: [ev, ...state.events].slice(0, 50) });
  }, [state, save]);

  const sendEmployeeMessage = useCallback((employeeId: string, content: string) => {
    const employees = state.employees.map(e => {
      if (e.id !== employeeId) return e;
      const userMsg: ChatMessage = { id: genId(), role: 'user', content, timestamp: Date.now() };
      const responses = AI_RESPONSES[e.type];
      const reply = responses[Math.floor(Math.random() * responses.length)];
      const aiMsg: ChatMessage = { id: genId(), role: 'assistant', content: reply, timestamp: Date.now() + 100 };
      return { ...e, status: 'working' as const, messages: [...e.messages, userMsg, aiMsg] };
    });
    save({ ...state, employees });
  }, [state, save]);

  const advanceTutorial = useCallback(() => {
    const next = state.tutorialStep + 1;
    save({ ...state, tutorialStep: next });
  }, [state, save]);

  const spendBalance = useCallback((amount: number): boolean => {
    if (state.balance < amount) return false;
    const ev: GameEvent = { id: genId(), message: `Spent $${amount.toLocaleString()}.`, type: 'finance', timestamp: Date.now() };
    save({ ...state, balance: state.balance - amount, events: [ev, ...state.events] });
    return true;
  }, [state, save]);

  const resetGame = useCallback(() => {
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    setState(INITIAL_STATE);
  }, []);

  return (
    <GameContext.Provider value={{
      state, isLoaded,
      setPlayer, setCompany, setOfficeStyle, setPhase, initOffice,
      addEmployee, addTask, completeTask, addEvent,
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
