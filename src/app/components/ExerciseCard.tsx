import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";

interface Props {
  exercise: {
    _id: string;
    name: string;
    description: string;
    difficulty: string;
    imageUrl?: string;
    videoUrl?: string;
  };
  onPress: () => void;
}

export default function ExerciseCard({ exercise, onPress }: Props) {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-200 text-green-800";
      case "intermediate":
        return "bg-yellow-200 text-yellow-800";
      case "advanced":
        return "bg-red-200 text-red-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <TouchableOpacity onPress={onPress} className="mb-4 flex-row bg-gray-100 rounded-xl shadow p-4">
      {exercise.imageUrl && (
        <Image
          source={{ uri: exercise.imageUrl }}
          className="w-24 h-24 rounded-lg mr-4"
        />
      )}
      <View className="flex-1 justify-center">
        <Text className="text-lg font-bold mb-1">{exercise.name}</Text>
        <Text className="text-gray-700 mb-2" numberOfLines={2}>
          {exercise.description}
        </Text>
        <View
          className={`px-2 py-1 rounded-full w-auto self-start ${getDifficultyColor(
            exercise.difficulty
          )}`}
        >
          <Text className="font-semibold text-sm">{exercise.difficulty.toUpperCase()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
