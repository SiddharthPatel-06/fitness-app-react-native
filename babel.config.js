module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env", // your env file
          safe: false, // true if you have .env.example
          allowUndefined: true, // allows missing env vars without crashing
        },
      ],
    ],
  };
};
