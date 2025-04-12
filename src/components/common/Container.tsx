import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

const Container = ({ children, className = "" }: ContainerProps) => {
  return (
    <div className={`flex h-screen overflow-x-hidden bg-background ${className}`}>
      {children}
    </div>
  );
};

export default Container;
