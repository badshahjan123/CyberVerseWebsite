import React from "react";
import { 
  Layers, Hash, Activity, Globe, Router, BookOpen 
} from "lucide-react";
import InteractiveRoomBase from "./InteractiveRoomBase";
import { 
  NETWORKING_ROOM_DATA, 
  NETWORKING_BADGES, 
  NETWORKING_QUIZ 
} from "./room_data/networking";
import { 
  OsiModelAnimation, 
  RoutingAnimation 
} from "../../components/rooms/RoomAnimations";

const NetworkingFundamentalsRoom = () => {
    const getAnimation = (taskId) => {
        switch (taskId) {
            case 1:
            case 3: return <OsiModelAnimation />;
            case 2:
            case 4:
            case 5: return <RoutingAnimation />;
            default: return null;
        }
    };

    const getIcon = (iconName) => {
        const icons = {
            layers: <Layers size={18} />,
            hash: <Hash size={18} />,
            activity: <Activity size={18} />,
            globe: <Globe size={18} />,
            router: <Router size={18} />
        };
        return icons[iconName] || <BookOpen size={18} />;
    };

    return (
        <InteractiveRoomBase 
            data={NETWORKING_ROOM_DATA}
            badges={NETWORKING_BADGES}
            quiz={NETWORKING_QUIZ}
            getAnimation={getAnimation}
            getIcon={getIcon}
        />
    );
};

export default NetworkingFundamentalsRoom;
