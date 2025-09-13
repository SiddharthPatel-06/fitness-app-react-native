import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  Modal,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface Props {
  exercise: {
    name: string;
    description: string;
    difficulty: string;
    imageUrl?: string;
    videoUrl?: string;
  };
  visible: boolean;
  onClose: () => void;
}

export default function ExerciseDetailModal({
  exercise,
  onClose,
  visible,
}: Props) {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-200 text-green-800";
      case "intermediate":
        return "bg-yellow-500 text-yellow-800";
      case "advanced":
        return "bg-red-200 text-red-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <Modal animationType="slide" transparent={false} visible={visible}>
      <View className="flex-1 bg-white">
        {/* Close Button */}
        <TouchableOpacity
          onPress={onClose}
          className="absolute bg-gray-500 rounded-full p-1 top-10 left-4 z-10"
        >
          <Feather name="x" size={26} color="white" />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {/* Image */}
          {exercise.imageUrl && (
            <Image
              source={{ uri: exercise.imageUrl }}
              className="w-full h-64"
              resizeMode="contain"
            />
          )}

          <View className="p-4 mt-16">
            <Text className="text-2xl font-bold mb-2">{exercise.name}</Text>

            <View
              className={`px-4 py-2 rounded-full w-auto self-start mb-2 ${getDifficultyColor(
                exercise.difficulty
              )}`}
            >
              <Text className="font-semibold text-black">
                {exercise.difficulty.toUpperCase()}
              </Text>
            </View>

            <Text className="text-gray-700 mb-4">{exercise.description}</Text>

            {exercise.videoUrl && (
              <TouchableOpacity
                onPress={() => Linking.openURL(exercise.videoUrl)}
              >
                <Text className="text-blue-600 underline mb-4">
                  Watch Video Tutorial
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity className="bg-blue-600 py-4 mb-2 rounded-lg items-center">
              <Text className="text-white font-bold">
                Get AI Guidance on Form & Technique
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-300 py-4 rounded-lg items-center"
            >
              <Text className="text-black font-bold">Close</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
