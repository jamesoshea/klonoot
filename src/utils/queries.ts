type OverpassQueryParams = {
  bbox: GeoJSON.BBox;
  queryString: string;
};

export const buildOverpassQuery = ({ bbox, queryString }: OverpassQueryParams) => `
    https://overpass-api.de/api/interpreter?data=
        [out:json]
        [timeout:30]
        [bbox:${[bbox[1], bbox[0], bbox[3], bbox[2]].join(",")}];
        (
            ${queryString}
        );
        out body;
        out meta;
        >;
        out skel qt;
`;
