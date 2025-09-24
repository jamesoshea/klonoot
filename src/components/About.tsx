export const About = () => {
  return (
    <div className="text-xs">
      <div className="collapse collapse-arrow bg-base-100">
        <input type="checkbox" name="my-accordion-2" />
        <div className="collapse-title">Planned Improvements</div>
        <div className="collapse-content">
          <h3>Technical Improvements</h3>
          <ul className="list">
            <li>- More automated testing</li>
            <li>- Test coverage</li>
          </ul>
          <h3 className="mt-2">Features</h3>
          <ul className="list">
            <li>- Incline stats when mousing over route track</li>
            <li>
              - Optimistic UI updates for point drags (only querying for parts of route from brouter
              to improve performance)
            </li>
            <li>
              - Off-Route POIs (for example, shops, water fountains or bail-out public transport
              stops)
            </li>
            <li>- GPX import</li>
            <li>- Bulk route export</li>
          </ul>
        </div>
      </div>
      <div className="collapse collapse-arrow bg-base-100">
        <input type="checkbox" name="my-accordion-2" />
        <div className="collapse-title">FAQ</div>
        <div className="collapse-content text-sm">Coming soon</div>
      </div>
      <div className="collapse collapse-arrow bg-base-100">
        <input type="checkbox" name="my-accordion-2" />
        <div className="collapse-title">Source code</div>
        <div className="collapse-content text-sm">
          The code for this UI is available at{" "}
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
