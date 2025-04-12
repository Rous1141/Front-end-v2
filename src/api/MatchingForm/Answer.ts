import { baseUrl, headers } from "../Url";
import { axiosRead } from "../AxiosCRUD";

const url = baseUrl + "/ChatMessage/getgrouplog";

const getGroupChatMessage = async (chatGroupId: string) => {
    const props = {
        data: null,
        url: url+"/"+chatGroupId,
        headers: headers
    };

    const result = await axiosRead(props);

    if (result.success) {
        //console.log("Answer fetched successfully:", result.data);
        return result.data;
    } else {
        console.error("Error fetching Answer:", result.error);
        return result.error;
    }
};

export { getGroupChatMessage };
