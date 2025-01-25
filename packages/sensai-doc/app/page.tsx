export default async () => {
  const routes = await getRoutes();
  return (
    <ul>
      {routes.map((route) => (
        <li key={route}>{route}</li>
      ))}
    </ul>
  );
};

const getRoutes = async (): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // resolve random string
      resolve(
        [...Array(10)].map(() => Math.random().toString(36).substring(7))
      );
    }, 3000);
  });
};
