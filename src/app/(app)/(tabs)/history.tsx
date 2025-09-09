import React, { useEffect, useState, useRef } from "react";
import {
  SafeAreaView,
  Text,
  FlatList,
  View,
  RefreshControl,
} from "react-native";
import { client } from "../../../lib/sanity/client";
import WorkoutCard from "../../components/WorkoutCard";
import WorkoutDetailModal from "../../components/WorkoutDetailModal";
import { Ionicons } from "@expo/vector-icons";

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

export default function HistoryPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Workout | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    loadWorkouts();
    return () => {
      mounted.current = false;
    };
  }, []);

  async function loadWorkouts() {
    try {
      const q = `*[_type == "workout"] | order(date desc){
        _id,
        date,
        duration,
        exercises[]{ 
          "exercise": exercise->{_id, name, "imageUrl": image.asset->url},
          "sets": sets[]{ reps, weight, weightUnit }
        }
      }`;

      // await new Promise((resolve) => setTimeout(resolve, 5000));
      const data: Workout[] = await client.fetch(q);
      if (mounted.current) {
        setWorkouts(data);
      }
    } catch (err) {
      console.error("fetch workouts", err);
    } finally {
      if (mounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkouts();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Ionicons name="fitness-outline" size={32} color="#4B5563" />
        <Text className="mt-2 text-gray-600 font-medium">
          Loading history...
        </Text>
        <Text className="text-gray-500 mt-1">
          Your history will appear here
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 p-4">
      <View className="flex-row justify-between items-end mb-4">
        <View>
          <Text className="text-2xl font-bold">Workout History</Text>
          <Text className="text-sm text-gray-500">
            {workouts.length} workouts completed
          </Text>
        </View>
      </View>

      <FlatList
        data={workouts}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="transparent" // hide spinner on iOS
            colors={["transparent"]}
          />
        }
        contentContainerStyle={{ paddingBottom: 60 }}
        renderItem={({ item }) => (
          <WorkoutCard workout={item} onPress={() => setSelected(item)} />
        )}
        ListHeaderComponent={
          refreshing ? (
            <View className="items-center py-4">
              <Ionicons name="fitness-outline" size={48} color="#4B5563" />
              <Text className="mt-2 text-gray-600 font-bold text-xl">
                Loading history...
              </Text>
              <Text className="text-gray-500 text-sm mt-1">
                Your history will appear here
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={() => (
          <View className="items-center mt-20">
            <Text className="text-gray-500">No workout history yet.</Text>
          </View>
        )}
      />

      {selected && (
        <WorkoutDetailModal
          visible={true}
          workout={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </SafeAreaView>
  );
}
