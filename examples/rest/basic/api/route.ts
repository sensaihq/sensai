export default async (data) => {
  return `hello ${data?.name || "world"}`;
};
