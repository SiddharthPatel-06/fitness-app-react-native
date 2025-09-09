// app/(app)/_layout.tsx
import { useAuth } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

const Layout = () => {
  const { isSignedIn, isLoaded, userId, sessionId, getToken } = useAuth();

  console.log("isSignedIn >>>> ", isSignedIn);

  if (!isLoaded) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  return (
    <Stack>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="active-workout" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
};

export default Layout;