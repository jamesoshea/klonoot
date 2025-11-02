import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";

import { useSessionContext } from "../contexts/SessionContext";
import { useLoadingContext } from "../contexts/LoadingContext";

export const Avatar = ({ showEmail, onClick }: { showEmail: boolean; onClick: () => void }) => {
  const { loading } = useLoadingContext();
  const { session } = useSessionContext();

  return (
    <div className="flex flex-row-reverse items-center justify-start gap-2 w-full">
      {loading ? (
        <span className="loading loading-spinner loading-lg text-neutral max-h-[19.2px] max-w-[19.2px]" />
      ) : (
        <FontAwesomeIcon
          className={`cursor-pointer text-neutral ${session || loading ? "" : "opacity-60"}`}
          icon={faCircleUser}
          size="xl"
          onClick={onClick}
        />
      )}
      {showEmail && (
        <p className="text-center text-xs opacity-60 flex-grow">
          {session ? `Signed in as ${session.user.email}` : "Not signed in"}
        </p>
      )}
    </div>
  );
};
