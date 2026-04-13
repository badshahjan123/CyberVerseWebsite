import React, { lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
import InteractiveRoomBase from "./InteractiveRoomBase";
import ROOM_REGISTRY from "./roomRegistry.jsx";

const RoomDetail = lazy(() => import("./RoomDetail"));

const DynamicRoom = () => {
  const { id } = useParams();
  const room = ROOM_REGISTRY[id];

  if (room) {
    return (
      <InteractiveRoomBase
        data={room.data}
        badges={room.badges}
        quiz={room.quiz}
        getAnimation={room.getAnimation}
        getIcon={room.getIcon}
      />
    );
  }

  // Fall through to API-backed room detail for non-registry rooms
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "rgb(8,12,16)" }} />}>
      <RoomDetail />
    </Suspense>
  );
};

export default DynamicRoom;
