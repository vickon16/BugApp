import React, { PropsWithChildren } from "react";
import { useInView } from "react-intersection-observer";

interface Props extends PropsWithChildren {
  onBottomReached: () => void;
  className?: string;
}

const InfiniteScrollContainer = ({
  children,
  onBottomReached,
  className,
}: Props) => {
  const { ref } = useInView({
    rootMargin: "150px", // room of 150px before triggering loading in view
    onChange(inView) {
      if (inView) onBottomReached();
    },
  });
  return (
    <div className={className}>
      {children}
      <div ref={ref} />
    </div>
  );
};

export default InfiniteScrollContainer;
