import React from "react";
import { 
  Globe, Activity, Code, Lock, Server, BookOpen 
} from "lucide-react";
import InteractiveRoomBase from "./InteractiveRoomBase";
import { 
  REST_API_ROOM_DATA, 
  REST_API_BADGES, 
  REST_API_QUIZ 
} from "./room_data/restApi";
import { 
  ApiFlowAnimation, 
  JsonParserAnimation 
} from "../../components/rooms/RoomAnimations";

const RestApiRoom = () => {
    const getAnimation = (taskId) => {
        switch (taskId) {
            case 1:
            case 2:
            case 4: return <ApiFlowAnimation />;
            case 3:
            case 5: return <JsonParserAnimation />;
            default: return null;
        }
    };

    const getIcon = (iconName) => {
        const icons = {
            globe: <Globe size={18} />,
            activity: <Activity size={18} />,
            code: <Code size={18} />,
            lock: <Lock size={18} />,
            server: <Server size={18} />
        };
        return icons[iconName] || <BookOpen size={18} />;
    };

    return (
        <InteractiveRoomBase 
            data={REST_API_ROOM_DATA}
            badges={REST_API_BADGES}
            quiz={REST_API_QUIZ}
            getAnimation={getAnimation}
            getIcon={getIcon}
        />
    );
};

export default RestApiRoom;
