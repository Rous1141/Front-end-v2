import { useEffect, useState } from "react";
import { Box, Typography, IconButton, Avatar } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getGroupChatByAccountId } from "../../../api/ChatGroup/ChatGroupAPI";
import { AccountProps } from "../../../interface/IAccount";
import LoadingScreen from "../../common/LoadingScreen";

interface ChatProfile {
  chatGroudId: string;
  adminId: string;
  adminName: string;
}

interface ChatProfileListProps {
  setCurrentChat:React.Dispatch<React.SetStateAction<string>>
}
const ChatProfileList = ({ setCurrentChat }: ChatProfileListProps) => {
  const [profiles, setProfiles] = useState<ChatProfile[]>([]);
  const [onSelect,setOnSelect] =   useState("")
  const [isLoading,setIsLoading] = useState(false)
  useEffect(() => {
    const fetchGroupChats = async () => {
      setIsLoading(true)
      const data = sessionStorage.getItem("account");
      if(data){
        const account:AccountProps = JSON.parse(data); // Convert string back to object
        var accountId=account.UserId
        const response = await getGroupChatByAccountId(accountId);
        console.log("Profile: ",response)
        setProfiles(response.result);
      }
      setIsLoading(false)
    };
    fetchGroupChats();
  }, []);

  return (
    <>
    {isLoading?<LoadingScreen/>:""}
    <Box padding="10px" paddingBottom={0} paddingTop={0} width="100%" height="100vh" bgcolor="#D0E8FF" color="white">
      {/* Header */}
      <Box sx={{ width: "100%", backgroundColor: "#1E73BE", color: "white", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px", paddingTop: "16px", paddingBottom: "16px" }}>
        <Typography paddingLeft={"15px"} variant="h6" fontWeight="bold">Therapy Message</Typography>
        <IconButton sx={{ color: "white" }}>
          <ArrowBackIcon />
        </IconButton>
      </Box>


      {/* Chat List */}
      <Box sx={{ width: "100%", backgroundColor: "none", display: "flex", flexDirection: "column", gap: "10px", padding: "5px" }}>
        {profiles.map((profile) => (
          <Box key={profile.chatGroudId} sx={{ display: "flex", alignItems: "center", 
            backgroundColor: onSelect===profile.chatGroudId? "#A9D2FF":"#3d9aff", padding: "10px", borderRadius: "10px", cursor: "pointer" }}
            onClick={() => {
              setCurrentChat(profile.chatGroudId)
              setOnSelect(profile.chatGroudId)
              //alert("Click On Group: "+profile.chatGroudId)
            }}
          >
            <Avatar sx={{ bgcolor: "#6BA6FF", marginRight: "10px" }}>{profile.adminName[0]}</Avatar>
            <Box>
              <Typography fontWeight="bold" color="white">{profile.adminName}</Typography>
              <Typography color="white">{profile.chatGroudId}</Typography>
            </Box>
            {/* TODO */}
            <Typography sx={{ marginLeft: "auto", color: "white" }}>{}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
    </>
  );
};

export default ChatProfileList;
