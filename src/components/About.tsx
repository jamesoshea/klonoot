export const About = () => {
  return (
    <div>
      <div className="collapse bg-base-100">
        <input type="checkbox" name="my-accordion-2" />
        <div className="collapse-title text-sm">What is this?</div>
        <div className="collapse-content text-xs">
          Thanks for asking :) This is an attempt to focus and improve the features found on a
          certain large platform for bicycle route planning. Since that platform was sold, I became
          interested in developng something with a similiarly intuitive UI, but based upon as much
          open-source software as possible. I also wanted to make the tool itself open-source.
          <br />
          <br />
          Please feel free to send me feedback / requests / offers to contribute on github (link
          below). I will also set up an email soon.
        </div>
      </div>
      <div className="collapse bg-base-100">
        <input type="checkbox" name="my-accordion-2" />
        <div className="collapse-title text-sm">Source code</div>
        <div className="collapse-content text-xs">
          The code for this tool is available at{" "}
          <a
            className="text-secondary"
            href="https://github.com/jamesoshea/klonoot"
            target="_blank"
          >
            https://github.com/jamesoshea/klonoot
          </a>
        </div>
      </div>
    </div>
  );
};
