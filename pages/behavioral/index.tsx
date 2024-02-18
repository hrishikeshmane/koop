import { useRouter } from "next/router";
import React from "react";

const Behavioral = () => {
  const routuer = useRouter();
  routuer.push("/behavioral/bq01");

  return <div></div>;
};

export default Behavioral;
