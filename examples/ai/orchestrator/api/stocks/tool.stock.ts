export default guard(
  async (args) => {
    return {
      stocks: 205,
      company: args.company,
    };
  },
  {
    description: "Get the stock information for a given company",
    input: {
      type: "object",
      properties: {
        company: { type: "string", description: "Company name" },
      },
      required: ["company"],
    },
  }
);
