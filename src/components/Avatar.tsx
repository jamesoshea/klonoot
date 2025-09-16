import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";

import { useSessionContext } from "../contexts/SessionContext";
import { useLoadingContext } from "../contexts/LoadingContext";

export const Avatar = ({
  showEmail,
  onClick,
}: {
  showEmail: boolean;
  onClick: () => void;
}) => {
  const { loading } = useLoadingContext();
  const { session } = useSessionContext();

  return (
    <div className="flex flex-row-reverse items-center justify-between w-full">
      {loading ? (
        <span className="loading loading-spinner loading-xl"></span>
      ) : (
        <FontAwesomeIcon
          className={`cursor-pointer ${session || loading ? "" : "opacity-60"}`}
          icon={faCircleUser}
          size="2xl"
          onClick={onClick}
        />
      )}
      {session && showEmail && (
        <p className="text-xs opacity-60">Signed in as {session.user.email}</p>
      )}
    </div>
  );
};
