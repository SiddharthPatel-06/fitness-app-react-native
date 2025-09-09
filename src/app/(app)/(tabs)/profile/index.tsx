import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons, Feather } from "@expo/vector-icons";
import { client } from "../../../../lib/sanity/client";

type Workout = {
  _id: string;
  date: string;
  duration?: number;
};

export default function ProfilePage() {
  const { signOut } = useAuth();
  const { user } = useUser();

  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [daysActive, setDaysActive] = useState(0);
  const [avgDuration, setAvgDuration] = useState(0);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const q = `*[_type == "workout"]{ _id, date, duration }`;
      const data: Workout[] = await client.fetch(q);

      if (!data || data.length === 0) return;

      setTotalWorkouts(data.length);

      const totalSeconds = data.reduce((acc, w) => acc + (w.duration || 0), 0);
      setTotalTime(totalSeconds);

      const uniqueDays = new Set(
        data.map((w) => new Date(w.date).toDateString())
      );
      setDaysActive(uniqueDays.size);

      setAvgDuration(Math.floor(totalSeconds / data.length));
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  function formatDuration(sec: number) {
    if (!sec) return "0s";
    const s = sec % 60;
    const m = Math.floor((sec % 3600) / 60);
    const h = Math.floor(sec / 3600);
    if (h) return `${h}h ${m}m`;
    if (m) return `${m}m ${s}s`;
    return `${s}s`;
  }

  const handleSignOut = () => {
    Alert.alert("Confirm Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOut() },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <Text className="text-2xl font-bold mb-1">Profile</Text>
        <Text className="text-gray-500 mb-6">
          Manage your account and stats
        </Text>

        {/* User Card */}
        <View className="bg-white rounded-xl shadow p-4 flex-row items-center mb-4">
          <View className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden items-center justify-center mr-4">
            <Ionicons name="person-circle-outline" size={64} color="#2563eb" />
          </View>
          <View>
            <Text className="text-lg font-semibold">
              {user?.fullName || "User"}
            </Text>
            <Text className="text-sm text-gray-500">
              {user?.primaryEmailAddress?.emailAddress}
            </Text>
            <Text className="text-xs text-gray-400">
              Member since{" "}
              {new Date(user?.createdAt || Date.now()).toLocaleDateString(
                undefined,
                { month: "long", year: "numeric" }
              )}
            </Text>
          </View>
        </View>

        {/* Fitness Stats */}
        <View className="bg-white rounded-xl shadow p-4 mb-6">
          <Text className="text-lg font-semibold mb-4">Your Fitness Stats</Text>
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <Text className="text-xl font-bold text-blue-600">
                {totalWorkouts}
              </Text>
              <Text className="text-xs text-gray-500">Total Workouts</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-xl font-bold text-green-600">
                {formatDuration(totalTime)}
              </Text>
              <Text className="text-xs text-gray-500">Total Time</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-xl font-bold text-purple-600">
                {daysActive}
              </Text>
              <Text className="text-xs text-gray-500">Days Active</Text>
            </View>
          </View>
          <Text className="text-sm text-gray-500 mt-3">
            Average workout duration:{" "}
            <Text className="font-semibold">{formatDuration(avgDuration)}</Text>
          </Text>
        </View>

        {/* Account Settings */}
        <View className="bg-white rounded-xl shadow mb-6">
          <Text className="px-4 py-3 font-semibold text-gray-800">
            Account Settings
          </Text>

          <TouchableOpacity className="flex-row items-center px-4 py-3 border-t border-gray-100">
            <Feather name="user" size={20} color="#2563eb" />
            <Text className="ml-3 text-gray-700">Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center px-4 py-3 border-t border-gray-100">
            <Feather name="bell" size={20} color="#10b981" />
            <Text className="ml-3 text-gray-700">Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center px-4 py-3 border-t border-gray-100">
            <Feather name="settings" size={20} color="#8b5cf6" />
            <Text className="ml-3 text-gray-700">Preferences</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center px-4 py-3 border-t border-gray-100">
            <Feather name="help-circle" size={20} color="#f59e0b" />
            <Text className="ml-3 text-gray-700">Help & Support</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          onPress={handleSignOut}
          className="bg-red-500 py-3 rounded-xl flex-row items-center justify-center"
        >
          <Ionicons name="log-out-outline" size={22} color="white" />
          <Text className="ml-2 text-white font-semibold text-lg">
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
