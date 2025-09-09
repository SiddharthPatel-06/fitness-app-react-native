// app/(app)/(tabs)/workout.tsx
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

const Workout = () => {
  const router = useRouter();

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <SafeAreaView className="flex-1 bg-gray-100">
        {/* Main Content - Centered */}
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-3xl font-bold text-black text-center mb-3">
            Ready to Train?
          </Text>
          <Text className="text-gray-500 text-center text-base">
            Start your workout session
          </Text>
        </View>

        {/* Bottom Card */}
        <View className="mx-4 mb-24">
          <View className="bg-white rounded-2xl p-4 py-6">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="fitness" size={24} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-black">
                  Start Workout
                </Text>
                <Text className="text-sm text-gray-500">
                  Begin your training session
                </Text>
              </View>
              <Text className="bg-green-200 py-1 px-3 rounded-xl text-xs text-green-700 font-medium">
                Ready
              </Text>
            </View>

            <TouchableOpacity
              className="bg-blue-600 py-4 mx-2 rounded-xl items-center"
              onPress={() => router.push("/active-workout")}
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-lg">
                ▶ Start Workout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

export default Workout;
