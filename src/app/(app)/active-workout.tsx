import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { client } from "../../lib/sanity/client";
import { useAuth } from "@clerk/clerk-expo";
import { Alert } from "react-native";

// Define types
type Set = {
  id: string;
  reps: string; // string while typing
  weight: string; // string while typing
  completed: boolean;
};

type Exercise = {
  id: string;
  name: string;
  _id?: string;
  sets: Set[];
};

type SanityExercise = {
  _id: string;
  name: string;
  description: string;
  difficulty: string;
  imageUrl?: string;
  videoUrl?: string;
  isActive: boolean;
};

// Save workout function
const saveWorkout = async (workoutData: any) => {
  const { exercises, duration, userId } = workoutData;

  const doc = {
    _type: "workout",
    date: new Date().toISOString(),
    duration,
    userId,
    exercises: exercises.map((exercise: any) => ({
      exercise: {
        _type: "reference",
        _ref: exercise._id || exercise.id,
      },
      sets: exercise.sets
        .filter((set) => set.completed)
        .map((set) => ({
          reps: parseInt(set.reps) || 0,
          weight: parseInt(set.weight) || 0,
          weightUnit: "kg",
        })),
    })),
  };

  try {
    const result = await client.create(doc);
    return result;
  } catch (error) {
    console.error("Error saving workout:", error);
    throw error;
  }
};

// SetItem Component
const SetItem = ({
  set,
  index,
  onUpdate,
}: {
  set: Set;
  index: number;
  onUpdate: (updates: Partial<Set>) => void;
}) => {
  return (
    <View className="flex-row items-center py-3 px-4">
      <Text className="text-gray-800 w-6 font-medium text-center">
        {index + 1}
      </Text>

      <View className="flex-1 flex-row items-center ml-4">
        <View className="flex-1 items-center">
          <Text className="text-gray-500 text-xs mb-1">Reps</Text>
          <TextInput
            className="text-center text-base w-16 border border-gray-300 rounded text-black bg-white"
            keyboardType="numeric"
            value={String(set.reps)}
            onChangeText={(text) => onUpdate({ reps: text })}
            style={{
              height: 40, // fixed height (40px)
              textAlignVertical: "center", // vertically center text
              paddingVertical: 0, // remove default vertical padding
            }}
          />
        </View>

        <View className="flex-1 items-center mx-4">
          <Text className="text-gray-500 text-xs mb-1">Weight (kg)</Text>
          <TextInput
            className="text-center text-base w-16 border border-gray-300 rounded text-black bg-white"
            keyboardType="numeric"
            value={String(set.weight)}
            onChangeText={(text) => onUpdate({ weight: text })}
            style={{
              height: 40,
              textAlignVertical: "center",
              paddingVertical: 0,
            }}
          />
        </View>
      </View>

      <TouchableOpacity
        className={`w-8 h-8 rounded-full items-center justify-center ml-4 ${
          set.completed ? "bg-green-500" : "bg-red-500"
        }`}
        onPress={() => onUpdate({ completed: !set.completed })}
      >
        {set.completed && <Ionicons name="checkmark" size={16} color="white" />}
      </TouchableOpacity>
    </View>
  );
};

// ExerciseItem Component
const ExerciseItem = ({
  exercise,
  onAddSet,
  onUpdateSet,
  onDeleteExercise,
}: {
  exercise: Exercise;
  onAddSet: () => void;
  onUpdateSet: (setId: string, updates: Partial<Set>) => void;
  onDeleteExercise: (exerciseId: string) => void;
}) => {
  const completedSets = exercise.sets.filter((set) => set.completed).length;

  return (
    <View className="bg-white rounded-lg mb-4 mx-4">
      <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">
            {exercise.name}
          </Text>
          <Text className="text-gray-500 text-sm">
            {exercise.sets.length} sets • {completedSets} completed
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => onDeleteExercise(exercise.id)}
          className="w-8 h-8 bg-red-600 rounded items-center justify-center"
        >
          <Ionicons name="trash" size={12} color="white" />
        </TouchableOpacity>
      </View>

      <View className="bg-gray-50">
        <Text className="text-gray-600 text-sm font-medium px-4 py-2">
          Sets
        </Text>

        {exercise.sets.length === 0 ? (
          <View className="px-4 py-6">
            <Text className="text-gray-400 text-center">
              No sets yet. Add your first set below.
            </Text>
          </View>
        ) : (
          exercise.sets.map((set, index) => (
            <SetItem
              key={set.id}
              set={set}
              index={index}
              onUpdate={(updates) => onUpdateSet(set.id, updates)}
            />
          ))
        )}

        <TouchableOpacity
          className="py-3 mx-4 mb-4 rounded-lg border border-blue-300 border-dashed bg-blue-50"
          onPress={onAddSet}
        >
          <Text className="text-center text-blue-600 font-medium">
            + Add Set
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// AddExerciseModal Component
const AddExerciseModal = ({
  visible,
  onClose,
  onSelectExercise,
}: {
  visible: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: SanityExercise) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [exercises, setExercises] = useState<SanityExercise[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        const data = await client.fetch(`*[_type == "exercise"]{
          _id,
          name,
          description,
          difficulty,
          "imageUrl": image.asset->url,
          videoUrl,
          isActive
        }`);
        setExercises(data.filter((e: SanityExercise) => e.isActive));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      fetchExercises();
    }
  }, [visible]);

  const filteredExercises = exercises.filter((exercise) =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-500";
      case "intermediate":
        return "bg-yellow-500";
      case "advanced":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView className="flex-1 bg-white">
        <View className="p-4 flex-1">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold text-gray-900">
              Add Exercise
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#4B5563" />
            </TouchableOpacity>
          </View>

          <Text className="text-gray-600 mb-4">
            Tap any exercise to add it to your workout
          </Text>

          <View className="bg-gray-100 rounded-lg px-4 py-3 mb-4 flex-row items-center">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Search exercises..."
              className="ml-2 flex-1 text-gray-800"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="mt-2 text-gray-600">Loading exercises...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredExercises}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="flex-row items-center p-4 border-b border-gray-100"
                  onPress={() => onSelectExercise(item)}
                >
                  <View className="w-12 h-12 bg-gray-200 rounded-lg mr-4 items-center justify-center">
                    <Ionicons name="fitness" size={24} color="#6B7280" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900 mb-1">
                      {item.name}
                    </Text>
                    <Text className="text-gray-600 text-sm" numberOfLines={2}>
                      {item.description}
                    </Text>
                  </View>
                  <View
                    className={`px-3 py-1 rounded-full ${getDifficultyColor(
                      item.difficulty
                    )}`}
                  >
                    <Text className="text-white text-xs font-medium uppercase">
                      {item.difficulty}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// Main ActiveWorkout Component
export default function ActiveWorkout() {
  const router = useRouter();
  const { userId } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showSavingModal, setShowSavingModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (!isPaused) {
      timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const addExercise = (exercise: SanityExercise) => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      _id: exercise._id,
      name: exercise.name,
      sets: [],
    };
    setExercises([...exercises, newExercise]);
    setShowAddExercise(false);
  };

  const deleteExercise = (exerciseId: string) => {
    setExercises(exercises.filter((ex) => ex.id !== exerciseId));
  };

  const addSet = (exerciseId: string) => {
    setExercises(
      exercises.map((exercise) => {
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            sets: [
              ...exercise.sets,
              {
                id: Date.now().toString(),
                reps: "", // empty string initially
                weight: "", // empty string initially
                completed: false,
              },
            ],
          };
        }
        return exercise;
      })
    );
  };

  const updateSet = (
    exerciseId: string,
    setId: string,
    updates: Partial<Set>
  ) => {
    setExercises(
      exercises.map((exercise) => {
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
      })
    );
  };

  const completeWorkout = async () => {
    try {
      if (!userId) {
        Alert.alert("User not authenticated");
        return;
      }

      setShowSavingModal(true);

      const workoutData = {
        exercises: exercises.filter((ex) =>
          ex.sets.some((set) => set.completed)
        ),
        duration: timeElapsed,
        userId,
      };

      // Save to Sanity
      await saveWorkout(workoutData);

      setShowSavingModal(false);

      // Navigate back
      router.replace("/(tabs)/history");
    } catch (error) {
      console.error("Error saving workout:", error);
      setShowSavingModal(false);
      Alert.alert("Failed to save workout. Please try again.");
    }
  };

  const handleRest = () => {
    setIsPaused((prev) => !prev);
  };

  const handleEndWorkout = () => {
    Alert.alert(
      "End Workout",
      "Are you sure you want to end this workout? All progress will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End",
          style: "destructive",
          onPress: () => router.replace("/(tabs)/history"),
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center p-4 bg-white border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity className="mr-3" onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <View>
              <Text className="text-lg font-bold text-gray-900">
                Active Workout
              </Text>
              <Text className="text-sm text-gray-500">
                {formatTime(timeElapsed)}
              </Text>
            </View>
          </View>
          <View className="flex-row">
            <TouchableOpacity
              className="mr-2 px-3 py-1 bg-gray-200 rounded"
              onPress={handleRest}
            >
              <Text className="text-gray-700 text-sm font-bold">
                {isPaused ? "Resume" : "Rest"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="px-3 py-1 bg-red-600 rounded"
              onPress={handleEndWorkout}
            >
              <Text className="text-white text-sm font-bold">End Workout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Exercise Count */}
        <View className="px-4 py-2 bg-white border-b border-gray-200">
          <Text className="text-gray-600 text-sm">
            {exercises.length} exercises
          </Text>
        </View>

        {exercises.length === 0 ? (
          <View className="flex-1 justify-center items-center px-4">
            <View className="w-16 h-16 bg-gray-200 rounded-full mb-4 items-center justify-center">
              <Ionicons name="fitness" size={32} color="#9CA3AF" />
            </View>
            <Text className="text-gray-900 text-lg font-medium mb-2">
              No exercises yet
            </Text>
            <Text className="text-gray-500 text-center mb-8">
              Get started by adding your first exercise below
            </Text>
          </View>
        ) : (
          <ScrollView className="flex-1 py-4">
            {exercises.map((exercise) => (
              <ExerciseItem
                key={exercise.id}
                exercise={exercise}
                onAddSet={() => addSet(exercise.id)}
                onUpdateSet={(setId, updates) =>
                  updateSet(exercise.id, setId, updates)
                }
                onDeleteExercise={deleteExercise}
              />
            ))}
          </ScrollView>
        )}

        {/* Footer Buttons */}
        <View className="p-4 bg-white border-t border-gray-200">
          <TouchableOpacity
            className="bg-blue-500 py-4 rounded-lg mb-3 flex-row items-center justify-center"
            onPress={() => setShowAddExercise(true)}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Add Exercise</Text>
          </TouchableOpacity>

          {exercises.length > 0 && (
            <TouchableOpacity
              className="bg-green-500 py-4 rounded-lg flex-row items-center justify-center"
              onPress={completeWorkout}
            >
              <Text className="text-white font-semibold">Complete Workout</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Add Exercise Modal */}
      <AddExerciseModal
        visible={showAddExercise}
        onClose={() => setShowAddExercise(false)}
        onSelectExercise={addExercise}
      />

      {/* Saving Modal */}
      <Modal visible={showSavingModal} transparent>
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white p-6 rounded-lg m-4 min-w-64">
            <View className="items-center">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="mt-4 text-gray-800 font-medium">
                Saving Workout
              </Text>
              <Text className="mt-1 text-gray-600 text-center">
                Please wait while we save your workout...
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
