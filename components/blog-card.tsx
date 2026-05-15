import React from "react";
import GridCell from "./Grid/grid-cell";

interface BlogCardProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  rowStart: number;
  rowEnd: number;
  title: string;
  link: string;
}

const BlogCard = ({ id, rowStart, rowEnd, title, link, ...props }: BlogCardProps) => {
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
        columnEnd={18}
        rowStart={rowStart}
        rowEnd={rowStart + 3}
        {...props}
      >
        <a
          className="text-xs sm:text-xl md:text-xl font-mono font-bold"
          href={link}
          target="_blank"
          rel="noreferrer"
        >
          {title}
        </a>
      </GridCell>
    </>
  );
};

export default BlogCard;
