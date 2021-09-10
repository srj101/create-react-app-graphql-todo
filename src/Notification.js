import { useSubscription } from "@apollo/react-hooks";
import gql from "graphql-tag";
import React, { useEffect } from "react";

function Notification() {
  const TODOS_SUBSCRIPTION = gql`
    subscription {
      somethingChanged {
        id
        text
        complete
      }
    }
  `;

  const { data, loading } = useSubscription(TODOS_SUBSCRIPTION);

  return (
    <>
      <div className="notification">
        <span>{!loading && data.somethingChanged.text}</span>
      </div>
    </>
  );
}

export default Notification;
