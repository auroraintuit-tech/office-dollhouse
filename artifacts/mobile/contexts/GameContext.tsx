import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AvatarId } from '@/constants/colors';
import { executeAiTask } from '@/services/ai';

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
  status: 'pending' | 'in_progress' | 'done' | 'failed';
  createdAt: number;
  assignedTo: string | null;
  result?: string | null;
  error?: string | null;
}

export interface GameDocument {
  id: string;
  title: string;
  type: 'contract' | 'report' | 'invoice' | 'memo';
  createdAt: number;
  summary?: string | null;
  content?: string | null;
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
  xp: number;
  unlockedRooms: number;
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
  xp: 0,
  unlockedRooms: 1,
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
  assistant: ['Алекс', 'Сэм', 'Джордан'],
  accountant: ['Morgan Liu', 'Casey Park', 'Dana Wu'],
  lawyer: ['Blake Torres', 'Avery Walsh', 'Quinn Lee'],
  marketer: ['Riley Scott', 'Taylor Nguyen', 'Drew Hall'],
  it: ['Jamie Patel', 'Skyler Zhang', 'Reese Brown'],
  warehouse: ['Finley Ross', 'Harper Davis', 'Sage Thompson'],
};

function genId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const stateRef = useRef<GameState>(INITIAL_STATE);

  const persist = useCallback((next: GameState) => {
    stateRef.current = next;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
    return next;
  }, []);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

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
          stateRef.current = saved;
          setState(saved);
        } catch {
          stateRef.current = INITIAL_STATE;
          setState(INITIAL_STATE);
        }
      }
      setIsLoaded(true);
    });
  }, []);

  const updateGame = useCallback((updates: Partial<GameState>) => {
    setState(prev => {
      const next = { ...prev, ...updates };
      return persist(next);
    });
  }, [persist]);

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

  const initOffice = useCallback(() => {
    setState(prev => persist({
      ...prev,
      phase: 'office',
      tutorialStep: 1,
      tasks: [
        { id: genId(), title: 'Осмотреть новый офис', status: 'pending', createdAt: Date.now(), assignedTo: null },
        { id: genId(), title: 'Поставить первую бизнес-задачу', status: 'pending', createdAt: Date.now() - 1000, assignedTo: null },
        { id: genId(), title: 'Нанять первого AI-сотрудника', status: 'pending', createdAt: Date.now() - 2000, assignedTo: null },
      ],
      documents: [
        { id: genId(), title: 'Регистрация компании', type: 'contract', createdAt: Date.now(), content: 'Карточка компании создана в OfficeOS.' },
        { id: genId(), title: 'Шаблон бизнес-плана', type: 'memo', createdAt: Date.now() - 5000, content: 'Опишите продукт, клиента, проблему, решение, каналы продаж и ключевые показатели.' },
      ],
      events: [
        { id: genId(), message: 'Добро пожаловать в OfficeOS! Офис открыт.', type: 'system', timestamp: Date.now() },
        ...(prev.company?.name ? [{ id: genId(), message: `${prev.company.name}: карточка компании создана.`, type: 'system' as const, timestamp: Date.now() - 100 }] : []),
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
      const newEvent: GameEvent = { id: genId(), message: `${name} присоединился к команде.`, type: 'hire', timestamp: Date.now() };
      return persist({
        ...prev,
        balance: prev.balance - cost,
        employees: [...prev.employees, employee],
        events: [newEvent, ...prev.events],
        tasks: prev.tasks.map(t => t.title === 'Нанять первого AI-сотрудника' ? { ...t, status: 'done' as const } : t),
      });
    });
  }, [persist]);

  const assignTask = useCallback((employeeId: string, title: string) => {
    const snapshot = stateRef.current;
    const employee = snapshot.employees.find(e => e.id === employeeId);
    if (!employee || employee.status === 'working') return;

    const taskId = genId();
    const createdAt = Date.now();
    setState(prev => persist({
      ...prev,
      tasks: [{ id: taskId, title, status: 'in_progress', createdAt, assignedTo: employeeId }, ...prev.tasks],
      employees: prev.employees.map(e => e.id === employeeId
        ? { ...e, status: 'working' as const, currentTaskId: taskId, lastResult: null }
        : e),
      events: [{ id: genId(), message: `Задача «${title}» передана сотруднику ${employee.name}.`, type: 'task' as const, timestamp: createdAt }, ...prev.events].slice(0, 50),
    }));

    void executeAiTask({
      task: title,
      companyName: snapshot.company?.name,
      playerName: snapshot.player?.name,
    }).then(result => {
      const completedAt = Date.now();
      setState(prev => {
        const taskStillExists = prev.tasks.some(task => task.id === taskId);
        if (!taskStillExists) return prev;

        const nextXp = prev.xp + 50;
        const unlockedSecondRoom = prev.unlockedRooms < 2 && nextXp >= 100;
        const resultContent = [
          result.deliverable,
          result.nextSteps.length ? `Следующие шаги:\n${result.nextSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}` : '',
          result.riskNote ? `Важно: ${result.riskNote}` : '',
        ].filter(Boolean).join('\n\n');

        const completionEvent: GameEvent = {
          id: genId(),
          message: `${employee.name} завершил задачу «${title}». +50 XP, +$250.`,
          type: 'task',
          timestamp: completedAt,
        };
        const unlockEvent: GameEvent | null = unlockedSecondRoom ? {
          id: genId(),
          message: 'Открыта новая зона офиса!',
          type: 'system',
          timestamp: completedAt + 1,
        } : null;

        return persist({
          ...prev,
          balance: prev.balance + 250,
          xp: nextXp,
          unlockedRooms: unlockedSecondRoom ? 2 : prev.unlockedRooms,
          tasks: prev.tasks.map(task => task.id === taskId
            ? { ...task, status: 'done' as const, result: result.summary, error: null }
            : task),
          employees: prev.employees.map(e => e.id === employeeId
            ? { ...e, status: 'done' as const, currentTaskId: null, lastResult: result.summary }
            : e),
          documents: [{
            id: genId(),
            title: result.title,
            type: 'report' as const,
            createdAt: completedAt,
            summary: result.summary,
            content: resultContent,
          }, ...prev.documents],
          events: [unlockEvent, completionEvent, ...prev.events].filter((event): event is GameEvent => event !== null).slice(0, 50),
          tutorialStep: Math.max(prev.tutorialStep, 5),
        });
      });
    }).catch(error => {
      const message = error instanceof Error ? error.message : 'AI-сервис временно недоступен.';
      setState(prev => persist({
        ...prev,
        tasks: prev.tasks.map(task => task.id === taskId
          ? { ...task, status: 'failed' as const, error: message, result: null }
          : task),
        employees: prev.employees.map(e => e.id === employeeId
          ? { ...e, status: 'attention' as const, currentTaskId: null, lastResult: message }
          : e),
        events: [{ id: genId(), message: `Задача «${title}» требует повторного запуска: ${message}`, type: 'system' as const, timestamp: Date.now() }, ...prev.events].slice(0, 50),
      }));
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

  const addTask = useCallback((title: string) => {
    setState(prev => persist({
      ...prev,
      tasks: [{ id: genId(), title, status: 'pending', createdAt: Date.now(), assignedTo: null }, ...prev.tasks],
    }));
  }, [persist]);

  const completeTask = useCallback((id: string) => {
    setState(prev => {
      const task = prev.tasks.find(item => item.id === id);
      if (!task || task.status !== 'pending') return prev;
      return persist({
        ...prev,
        xp: prev.xp + 10,
        tasks: prev.tasks.map(item => item.id === id ? { ...item, status: 'done' as const } : item),
        events: [{ id: genId(), message: `Задача «${task.title}» выполнена. +10 XP.`, type: 'task', timestamp: Date.now() }, ...prev.events],
      });
    });
  }, [persist]);

  const addEvent = useCallback((message: string, type: GameEvent['type']) => {
    setState(prev => persist({
      ...prev,
      events: [{ id: genId(), message, type, timestamp: Date.now() }, ...prev.events].slice(0, 50),
    }));
  }, [persist]);

  const sendEmployeeMessage = useCallback((employeeId: string, content: string) => {
    const snapshot = stateRef.current;
    const employee = snapshot.employees.find(e => e.id === employeeId);
    if (!employee || employee.status === 'working') return;

    const sentAt = Date.now();
    setState(prev => persist({
      ...prev,
      employees: prev.employees.map(e => e.id === employeeId ? {
        ...e,
        status: 'working' as const,
        messages: [...e.messages, { id: genId(), role: 'user' as const, content, timestamp: sentAt }],
      } : e),
    }));

    void executeAiTask({
      task: `Ответь пользователю как бизнес-ассистент в рабочем чате. Сообщение: ${content}`,
      companyName: snapshot.company?.name,
      playerName: snapshot.player?.name,
    }).then(result => {
      const reply = [result.summary, result.deliverable, result.riskNote ? `Важно: ${result.riskNote}` : '']
        .filter(Boolean)
        .join('\n\n');
      setState(prev => persist({
        ...prev,
        employees: prev.employees.map(e => e.id === employeeId ? {
          ...e,
          status: 'idle' as const,
          messages: [...e.messages, { id: genId(), role: 'assistant' as const, content: reply, timestamp: Date.now() }],
        } : e),
      }));
    }).catch(error => {
      const message = error instanceof Error ? error.message : 'AI-сервис временно недоступен.';
      setState(prev => persist({
        ...prev,
        employees: prev.employees.map(e => e.id === employeeId ? {
          ...e,
          status: 'attention' as const,
          messages: [...e.messages, {
            id: genId(),
            role: 'assistant' as const,
            content: `Не удалось ответить: ${message}`,
            timestamp: Date.now(),
          }],
        } : e),
      }));
    });
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
        events: [{ id: genId(), message: `Списано $${amount.toLocaleString()}.`, type: 'finance', timestamp: Date.now() }, ...prev.events],
      });
    });
    return success;
  }, [persist]);

  const resetGame = useCallback(() => {
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    stateRef.current = INITIAL_STATE;
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
