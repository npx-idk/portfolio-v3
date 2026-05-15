import React from "react";
import GridCell from "./Grid/grid-cell";

interface ProjectsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  techStack: string[];
  github: string;
  link: string;
  rowStart: number;
  rowEnd: number;
  id: string;
}

const ProjectsCard = ({
  title,
  description,
  github,
  link,
  rowStart,
  rowEnd,
  id,
  ...props
}: ProjectsCardProps) => {
  return (
    <>
      <GridCell
        columnStart={2}
        columnEnd={4}
        rowStart={rowStart}
        rowEnd={rowEnd + 1}
        {...props}
      >
        <p className="text-xs sm:text-xl md:text-3xl font-bold">{id}</p>
      </GridCell>
      <GridCell
        className="justify-start pl-3"
        columnStart={4}
        columnEnd={8}
        rowStart={rowStart}
        rowEnd={rowStart}
        {...props}
      >
        <a
          className="text-xs sm:text-xl md:text-2xl font-bold"
          href={link}
          target="_blank"
          rel="noreferrer"
        >
          {title}
        </a>
      </GridCell>
      <GridCell
        columnStart={8}
        columnEnd={10}
        rowStart={rowStart}
        rowEnd={rowStart}
        {...props}
      >
        <a
          href={github}
          target="_blank"
          rel="noreferrer"
          className="text-xs sm:text-sm font-mono underline"
        >
          github
        </a>
      </GridCell>
      <GridCell
        className="items-center pl-3"
        columnStart={4}
        columnEnd={18}
        rowStart={rowStart + 1}
        rowEnd={rowStart + 4}
        {...props}
      >
        <p className="text-xs sm:text-xl md:text-xl lg:text-2xl font-mono font-light">
          {description}
        </p>
      </GridCell>
    </>
  );
};

export default ProjectsCard;
