import * as React from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function SignUp() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  // Handle sign-up
  const onSignUpPress = async () => {
    if (!isLoaded) return;
    if (!emailAddress || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // Send verification email
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setPendingVerification(true);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      setIsLoading(true);

      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center px-6">
          <Text className="text-2xl font-bold text-center mb-6">
            Verify your email
          </Text>
          <Ionicons name="key-outline" size={20} color="#6B7280" />
          <TextInput
            value={code}
            placeholder="Enter verification code"
            onChangeText={setCode}
            className="bg-white border border-gray-200 rounded-lg px-4 py-3 mb-4"
          />

          <TouchableOpacity
            onPress={onVerifyPress}
            disabled={isLoading}
            className={`rounded-xl shadow-sm py-3 ${
              isLoading ? "bg-gray-400" : "bg-blue-600"
            }`}
          >
            <Text className="text-center text-white font-semibold text-lg">
              {isLoading ? "Verifying..." : "Verify Email"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6 justify-center">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-blue-600 rounded-2xl items-center justify-center mb-4 shadow-lg">
              <Ionicons name="person-add" size={40} color="white" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Join Fit Tracker
            </Text>
            <Text className="text-lg text-gray-600 text-center">
              Create your account and start your fitness journey
            </Text>
          </View>

          {/* Form */}
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Email
              </Text>
              <TextInput
                autoCapitalize="none"
                value={emailAddress}
                placeholder="Enter email"
                onChangeText={setEmailAddress}
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Password
              </Text>
              <TextInput
                secureTextEntry
                value={password}
                placeholder="Enter password"
                onChangeText={setPassword}
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
              />
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            onPress={onSignUpPress}
            disabled={isLoading}
            className={`rounded-xl shadow-sm py-3 ${
              isLoading ? "bg-gray-400" : "bg-blue-600"
            }`}
          >
            <Text className="text-center text-white font-semibold text-lg">
              {isLoading ? "Loading..." : "Continue"}
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600">Already have an account? </Text>
            <Link href="/sign-in" asChild>
              <TouchableOpacity activeOpacity={0.7}>
                <Text className="text-blue-600 font-semibold">Sign in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
