import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";

import { useSessionContext } from "../contexts/SessionContext";
import { useLoadingContext } from "../contexts/LoadingContext";

export const Avatar = () => {
  const { loading } = useLoadingContext();
  const { session } = useSessionContext();

  return (
    <div
      className="auth"
      // @ts-expect-error yeah I know
      onClick={() => document.getElementById("auth_modal")?.showModal()}
    >
      <div
        className={`bg-base-100 flex justify-center items-center py-1 w-10 rounded-full cursor-pointer ${
          session || loading ? "" : "opacity-60"
        }`}
      >
        {loading ? (
          <span className="loading loading-spinner loading-xl"></span>
        ) : (
          <FontAwesomeIcon icon={faCircleUser} size="2xl" />
        )}
      </div>
    </div>
  );
};
