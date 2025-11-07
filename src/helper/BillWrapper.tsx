import { useState } from "react";
import { Bill } from "../components/Bill";

export const BillWrapper = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <Bill key={refreshKey} setRefreshKey={setRefreshKey} />
  );
};
