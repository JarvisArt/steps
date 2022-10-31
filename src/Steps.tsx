/* eslint react/no-did-mount-set-state: 0, react/prop-types: 0 */
import React from 'react';
import classNames from 'classnames';
import type { Status, Icons } from './interface';
import Step from './Step';
import type { StepProps } from './Step';

export type StepIconRender = (info: {
  index: number;
  status: Status;
  title: React.ReactNode;
  description: React.ReactNode;
  node: React.ReactNode;
}) => React.ReactNode;

export type ProgressDotRender = (
  iconDot,
  info: {
    index: number;
    status: Status;
    title: React.ReactNode;
    description: React.ReactNode;
  },
) => React.ReactNode;

export interface StepsProps {
  prefixCls?: string;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
  type?: 'default' | 'navigation' | 'inline';
  labelPlacement?: 'horizontal' | 'vertical';
  iconPrefix?: string;
  status?: Status;
  size?: 'default' | 'small';
  current?: number;
  progressDot?: ProgressDotRender | boolean;
  stepIcon?: StepIconRender;
  initial?: number;
  icons?: Icons;
  items?: StepProps[];
  itemRender?: (item: StepProps, stepItem: React.ReactNode) => React.ReactNode;
  onChange?: (current: number) => void;
}

export default class Steps extends React.Component<StepsProps> {
  static Step = Step;

  static defaultProps = {
    type: 'default',
    prefixCls: 'rc-steps',
    iconPrefix: 'rc',
    direction: 'horizontal',
    labelPlacement: 'horizontal',
    initial: 0,
    current: 0,
    status: 'process',
    size: '',
    progressDot: false,
  };

  onStepClick = (next: number) => {
    const { onChange, current } = this.props;
    if (onChange && current !== next) {
      onChange(next);
    }
  };

  render() {
    const {
      prefixCls,
      style = {},
      className,
      children,
      direction,
      type,
      labelPlacement,
      iconPrefix,
      status,
      size,
      current,
      progressDot,
      stepIcon,
      initial,
      icons,
      onChange,
      itemRender,
      items = [],
      ...restProps
    } = this.props;
    const isNav = type === 'navigation';
    const isInline = type === 'inline';

    // inline type requires fixed progressDot direction size.
    const mergeProgressDot = isInline || progressDot;
    const mergeDirection = isInline ? 'horizontal' : direction;
    const mergeSize = isInline ? undefined : size;

    const adjustedLabelPlacement = mergeProgressDot ? 'vertical' : labelPlacement;
    const classString = classNames(prefixCls, `${prefixCls}-${mergeDirection}`, className, {
      [`${prefixCls}-${mergeSize}`]: mergeSize,
      [`${prefixCls}-label-${adjustedLabelPlacement}`]: mergeDirection === 'horizontal',
      [`${prefixCls}-dot`]: !!mergeProgressDot,
      [`${prefixCls}-navigation`]: isNav,
      [`${prefixCls}-inline`]: isInline,
    });

    return (
      <div className={classString} style={style} {...restProps}>
        {(items || [])
          .filter((item) => item)
          .map((item, index) => {
            const stepNumber = initial + index;
            // fix tail color
            if (status === 'error' && index === current - 1) {
              item.className = `${prefixCls}-next-error`;
            }

            if (!item.status) {
              if (stepNumber === current) {
                item.status = status;
              } else if (stepNumber < current) {
                item.status = 'finish';
              } else {
                item.status = 'wait';
              }
            }

            if (isInline) {
              item.icon = undefined;
              item.subTitle = undefined;
            }

            if (!item.render && itemRender) {
              item.render = (stepItem) => itemRender(item, stepItem);
            }

            return (
              <Step
                {...item}
                active={stepNumber === current}
                stepNumber={stepNumber + 1}
                stepIndex={stepNumber}
                key={stepNumber}
                prefixCls={prefixCls}
                iconPrefix={iconPrefix}
                wrapperStyle={style}
                progressDot={mergeProgressDot}
                stepIcon={stepIcon}
                icons={icons}
                onStepClick={onChange && this.onStepClick}
              />
            );
          })}
      </div>
    );
  }
}
