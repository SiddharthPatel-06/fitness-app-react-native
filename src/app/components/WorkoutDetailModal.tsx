import React, { useEffect } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  BackHandler,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { client } from "../../lib/sanity/client";
import { useFocusEffect } from "@react-navigation/native";

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

function formatFullDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
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

export default function WorkoutDetailModal({
  visible,
  workout,
  onClose,
}: {
  visible: boolean;
  workout: Workout;
  onClose: () => void;
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

  // Handle Android back button
  useEffect(() => {
    if (visible) {
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          onClose();
          return true;
        }
      );

      return () => backHandler.remove();
    }
  }, [visible, onClose]);

  // Handle gesture navigation (swipe back)
  useFocusEffect(
    React.useCallback(() => {
      // This will be called when the screen comes into focus
      return () => {
        // This will be called when the screen goes out of focus
        // which happens when user swipes back using gesture navigation
        if (visible) {
          onClose();
        }
      };
    }, [visible, onClose])
  );

  async function handleDelete() {
    Alert.alert(
      "Delete Workout",
      "Are you sure you want to delete this workout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await client.delete(workout._id);
              onClose(); // close after deleting
            } catch (err) {
              console.error("delete workout", err);
              Alert.alert("Error", "Failed to delete workout.");
            }
          },
        },
      ]
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose} // This handles the Android back button
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.6}
            className="flex-row items-center"
          >
            <Feather name="chevron-left" size={22} color="#60a5fa" />
            <Text className="text-base font-medium text-blue-400">History</Text>
          </TouchableOpacity>

          <Text className="text-lg font-bold">Workout Record</Text>
          <View style={{ width: 70 }} />
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Workout Summary */}
          <View className="bg-white rounded-lg p-4 shadow mb-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold">Workout Summary</Text>

              <TouchableOpacity
                onPress={handleDelete}
                className="flex-row items-center bg-red-600 px-3 py-1.5 rounded"
              >
                <Feather name="trash-2" size={16} color="#fff" />
                <Text className="text-white text-sm font-medium ml-1">
                  Delete
                </Text>
              </TouchableOpacity>
            </View>

            <View className="space-y-2">
              <View className="flex-row items-center">
                <Feather name="calendar" size={16} color="#4B5563" />
                <Text className="ml-2 text-gray-700">
                  {formatFullDate(workout.date)}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Feather name="clock" size={16} color="#4B5563" />
                <Text className="ml-2 text-gray-700">
                  {formatDuration(workout.duration)}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Feather name="heart" size={16} color="#4B5563" />
                <Text className="ml-2 text-gray-700">
                  {exercisesCount} exercises
                </Text>
              </View>
              <View className="flex-row items-center">
                <Feather name="bar-chart-2" size={16} color="#4B5563" />
                <Text className="ml-2 text-gray-700">
                  {totalSets} total sets
                </Text>
              </View>
              <View className="flex-row items-center">
                <MaterialCommunityIcons
                  name="dumbbell"
                  size={16}
                  color="#4B5563"
                />
                <Text className="ml-2 text-gray-700">
                  {totalVolume.toLocaleString()} kg total volume
                </Text>
              </View>
            </View>
          </View>

          {/* Exercises List */}
          {workout.exercises.map((entry, idx) => {
            const exVolume = (entry.sets || []).reduce(
              (s, set) => s + set.reps * (set.weight || 0),
              0
            );
            return (
              <View
                key={idx}
                className="bg-white rounded-lg p-4 mb-4 shadow border border-gray-100"
              >
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-lg font-semibold">
                    {entry.exercise.name}
                  </Text>
                  <View className="w-7 h-7 bg-blue-50 rounded-full items-center justify-center">
                    <Text className="text-blue-600 text-sm font-semibold">
                      {idx + 1}
                    </Text>
                  </View>
                </View>

                <Text className="text-sm text-gray-600 mb-3">
                  {entry.sets.length} sets completed
                </Text>

                <View className="bg-gray-50 rounded">
                  {entry.sets.map((s, i) => (
                    <View
                      key={i}
                      className="flex-row justify-between items-center px-3 py-2 border-b border-gray-200"
                    >
                      <View className="flex-row items-center">
                        <View className="w-6 h-6 rounded-full bg-gray-200 items-center justify-center mr-2">
                          <Text className=" text-xs font-semibold">
                            {i + 1}
                          </Text>
                        </View>

                        <Text className="text-gray-700">{s.reps} reps</Text>
                      </View>
                      <Text className="text-gray-700">
                        {s.weight} {s.weightUnit || "kg"}
                      </Text>
                    </View>
                  ))}
                </View>

                <View className="flex-row justify-between mt-2">
                  <Text className="text-sm text-gray-500">
                    Exercise Volume:{" "}
                  </Text>
                  <Text className="ml-1 font-semibold">{exVolume} kg</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}
