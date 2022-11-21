import { ComponentType } from 'react';
import { OptionProps } from 'react-select';
import { ColumnOption } from '@components/FilePropsView/FilePropsView';
import styles from '@components/FilePropsView/FilePropsView.module.scss';
import { Badge } from '@components/FileStats/Badge';
import { InputPropsBase } from '@components/Inputs';
import { Option as CustomOption } from '@components/Inputs/Select/customComponents';

export const OptionWithBadge: ComponentType<OptionProps & InputPropsBase> = ({
  children,
  ...props
}) => {
  const option = props.data as ColumnOption;

  return (
    <CustomOption {...props}>
      <div className={styles.option}>
        {children}
        {option.type && <Badge mode="secondary">{option.type}</Badge>}
        {option.categorical && <Badge>Categorical</Badge>}
      </div>
    </CustomOption>
  );
};
