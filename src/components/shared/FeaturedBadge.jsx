import React from "react";
import FeaturedBadge from "../shared/FeaturedBadge";

const YourComponent = ({ caseItem }) => {
  return (
    <div>
      {caseItem.featured && <FeaturedBadge />}
      {/* ...other components and markup... */}
    </div>
  );
};

export default YourComponent;
