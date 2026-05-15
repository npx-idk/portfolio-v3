import React from "react";
import GridCell from "./Grid/grid-cell";

interface ExperienceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  jobTitle: string;
  companyName: string;
  date: string;
  skills: string[];
  id: string;
  rowStart: number;
  rowEnd: number;
}

const ExperienceCard = ({
  jobTitle,
  companyName,
  date,
  id,
  rowStart,
  rowEnd,
  ...props
}: ExperienceCardProps) => {
  return (
    <>
      <GridCell
        columnStart={2}
        columnEnd={4}
        rowStart={rowStart}
        rowEnd={rowEnd}
        {...props}
      >
        <p className="text-xs sm:text-xl md:text-3xl font-bold">{id}</p>
      </GridCell>
      <GridCell
        className="justify-start pl-3"
        columnStart={4}
        columnEnd={12}
        rowStart={rowStart}
        rowEnd={rowStart}
        {...props}
      >
        <p className="text-xs sm:text-xl md:text-2xl font-mono font-bold">
          {companyName}
        </p>
      </GridCell>
      <GridCell
        className="justify-start pl-3"
        columnStart={4}
        columnEnd={12}
        rowStart={rowStart + 1}
        rowEnd={rowStart + 1}
        {...props}
      >
        <p className="text-xs sm:text-xl md:text-2xl font-mono font-light">
          {jobTitle}
        </p>
      </GridCell>
      <GridCell
        className="justify-start pl-3"
        columnStart={12}
        columnEnd={18}
        rowStart={rowStart}
        rowEnd={rowEnd}
        {...props}
      >
        <p className="text-xs sm:text-xl md:text-3xl font-mono">{date}</p>
      </GridCell>
    </>
  );
};

export default ExperienceCard;
