export default guard(
  async (args) => {
    return {
      temperature: 20,
      condition: "Cloudy",
      location: args.city,
    };
  },
  {
    description: "Get the weather information for a given city",
    input: {
      type: "object",
      properties: {
        city: { type: "string", description: "City name" },
      },
      required: ["city"],
    },
  }
);
