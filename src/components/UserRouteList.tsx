import { useGetUserRoutes } from "../queries/useGetUserRoutes";

export const UserRouteList = () => {
  const { data: queryData, isFetching } = useGetUserRoutes();

  const userRoutes = queryData?.data ?? [];

  return isFetching ? null : (
    <select
      defaultValue={userRoutes?.[0]?.id ?? null}
      className="select select-ghost"
    >
      {userRoutes.map((userRoute) => (
        <option value={userRoute.id}>{userRoute.name}</option>
      ))}
    </select>
  );
};
