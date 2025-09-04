import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus } from "@fortawesome/free-solid-svg-icons";

import { useGetUserRoutes } from "../queries/useGetUserRoutes";
import { useCreateNewRoute } from "../queries/useCreateNewRoute";

export const UserRouteList = () => {
  const { data: queryData } = useGetUserRoutes();
  const {
    mutate: createNewUserRoute,
    isPending: createNewUserRouteMutationIsPending,
  } = useCreateNewRoute();

  const userRoutes = queryData?.data ?? [];

  const handleEditRouteName = () => {};

  return (
    <div className="flex justify-between items-center w-100">
      <select defaultValue={userRoutes?.[0]?.id ?? null} className="select">
        {userRoutes.map((userRoute) => (
          <option value={userRoute.id}>{userRoute.name}</option>
        ))}
      </select>
      <div className="flex justify-end gap-2">
        <button
          className="btn btn-circle w-8 h-8 btn-ghost"
          disabled={createNewUserRouteMutationIsPending}
          onClick={() => createNewUserRoute()}
        >
          <FontAwesomeIcon className="cursor-pointer" icon={faPlus} size="lg" />
        </button>
        <button
          className="btn btn-circle w-8 h-8 btn-ghost"
          onClick={handleEditRouteName}
        >
          <FontAwesomeIcon className="cursor-pointer" icon={faEdit} size="lg" />
        </button>
      </div>
    </div>
  );
};
