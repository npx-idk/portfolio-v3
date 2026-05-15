"use client";

import Grid from "@/components/Grid/Grid";
import Window from "@/components/Window";
import { useEffect, useState } from "react";

const CELL_SIZE = 25;

export default function Page() {
  const [rows, setRows] = useState(55);
  const [columns, setColumns] = useState(40);

  useEffect(() => {
    const handleResize = () => {
      setRows(Math.max(Math.floor(window.innerHeight / CELL_SIZE), 55));
      setColumns(Math.floor(window.innerWidth / CELL_SIZE));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex items-start justify-center">
      <Grid rows={rows} columns={columns} cellSize={CELL_SIZE}>
        <Window
          rowStart={2}
          rowEnd={14}
          columnStart={2}
          columnEnd={18}
          headerRows={1}
          cellSize={CELL_SIZE}
          title="hello.txt"
        >
          <p className="p-3 text-sm font-mono">Window content goes here.</p>
        </Window>
      </Grid>
    </div>
  );
}
