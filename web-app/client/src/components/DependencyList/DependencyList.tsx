import classNames from 'classnames';
import _ from 'lodash';
import { FC, ReactElement, useState } from 'react';
import LongArrowIcon from '@assets/icons/long-arrow.svg?component';
import { GeneralColumn } from '@utils/convertDependencies';
import styles from './DependencyList.module.scss';

type Props = {
  deps: {
    confidence?: any;
    rhs: GeneralColumn[];
    lhs: GeneralColumn[];
  }[];
  infoVisible: boolean;
};

const makeSide: (
  data: GeneralColumn | GeneralColumn[],
  infoVisible: boolean
) => ReactElement = (data, infoVisible) => {
  if (Array.isArray(data)) {
    return (
      <>
        {data.map((e) => (
          <span className={styles.attr}>
            {e.column.name}
            {infoVisible && e.pattern ? ' | ' + e.pattern : ''}
          </span>
        ))}
      </>
    );
  } else {
    return makeSide([data], infoVisible);
  }
};

const DependencyList: FC<Props> = ({ deps, infoVisible }) => {
  const [selectedRow, setSelectedRow] = useState<number | undefined>();

  return (
    <div>
      {_.map(deps, (row, i) => (
        <div
          key={i}
          className={classNames(
            styles.row,
            selectedRow === i && styles.selectedRow
          )}
          onClick={() => setSelectedRow(i)}
        >
          {makeSide(row.lhs, infoVisible)}
          <LongArrowIcon />
          {typeof row.confidence !== 'undefined' && <p>{row.confidence}</p>}
          {makeSide(row.rhs, infoVisible)}
        </div>
      ))}
    </div>
  );
};

export default DependencyList;
