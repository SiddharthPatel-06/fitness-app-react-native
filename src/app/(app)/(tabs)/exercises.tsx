import React, { useEffect, useState, useRef } from "react";
import {
  SafeAreaView,
  Text,
  FlatList,
  TextInput,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import ExerciseCard from "../../components/ExerciseCard";
import ExerciseDetailModal from "../../components/ExerciseDetailModal";
import { client } from "../../../lib/sanity/client";
import { Feather, Ionicons } from "@expo/vector-icons";

interface Exercise {
  _id: string;
  name: string;
  description: string;
  difficulty: string;
  imageUrl?: string;
  videoUrl?: string;
  isActive: boolean;
}

export default function Exercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filtered, setFiltered] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchExercises = async () => {
    try {
      const data: Exercise[] = await client.fetch(`*[_type == "exercise"]{
        _id,
        name,
        description,
        difficulty,
        "imageUrl": image.asset->url,
        videoUrl,
        isActive
      }`);
      const active = data.filter((e) => e.isActive);
      setExercises(active);
      setFiltered(active);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchExercises();
      setLoading(false);
    };
    loadData();
  }, []);

  const handleSearch = (text: string) => {
    setQuery(text);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (text.trim() === "") {
      setFiltered(exercises);
      setSearching(false);
      return;
    }

    setSearching(true);

    searchTimeout.current = setTimeout(() => {
      const result = exercises.filter((e) =>
        e.name.toLowerCase().includes(text.toLowerCase())
      );
      setFiltered(result);
      setSearching(false);
    }, 500);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExercises();
    if (query.trim() !== "") {
      const result = exercises.filter((e) =>
        e.name.toLowerCase().includes(query.toLowerCase())
      );
      setFiltered(result);
    } else {
      setFiltered(exercises);
    }
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000FF" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      <Text className="text-3xl pl-4 font-bold mb-4">Exercise Library</Text>

      {/* Search Bar */}
      {/* <View className="flex-row items-center mb-4 bg-gray-200 rounded-xl px-4 py-1">
        <Feather name="search" size={20} color="gray" />
        <TextInput
          placeholder="Search exercises..."
          className="ml-2 flex-1"
          value={query}
          onChangeText={handleSearch}
        />
      </View> */}

      <View className="bg-gray-100 rounded-lg px-4 py-3 mb-4 flex-row items-center">
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          placeholder="Search exercises..."
          className="ml-2 flex-1 text-gray-800"
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={handleSearch}
        />
      </View>

      {/* Loading while searching */}
      {searching && (
        <View className="items-center py-6">
          <Ionicons name="fitness-outline" size={48} color="#4B5563" />
          <Text className="mt-2 text-gray-600 font-bold text-xl">
            Searching exercises...
          </Text>
          <Text className="text-gray-500 text-sm mt-1">
            Please wait your exercise will be appear here
          </Text>
        </View>
      )}

      {/* No Results */}
      {!searching && filtered.length === 0 && (
        <Text className="text-center text-gray-500 mt-10 text-lg">
          No exercises found.
        </Text>
      )}

      {/* Exercises List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0000"]}
            title="Refreshing..."
            tintColor="#0000FF"
          />
        }
        renderItem={({ item }) => (
          <ExerciseCard
            exercise={item}
            onPress={() => setSelectedExercise(item)}
          />
        )}
      />

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          visible={true}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </SafeAreaView>
  );
}
