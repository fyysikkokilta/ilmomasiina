import React, { AnchorHTMLAttributes, useEffect, useMemo } from 'react';

import { Options, stringify } from 'csv-stringify/browser/esm/sync';
import { Button } from 'react-bootstrap';

export type { Options as CSVOptions };

function makeCsvUrl(data: string[][], options?: Options) {
  const csv = stringify(data, options);
  const blob = new Blob([csv], { type: 'text/csv' });
  return URL.createObjectURL(blob);
}

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  data: string[][];
  csvOptions?: Options;
};

const CSVLink = ({
  data,
  csvOptions,
  ...props
}: Props) => {
  const url = useMemo(() => makeCsvUrl(data, csvOptions), [data, csvOptions]);

  // Revoke created URLs when they become unused
  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);

  return <Button as="a" variant="primary" href={url} {...props} />;
};

export default CSVLink;
