import { useState } from "react";
import { PurchaseBill } from "../PurchaseBill";

export const PurchaseWrapper = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <PurchaseBill key={refreshKey} setRefreshKey={setRefreshKey} />
  );
};
