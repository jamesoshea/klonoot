export const About = () => {
  return (
    <div className="modal-box p-3 rounded-md">
      <form method="dialog">
        {/* if there is a button in form, it will close the modal */}
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
          ✕
        </button>
      </form>
      <div className="collapse collapse-arrow bg-base-100 mt-7">
        <input type="checkbox" name="my-accordion-2" />
        <div className="collapse-title font-semibold">Manifesto</div>
        <div className="collapse-content text-sm">
          This is a project mainly born out of spite. Spite is a powerful
          motivator, but one usually harnessed by the worst bastards on this
          planet. But spite only makes the world more miserable when it is aimed
          at your peers, or those less fortunate than yourself.
          <br />
          <br />
          My spite is directed upwards, and I encourage you to direct yours
          upward too. My spite is directed at the founders of Komoot, who sold
          out their employees, their platform's users and the loyalties that
          they marketed their company upon.
          <br />
          <br />
          My spite is aimed at the entire concept of "business", the
          now-unavoidable layer of sludge that is smeared across almost all
          human endeavour, and which serves no-one other than the cowards who
          make a living off of it because they didn't dare to pursue something
          useful. Be a nurse. Be an artist. Be a bin-man. Be a bus driver. Be
          the pensioner who throws seeds around because it might make someone's
          day to see a wildflower where they didn't expect it.
          <br />
          <br />
          Bending Spoons, the company who bought Komoot, have laid off 80% of
          its employees. This is business, this is what "makes sense", and is
          possible, to the stunted imaginations of people who do not understand
          others, the world, or anything outside of a quarterly planning
          meeting.
          <br />
          <br />
          That's why I wanted to make something as useful as Komoot sometimes
          is, but without the pitfalls of having to be a business. I want no
          part of that. <br />
          <br />
          Might makes spite.
        </div>
      </div>
      <div className="collapse collapse-arrow bg-base-100">
        <input type="checkbox" name="my-accordion-2" />
        <div className="collapse-title font-semibold">Planned Improvements</div>
        <div className="collapse-content">
          <h3>Technical Improvements</h3>
          <ul className="list">
            <li>- More automated testing</li>
            <li>- Test coverage</li>
          </ul>
          <h3 className="mt-2">Features</h3>
          <ul className="list">
            <li>- Undo / redo</li>
            <li>- Context menu on map marker click</li>
            <li>- GPX import</li>
            <li>- Optimistic UI updates for point drags</li>
            <li>
              - Off-Route POIs (for example, shops, water fountains or bail-out
              public transport stops)
            </li>
          </ul>
        </div>
      </div>
      <div className="collapse collapse-arrow bg-base-100">
        <input type="checkbox" name="my-accordion-2" />
        <div className="collapse-title font-semibold">FAQ</div>
        <div className="collapse-content text-sm">Coming soon</div>
      </div>
    </div>
  );
};
