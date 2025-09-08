import { MapPinCheckIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { Link } from "react-router-dom";

const FriendCard = ({ friend }) => {
  
  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-3">

          <div className="avatar w-12">
            <img src={friend.profilePic} alt={friend.fullName} />
          </div>

          <div>
            <h3 className="text-lg font-bold">{friend.fullName}</h3>
            
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-sm">
          {/* Phone */}
          <div className="flex items-center gap-2">
            <PhoneIcon className="w-4 h-4" />
            <span>{friend.phone}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 opacity-90">
            <MapPinIcon className="w-4 h-4" />
            <span>{friend.location}</span>
          </div>
        </div>


        <Link to={`/chat/${friend._id}`} className="btn btn-outline w-full">
          Message
        </Link>
      </div>
    </div>
  );
};
export default FriendCard;
