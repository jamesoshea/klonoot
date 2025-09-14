import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";

export const AboutButton = () => {
  return (
    <div
      className="about"
      // @ts-expect-error yeah I know
      onClick={() => document.getElementById("about_modal")?.showModal()}
    >
      <div
        className={`bg-base-100 flex justify-center items-center py-1 w-10 rounded-full cursor-pointer`}
      >
        <FontAwesomeIcon icon={faCircleQuestion} size="2xl" />
      </div>
    </div>
  );
};
