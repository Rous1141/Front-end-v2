import { useEffect, useState } from "react";
import { Box, Typography, IconButton, Avatar, Tooltip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getAllClientByChatGroupId, getGroupChatByAccountId } from "../../../api/ChatGroup/ChatGroupAPI";
import { AccountProps, ChatProfile, ChatProps, UserInGroup } from "../../../interface/IAccount";
import { useNavigate } from "react-router";

interface ChatProfileListProps {
  setCurrentChat: React.Dispatch<React.SetStateAction<ChatProps>>;
  isSeeker: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatProfileList = ({ setIsLoading, isSeeker, setCurrentChat }: ChatProfileListProps) => {
  const [profiles, setProfiles] = useState<ChatProfile[]>();
  const [onSelect, setOnSelect] = useState("");
  const nav = useNavigate();

  const returnHome = () => {
    nav("../");
  };

  useEffect(() => {
    const fetchGroupChats = async () => {
      setIsLoading(true);
      const data = sessionStorage.getItem("account");
      if (data) {
        const account: AccountProps = JSON.parse(data);
        const accountId = account.UserId;
        const response = await getGroupChatByAccountId(accountId);
        // Sort profiles: active chats (isDisabled === false) first
        if(response.statusCode !== 200){
          setProfiles([]);
        }
        else{
          const sortedProfiles = response.result.sort((a: ChatProfile, b: ChatProfile) =>
            a.isDisabled === b.isDisabled ? 0 : a.isDisabled ? 1 : -1
          );
          setProfiles(sortedProfiles);
        }
      }
      setIsLoading(false);
    };
    fetchGroupChats();
  }, [setIsLoading]);

  const getChatGroupInfo = async (profile: ChatProfile) => {
    const usersInGroup = await getAllClientByChatGroupId(profile.chatGroupId);
    if (usersInGroup.statusCode === 200) {
      const otherUser: UserInGroup = isSeeker
        ? usersInGroup.result.find((item: UserInGroup) => item.clientId !== profile.adminId)
        : usersInGroup.result.find((item: UserInGroup) => item.accountName === profile.adminName);
      if (otherUser) {
        setCurrentChat({
          chatGroupId: profile.chatGroupId,
          userInGroupId: profile.userInGroupId,
          name: profile.adminName,
          therapistId: profile.adminId,
          patientId: otherUser.clientId,
        });
      } else {
        alert("Cannot Open Chat");
      }
    }
  };

  return (
    <Box padding={0} width="100%" height="95vh" color="white">
      {/* Header */}
      <Box
        sx={{
          width: "auto",
          backgroundColor: "#1E73BE",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "5px",
          paddingBottom: "16px",
        }}
      >
        <Typography paddingLeft={"15px"} variant="h6" fontWeight="bold">
          Therapy Message
        </Typography>
        <IconButton onClick={returnHome} sx={{ color: "white" }}>
          <ArrowBackIcon />
        </IconButton>
      </Box>
      {/* Chat List */}
      <Box
        sx={{
          padding: "5px",
          height: "90vh", // Adjust height to fit under the header
          width: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          overflowY: "auto",
        }}
      >
        {Array.isArray(profiles) && profiles.length > 0 ? (
          profiles.map((profile) => (
            <Tooltip
              key={profile.chatGroupId} // Moved key to Tooltip for uniqueness
              title={profile.isDisabled ? "This appointment has ended" : ""}
              placement="right"
              disableHoverListener={!profile.isDisabled}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor:
                    onSelect === profile.chatGroupId
                      ? "#A9D2FF"
                      : profile.isDisabled
                      ? "lightgrey"
                      : "#3d9aff",
                  padding: "10px",
                  borderRadius: "10px",
                  cursor: profile.isDisabled ? "not-allowed" : "pointer",
                }}
                onClick={
                  !profile.isDisabled
                    ? () => {
                        getChatGroupInfo(profile);
                        setOnSelect(profile.chatGroupId);
                      }
                    : () => {}
                }
              >
                <Avatar sx={{ zIndex: 0, bgcolor: "#6BA6FF", marginRight: "10px" }}>
                  {profile.adminName[0]}
                </Avatar>
                <Box>
                  <Typography fontWeight="bold" color="white">
                    {profile.adminName}
                  </Typography>
                </Box>
                {/* TODO */}
                <Typography sx={{ marginLeft: "auto", color: "white" }}></Typography>
              </Box>
            </Tooltip>
          ))
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px 20px",
              backgroundColor: "#ffffff",
              borderRadius: "10px",
              textAlign: "center",
              margin: "40px ",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <img
              src="/chat_4574037.png"
              alt="No Messages"
              style={{
                width: "150px",
                height: "150px",
                marginBottom: "20px",
              }}
            />
            <Typography variant="h6" color="#1E73BE" fontWeight="bold" gutterBottom>
              No Appointment Available At The Moment
            </Typography>
            <Typography color="#666666" sx={{ maxWidth: "280px", marginBottom: "20px" }}>
              Let's find a therapist for you. Click the button below to start your journey.
            </Typography>
            <Box
              onClick={() => nav("/seeker")}
              sx={{
                backgroundColor: "#1E73BE",
                color: "white",
                padding: "10px 20px",
                borderRadius: "20px",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "#1557A0",
                },
              }}
            >
              <Typography>Start Now</Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatProfileList;