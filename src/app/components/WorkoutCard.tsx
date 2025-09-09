import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

type WorkoutSet = { reps: number; weight: number; weightUnit?: string };
type WorkoutExerciseEntry = {
  exercise: { _id: string; name: string; imageUrl?: string };
  sets: WorkoutSet[];
};
type Workout = {
  _id: string;
  date: string;
  duration?: number;
  exercises: WorkoutExerciseEntry[];
};

function formatDateLabel(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);

  // check today
  const today = new Date();
  if (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  ) {
    return "Today";
  }

  // check yesterday
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  ) {
    return "Yesterday";
  }

  // fallback
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatDuration(sec?: number) {
  if (!sec) return "0s";
  const s = sec % 60;
  const m = Math.floor((sec % 3600) / 60);
  const h = Math.floor(sec / 3600);
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function WorkoutCard({
  workout,
  onPress,
}: {
  workout: Workout;
  onPress: () => void;
}) {
  const exercisesCount = workout.exercises?.length || 0;
  const totalSets =
    workout.exercises?.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0) ||
    0;
  const totalVolume =
    workout.exercises?.reduce((acc, ex) => {
      const vol = (ex.sets || []).reduce(
        (sum, s) => sum + s.reps * (s.weight || 0),
        0
      );
      return acc + vol;
    }, 0) || 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-lg p-4 mb-4 shadow"
    >
      <View className="flex-row justify-between items-start">
        <View>
          {/* Date label (Today, Yesterday, or formatted date) */}
          <Text className="font-semibold text-lg">
            {formatDateLabel(workout.date)}
          </Text>

          {/* Duration with clock icon */}
          <View className="flex-row items-center mt-1">
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text className="ml-1 text-sm text-gray-600">
              {formatDuration(workout.duration)}
            </Text>
          </View>
        </View>

        <View className="items-end">
          <View className="w-10 h-10 rounded-full bg-white items-center justify-center border border-gray-200">
            <Ionicons name="fitness-outline" size={24} color="#3B82F6" />
          </View>
        </View>
      </View>

      <View className="mt-3">
        <View className="flex-row flex-wrap">
          <View className="bg-gray-100 px-4 py-2 rounded-md mr-2 mb-2">
            <Text className="text-sm">{exercisesCount} exercises</Text>
          </View>
          <View className="bg-gray-100 px-4 py-2 rounded-md mr-2 mb-2">
            <Text className="text-sm">{totalSets} sets</Text>
          </View>
        </View>

        <View className="mt-2">
          <Text className="text-sm text-gray-600">Exercises:</Text>
          <View className="flex-row flex-wrap mt-2">
            {workout.exercises.map((ex, idx) => (
              <View
                key={String(idx)}
                className="bg-blue-50 px-2 py-1 rounded mr-2 mb-2"
              >
                <Text className="text-blue-700 text-sm">
                  {ex.exercise.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
