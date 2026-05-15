"use client";

import Grid from "@/components/Grid/Grid";
import { useEffect, useState } from "react";

const ROW_WIDTH = 25;
const COLUMNS = 18;

export default function Page() {
  const [rows, setRows] = useState(55);

  useEffect(() => {
    const handleResize = () => {
      setRows(Math.max(Math.floor(window.innerHeight / ROW_WIDTH), 55));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex items-start justify-center mt-6">
      <Grid rows={rows} columns={COLUMNS}>
      </Grid>
    </div>
  );
}
