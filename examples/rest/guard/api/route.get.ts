export default guard(async (data) => {
  return `hello ${data?.name || "world"}`;
});
