// app/(app)/(tabs)/index.tsx
import { Link, router, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { client } from "../../../lib/sanity/client";
import { useWorkout } from "../../../context/WorkoutContext";

// Types
type WorkoutStats = {
  totalWorkouts: number;
  totalTime: number; // in seconds
  averageDuration: number; // in seconds
};

type LastWorkout = {
  date: string;
  duration: number; // in seconds
  exerciseCount: number;
  setCount: number;
};

export default function HomeScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const { startWorkout } = useWorkout();

  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState<WorkoutStats>({
    totalWorkouts: 0,
    totalTime: 0,
    averageDuration: 0,
  });
  const [lastWorkout, setLastWorkout] = useState<LastWorkout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [user?.id]);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Set user name from Clerk user data
      if (user) {
        // Try different possible name fields
        const name = user.firstName || user.fullName || user.username || "User";
        setUserName(name);
      }

      // Fetch user workouts to calculate stats
      const workouts = await client.fetch(
        `*[_type == "workout" && userId == $userId] | order(date desc){
          _id,
          date,
          duration,
          exercises
        }`,
        { userId: user?.id }
      );

      // Calculate stats
      const totalWorkouts = workouts.length;
      const totalTime = workouts.reduce(
        (sum: number, workout: any) => sum + (workout.duration || 0),
        0
      );
      const averageDuration =
        totalWorkouts > 0 ? Math.round(totalTime / totalWorkouts) : 0;

      setStats({
        totalWorkouts,
        totalTime,
        averageDuration,
      });

      // Get last workout
      if (workouts.length > 0) {
        const latestWorkout = workouts[0];
        const exerciseCount = latestWorkout.exercises?.length || 0;
        const setCount =
          latestWorkout.exercises?.reduce(
            (sum: number, ex: any) => sum + (ex.sets?.length || 0),
            0
          ) || 0;

        setLastWorkout({
          date: latestWorkout.date,
          duration: latestWorkout.duration || 0,
          exerciseCount,
          setCount,
        });
      }
    } catch (error) {
      console.error("Error loading home data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = () => {
    startWorkout();
    router.push("/active-workout");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatWorkoutDate = (dateString: string) => {
    const workoutDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time parts for accurate date comparison
    workoutDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);

    if (workoutDate.getTime() === today.getTime()) {
      return "Today";
    } else if (workoutDate.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else {
      return workoutDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Loading your data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <Header userName={userName} />
        <Content
          stats={stats}
          lastWorkout={lastWorkout}
          formatTime={formatTime}
          formatWorkoutDate={formatWorkoutDate}
          onStartWorkout={handleStartWorkout}
        />
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
}

function Header({ userName }: { userName: string }) {
  return (
    <View className="px-6 py-2 bg-gray-50">
      <Text className="text-lg font-bold text-gray-500">Welcome back,</Text>
      <Text className="text-2xl font-bold text-gray-900">{userName}! 💪</Text>
    </View>
  );
}

function Content({
  stats,
  lastWorkout,
  formatTime,
  formatWorkoutDate,
  onStartWorkout,
}: {
  stats: WorkoutStats;
  lastWorkout: LastWorkout | null;
  formatTime: (seconds: number) => string;
  formatWorkoutDate: (dateString: string) => string;
  onStartWorkout: () => void;
}) {
  const router = useRouter();

  return (
    <View className="flex-1 px-4 pb-20">
      {/* Stats Section */}
      <View className="mb-6">
        <View className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          {/* Title inside card */}
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Your Stats
          </Text>

          {/* Stats row */}
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-blue-600">
                {stats.totalWorkouts}
              </Text>
              <Text className="text-sm text-gray-500 mt-1">Total</Text>
              <Text className="text-sm text-gray-500">Workouts</Text>
            </View>

            <View className="items-center flex-1 border-gray-200">
              <Text className="text-2xl font-bold text-green-600">
                {formatTime(stats.totalTime)}
              </Text>
              <Text className="text-sm text-gray-500 mt-1">Total</Text>
              <Text className="text-sm text-gray-500">Time</Text>
            </View>

            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-purple-700">
                {formatTime(stats.averageDuration)}
              </Text>
              <Text className="text-sm text-gray-500 mt-1">Average</Text>
              <Text className="text-sm text-gray-500">Duration</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="mb-6">
        <Text className="text-lg font-bold text-gray-900 mb-4">
          Quick Actions
        </Text>

        <View className="flex-row gap-4 mb-4">
          <TouchableOpacity
            className="flex-1 bg-blue-600 rounded-xl p-4"
            onPress={onStartWorkout}
          >
            <View className="flex-row items-center justify-between">
              {/* Left content */}
              <View className="flex-1 items-center">
                <Ionicons name="fitness" size={40} color="white" />
                <Text className="text-white text-xl font-semibold mt-2 text-center">
                  Start Workout
                </Text>
                <Text className="text-blue-100 text-md text-center">
                  Begin your training session
                </Text>
              </View>

              {/* Right side icon */}
              <Ionicons
                name="chevron-forward-outline"
                size={28}
                color="white"
              />
            </View>
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-4">
          <TouchableOpacity
            className="flex-1 bg-white rounded-xl p-4 border border-gray-200"
            onPress={() => router.push("/(tabs)/history")}
          >
            <View className="items-center">
              <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mb-1">
                <Ionicons name="time-outline" size={24} color="#6B7280" />
              </View>
              <Text className="text-gray-900 font-bold mt-2">Workout</Text>
              <Text className="text-gray-900 font-bold">History</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-white rounded-xl p-4 border border-gray-200"
            onPress={() => router.push("/(tabs)/exercises")}
          >
            <View className="items-center">
              <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mb-1">
                <Ionicons name="barbell-outline" size={24} color="#6B7280" />
              </View>
              <Text className="text-gray-900 font-bold mt-2">Browse</Text>
              <Text className="text-gray-900 font-bold">Exercises</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Last Workout */}
      {lastWorkout && (
        <View>
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Last Workout
          </Text>

          <TouchableOpacity
            className="bg-white rounded-xl p-4 border border-gray-200"
            onPress={() => router.push("/(tabs)/history")}
          >
            <View className="flex-row justify-between items-center py-1">
              {/* Left section */}
              <View>
                <Text className="text-gray-900 text-lg font-bold">
                  {formatWorkoutDate(lastWorkout.date)}
                </Text>

                {/* Time with clock icon */}
                <View className="flex-row items-center mt-1">
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color="#6B7280"
                    className="mr-1"
                  />
                  <Text className="text-gray-600 text-base ml-1">
                    {formatTime(lastWorkout.duration)}
                  </Text>
                </View>

                <Text className="text-gray-500 text-base mt-2">
                  {lastWorkout.exerciseCount} exercises - {lastWorkout.setCount}{" "}
                  sets
                </Text>
              </View>

              {/* Right section */}
              <View className="items-center flex flex-col gap-4">
                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="fitness" size={24} color="#3B82F6" />
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#9CA3AF"
                  className="mr-2"
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function BottomNavigation() {
  const router = useRouter();
  const currentRoute = "/"; // You can use usePathname() from expo-router if available

  return (
    <View className="flex-row bg-white border-t border-gray-200 px-4 py-3 absolute bottom-0 left-0 right-0">
      <TouchableOpacity
        className="flex-1 items-center"
        onPress={() => router.push("/")}
      >
        <Ionicons name="home" size={24} color="#3B82F6" />
        <Text className="text-blue-600 text-xs mt-1">Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="flex-1 items-center"
        onPress={() => router.push("/(tabs)/exercises")}
      >
        <Ionicons name="barbell" size={24} color="#9CA3AF" />
        <Text className="text-gray-500 text-xs mt-1">Exercises</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="flex-1 items-center"
        onPress={() => router.push("/active-workout")}
      >
        <Ionicons name="add-circle" size={24} color="#9CA3AF" />
        <Text className="text-gray-500 text-xs mt-1">Workout</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="flex-1 items-center"
        onPress={() => router.push("/follow")}
      >
        <Ionicons name="people" size={24} color="#9CA3AF" />
        <Text className="text-gray-500 text-xs mt-1">Follow</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="flex-1 items-center"
        onPress={() => router.push("/(tabs)/profile")}
      >
        <Ionicons name="person" size={24} color="#9CA3AF" />
        <Text className="text-gray-500 text-xs mt-1">Profile</Text>
      </TouchableOpacity>
    </View>
  );
}
