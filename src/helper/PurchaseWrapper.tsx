import { useState } from "react";
import { PurchaseBill } from "../components/PurchaseBill";

export const PurchaseWrapper = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <PurchaseBill key={refreshKey} setRefreshKey={setRefreshKey} />
  );
};
