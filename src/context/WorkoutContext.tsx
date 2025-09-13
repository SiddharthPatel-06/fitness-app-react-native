// app/context/WorkoutContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

export type Set = {
  id: string;
  reps: string;
  weight: string;
  completed: boolean;
};

export type Exercise = {
  id: string;
  name: string;
  _id?: string;
  sets: Set[];
};

type WorkoutState = {
  isActive: boolean;
  isPaused: boolean;
  exercises: Exercise[];
  startTime: number | null;
  pausedTime: number | null;
  totalElapsed: number;
};

type WorkoutContextType = {
  state: WorkoutState;
  startWorkout: () => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  endWorkout: () => void;
  addExercise: (exercise: Omit<Exercise, "id" | "sets">) => void;
  deleteExercise: (exerciseId: string) => void;
  addSet: (exerciseId: string) => void;
  updateSet: (exerciseId: string, setId: string, updates: Partial<Set>) => void;
  clearWorkout: () => void;
  getElapsedSeconds: () => number;
};

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, setState] = useState<WorkoutState>({
    isActive: false,
    isPaused: false,
    exercises: [],
    startTime: null,
    pausedTime: null,
    totalElapsed: 0,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startWorkout = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isActive: true,
      isPaused: false,
      startTime: Date.now(),
      pausedTime: null,
    }));
  }, []);

  const pauseWorkout = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPaused: true,
      pausedTime: Date.now(),
    }));
  }, []);

  const resumeWorkout = useCallback(() => {
    setState((prev) => {
      if (!prev.startTime || !prev.pausedTime) return prev;

      const pauseDuration = Date.now() - prev.pausedTime;
      const newStartTime = prev.startTime + pauseDuration;

      return {
        ...prev,
        isPaused: false,
        startTime: newStartTime,
        pausedTime: null,
      };
    });
  }, []);

  const endWorkout = useCallback(() => {
    setState({
      isActive: false,
      isPaused: false,
      exercises: [],
      startTime: null,
      pausedTime: null,
      totalElapsed: 0,
    });
  }, []);

  const addExercise = useCallback((exercise: Omit<Exercise, "id" | "sets">) => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      ...exercise,
      sets: [],
    };
    setState((prev) => ({
      ...prev,
      exercises: [...prev.exercises, newExercise],
    }));
  }, []);

  const deleteExercise = useCallback((exerciseId: string) => {
    setState((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((ex) => ex.id !== exerciseId),
    }));
  }, []);

  const addSet = useCallback((exerciseId: string) => {
    setState((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise) => {
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            sets: [
              ...exercise.sets,
              {
                id: Date.now().toString(),
                reps: "",
                weight: "",
                completed: false,
              },
            ],
          };
        }
        return exercise;
      }),
    }));
  }, []);

  const updateSet = useCallback(
    (exerciseId: string, setId: string, updates: Partial<Set>) => {
      setState((prev) => ({
        ...prev,
        exercises: prev.exercises.map((exercise) => {
          if (exercise.id === exerciseId) {
            return {
              ...exercise,
              sets: exercise.sets.map((set) => {
                if (set.id === setId) {
                  return { ...set, ...updates };
                }
                return set;
              }),
            };
          }
          return exercise;
        }),
      }));
    },
    []
  );

  const clearWorkout = useCallback(() => {
    setState({
      isActive: false,
      isPaused: false,
      exercises: [],
      startTime: null,
      pausedTime: null,
      totalElapsed: 0,
    });
  }, []);

  const getElapsedSeconds = useCallback(() => {
    if (!state.isActive) return state.totalElapsed;

    if (state.isPaused && state.pausedTime && state.startTime) {
      return Math.floor((state.pausedTime - state.startTime) / 1000);
    }

    if (state.startTime) {
      return Math.floor((Date.now() - state.startTime) / 1000);
    }

    return state.totalElapsed;
  }, [
    state.isActive,
    state.isPaused,
    state.startTime,
    state.pausedTime,
    state.totalElapsed,
  ]);

  return (
    <WorkoutContext.Provider
      value={{
        state,
        startWorkout,
        pauseWorkout,
        resumeWorkout,
        endWorkout,
        addExercise,
        deleteExercise,
        addSet,
        updateSet,
        clearWorkout,
        getElapsedSeconds,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error("useWorkout must be used inside WorkoutProvider");
  }
  return context;
};
