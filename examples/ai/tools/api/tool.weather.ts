"get the weather information for a given city";

export default async (args) => {
  console.log("weather tool called", args);
  return {
    temperature: 40,
    condition: "Cloudy",
    location: args.city,
  };
};
